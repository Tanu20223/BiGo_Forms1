const form = document.getElementById("loginForm");
const status = document.getElementById("status");

// JSONP function
function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'callback_' + Date.now();
    
    window[callbackName] = function(data) {
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      resolve(data);
    };
    
    const script = document.createElement('script');
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    
    script.onerror = function() {
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(new Error('JSONP failed'));
    };
    
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
        delete window[callbackName];
        reject(new Error('JSONP timeout'));
      }
    }, 10000);
  });
}

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

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzvfM2ifKjmliFZA6ExBpacmgONoFOSibDKatMssT_V3oabWmSiiHLNxYJgsU9JuEkrfQ/exec";

  try {
    const url = `${WEB_APP_URL}?action=getDetails&phone=${phone}&t=${Date.now()}`;
    console.log("Request URL:", url);
    
    let result;
    
    // Try JSONP first
    try {
      result = await jsonpRequest(url);
      console.log("JSONP Success:", result);
    } catch (jsonpError) {
      console.log("JSONP failed, trying fetch:", jsonpError.message);
      // Try regular fetch
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseText = await response.text();
      console.log("Fetch Response Text:", responseText);
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    }

    if (result.status === "found") {
      const data = result.data;
      
      // Use the values directly from the indexed columns
      const mainStatus = (data.status || "").toLowerCase().trim();
      const verificationStatus = (data.verification || "").toLowerCase().trim();
      const groundVerificationStatus = (data.groundVerification || "").toLowerCase().trim();

      console.log("Status Analysis:", {
        mainStatus,
        verificationStatus, 
        groundVerificationStatus
      });

      // Decision logic using AND conditions
      if (mainStatus === "all done" && verificationStatus === "done" && groundVerificationStatus === "done") {
        console.log("All conditions met → vehicle.html");
        window.location.href = `vehicle.html?phone=${encodeURIComponent(phone)}`;
      } else if (mainStatus === "all done" && verificationStatus === "done") {
        console.log("First two conditions met → onground.html");
        window.location.href = `onground.html?phone=${encodeURIComponent(phone)}`;
      } else if (mainStatus === "all done") {
        console.log("Only status condition met → followup2.html");
        window.location.href = `followup2.html?phone=${encodeURIComponent(phone)}`;
      } else {
        console.log("No conditions met → interview.html");
        window.location.href = `interview.html?phone=${encodeURIComponent(phone)}`;
      }
    } else if (result.status === "not_found") {
      status.innerText = "❌ Phone number not found. Please check the number.";
      status.style.color = "red";
    } else {
      status.innerText = "❌ Error: " + (result.message || "Unknown error");
      status.style.color = "red";
    }

  } catch (err) {
    console.error("Final Error:", err);
    status.innerHTML = `
      ❌ Error: ${err.message}
      <br><br>
      <strong>Please try:</strong>
      <br>• Checking the phone number
      <br>• Refreshing the page
      <br>• Contacting support if problem continues
    `;
    status.style.color = "red";
  }
});



