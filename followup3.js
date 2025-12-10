document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxgszLRWrFH7JRyMJ6tcO4NPG75cs22JVy_UGDdH8UhMkTKz1obOG4ES__pCLOHIPfNcw/exec"; // <- Replace only this

  // First fetch phone from input (no html change)
  const phoneInput = document.querySelector("input[name='phone'], #phone");

  if (!phoneInput) {
    console.error("Phone input not found!");
    return;
  }

  const phone = phoneInput.value.trim();

  // Lookup data
  fetch(`${WEB_APP_URL}?action=lookup&phone=${phone}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        status.innerHTML = "❌ No data found for this phone!";
        return;
      }

      // Fill the form values (IDs are same as you showed)
      document.getElementById("fullname").value = data.fullname;
      document.getElementById("contact").value = data.contact;
      document.getElementById("email").value = data.email;
    });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      action: "followup",
      phone: document.getElementById("contact").value.trim(),
      fullname: document.getElementById("fullname").value.trim(),
      email: document.getElementById("email").value.trim(),
      trainingBy: document.getElementById("trainingBy").value.trim(),
      trainingStatus: document.getElementById("trainingStatus").value.trim(),
      selection: document.getElementById("selection").value.trim(),
      finalRemark: document.getElementById("finalRemark").value.trim()
    };

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    const out = await res.json();

    if (!out.success) {
      status.innerHTML = "❌ Error: " + out.message;
      return;
    }

    status.innerHTML = "✔ Data saved! Redirecting...";

    setTimeout(() => {
      window.location.href = "bgv.html";
    }, 800);
  });

});
