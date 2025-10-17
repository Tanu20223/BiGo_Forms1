const form = document.getElementById("loginForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = form.phone.value.trim();

  if (!phone || !/^\d{10}$/.test(phone)) {
    status.innerText = "❌ Please enter a valid 10-digit phone number";
    status.style.color = "red";
    return;
  }

  status.innerText = "Checking...";
  status.style.color = "blue";

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8LOGcHOdrGH48c2GLcNw6esEkF4R7kbgNraFn8hWsgDQCIfvyoTTJOeJvyO0cS-hpmQ/exec";

  try {
    const url = `${WEB_APP_URL}?action=getDetails&phone=${phone}&t=${Date.now()}`;
    
    // Try JSONP first (bypasses CORS)
    let result;
    try {
      result = await jsonpRequest(url);
    } catch (jsonpError) {
      // Fallback to regular fetch
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      result = await response.json();
    }

    console.log("API Response:", result);

    if (result.status === "found") {
      const data = result.data;
      
      // Convert all status fields to lowercase for comparison
      const mainStatus = (data.status || "").toLowerCase().trim();
      const verificationStatus = (data.verification || "").toLowerCase().trim();
      const groundVerificationStatus = (data['Ground Verification'] || "").toLowerCase().trim();

      console.log("Status check:", { 
        mainStatus, 
        verificationStatus, 
        groundVerificationStatus 
      });

      // CORRECTED LOGIC: Cumulative conditions
      if (mainStatus === "all done" && verificationStatus === "done" && groundVerificationStatus === "done") {
        // All three conditions met → vehicle.html
        window.location.href = `vehicle.html?phone=${encodeURIComponent(phone)}`;
      } else if (mainStatus === "all done" && verificationStatus === "done") {
        // First two conditions met → onground.html
        window.location.href = `onground.html?phone=${encodeURIComponent(phone)}`;
      } else if (mainStatus === "all done") {
        // Only first condition met → followup.html
        window.location.href = `followup2.html?phone=${encodeURIComponent(phone)}`;
      } else {
        // No special conditions met → interview.html
        window.location.href = `interview.html?phone=${encodeURIComponent(phone)}`;
      }
    } else if (result.status === "not_found") {
      status.innerText = "❌ Phone number not found. Please check the number or contact support.";
      status.style.color = "red";
    } else {
      status.innerText = "❌ Error: " + (result.message || "Unknown error occurred");
      status.style.color = "red";
    }

  } catch (err) {
    console.error("Fetch error:", err);
    status.innerHTML = `
      ❌ Connection Error: ${err.message}
      <br><br>
      <strong>Troubleshooting steps:</strong>
      <br>1. Check your internet connection
      <br>2. Make sure the Google Apps Script is deployed correctly
      <br>3. Try refreshing the page
    `;
    status.style.color = "red";
  }
});

// JSONP function for CORS bypass
function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    
    const script = document.createElement('script');
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    
    script.onerror = function() {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    document.body.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
        delete window[callbackName];
        reject(new Error('JSONP request timeout'));
      }
    }, 10000);
  });
}

