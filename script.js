const form = document.getElementById("loginForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = form.phone.value.trim();

  status.innerText = "Checking...";

  // Replace with your Google Apps Script web app URL
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwJrCDa-CTgZ2DTdbXRVCwS5HwWYOM_Kf8niTroSivEiU8pAP20ZE8GOZlmcUJpxrY6Ng/exec";

  try {
    const response = await fetch(`${WEB_APP_URL}?action=checkStatus&phone=${phone}`);
    const result = await response.json();

    const statusText = (result.status || "").toLowerCase();

    if (statusText === "all done") {
      // Status is "all done" → redirect to followup form
      window.location.href = `followup2.html?phone=${phone}`;
    } else {
      // Any other status → redirect to interview form
      window.location.href = `interview.html?phone=${phone}`;
    }

  } catch (err) {
    status.innerText = "❌ Error: " + err.message;
  }
});

