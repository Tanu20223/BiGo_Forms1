const form = document.getElementById("loginForm");
const status = document.getElementById("status");

// JSONP function
function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "callback_" + Date.now();

    window[callbackName] = function (data) {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      resolve(data);
    };

    const script = document.createElement("script");
    script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + callbackName;

    script.onerror = function () {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error("JSONP failed"));
    };

    document.head.appendChild(script);

    setTimeout(() => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
        delete window[callbackName];
        reject(new Error("JSONP timeout"));
      }
    }, 10000);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phone = form.phone.value.trim();

  // phone validation
  if (!phone || !/^\d{10}$/.test(phone)) {
    status.innerText = "❌ Please enter a valid 10-digit phone number";
    status.style.color = "red";
    return;
  }

  status.innerText = "Checking...";
  status.style.color = "blue";

  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbyxLBfmF5ZMrognbVariLtqcwtR5w8EqV1mV4mf6-8gCJXaN12qatlkh6YOhJI8Tuo-KA/exec";

  try {
    const url = `${WEB_APP_URL}?action=getDetails&phone=${phone}&t=${Date.now()}`;
    console.log("Request URL:", url);

    let result;

    // Try JSONP
    try {
      result = await jsonpRequest(url);
      console.log("JSONP result:", result);
    } catch (e1) {
      console.log("JSONP failed → fallback to fetch");

      const response = await fetch(url);
      const text = await response.text();

      try {
        result = JSON.parse(text);
      } catch (e2) {
        throw new Error("Invalid JSON from server: " + text);
      }
    }

    // PROCESS API RESULT
    if (result.status === "found") {
      const data = result.data;

      console.log("Returned Data:", data);

      // FIXED: Correct fields
      const mainStatus = (data.status2 || "").toLowerCase().trim();
      const verificationStatus = (data.verification || "").toLowerCase().trim();
      const groundVerificationStatus = (data.groundVerification || "")
        .toLowerCase()
        .trim();

      console.log("Processed Status:", {
        mainStatus,
        verificationStatus,
        groundVerificationStatus,
      });

      // FINAL REDIRECT LOGIC
      if (
        mainStatus === "all done" &&
        verificationStatus === "done" &&
        groundVerificationStatus === "done"
      ) {
        window.location.href = `vehicle.html?phone=${phone}`;
      } else if (
        mainStatus === "all done" &&
        verificationStatus === "done"
      ) {
        window.location.href = `onground.html?phone=${phone}`;
      } else if (mainStatus === "all done") {
        window.location.href = `followup2.html?phone=${phone}`;
      } else {
        window.location.href = `interview.html?phone=${phone}`;
      }

      return;
    }

    if (result.status === "not_found") {
      status.innerText = "ℹ️ No existing record found. Please fill the form.";
      status.style.color = "orange";
      return;
    }

    // Any unknown error message
    status.innerText = "❌ Error: " + (result.message || "Unknown server error");
    status.style.color = "red";
  } catch (err) {
    console.error("Final Error:", err);
    status.innerHTML = `
      ❌ Error: ${err.message}
      <br><br>
      <strong>Please try:</strong>
      <br>• Check the phone number
      <br>• Refresh the page
    `;
    status.style.color = "red";
  }
});






