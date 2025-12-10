document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxgszLRWrFH7JRyMJ6tcO4NPG75cs22JVy_UGDdH8UhMkTKz1obOG4ES__pCLOHIPfNcw/exec";  // Replace only this

  // Get phone from URL
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");

  if (!phone) {
    status.innerHTML = "❌ Phone missing in URL!";
    return;
  }

  // Lookup
  fetch(`${WEB_APP_URL}?action=lookup&phone=${phone}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        status.innerHTML = "❌ No data found for this phone!";
        return;
      }

      document.getElementById("fullname").value = data.fullname;
      document.getElementById("contact").value = data.contact;
      document.getElementById("email").value = data.email;

      // Store phone to hidden field
      document.getElementById("currentPhone").value = phone;
    });

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      action: "followup",
      phone: document.getElementById("currentPhone").value.trim(),
      fullname: document.getElementById("fullname").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      email: document.getElementById("email").value.trim(),
      trainingBy: document.getElementById("trainingBy").value.trim(),
      trainingStatus: document.getElementById("trainingStatus").value.trim(),
      selection: document.getElementById("selection").value.trim(),
      finalRemark: document.getElementById("finalRemark").value.trim()
    };

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const out = await res.json();

    if (!out.success) {
      status.innerHTML = "❌ " + out.message;
      return;
    }

    status.innerHTML = "✔ Saved! Redirecting...";

    setTimeout(() => {
      window.location.href = "bgv.html?phone=" + phone;
    }, 500);
  });

});

