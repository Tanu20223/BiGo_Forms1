document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");
  const lookupPhone = document.getElementById("phone");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwQkPLPnP7Gv6-gFDMmYjet3w64_Kh6XwY_OpyFgLaNgnnKN9DoAOhxIRetth2sR0-xdQ/exec"; // paste your deployed final URL

  // ---------------------------
  // 🔍 AUTO LOOKUP FROM SHEET
  // ---------------------------
  lookupPhone.addEventListener("blur", async () => {
    const phone = lookupPhone.value.trim();

    if (!phone) return;

    status.textContent = "Checking number...";
    status.style.color = "blue";

    try {
      const res = await fetch(`${WEB_APP_URL}?action=lookup&phone=${phone}`);
      const data = await res.json();

      console.log("Lookup Response:", data);

      if (!data.success || !data.record) {
        status.textContent = "No data found for this phone!";
        status.style.color = "red";
        return;
      }

      // 🎉 Data Found → Fill Form
      document.getElementById("fullname").value = data.record.fullname || "";
      document.getElementById("contact").value = data.record.contact || "";
      document.getElementById("email").value = data.record.email || "";
      document.getElementById("trainingBy").value = data.record.trainingBy || "";
      document.getElementById("trainingStatus").value = data.record.trainingStatus || "";

      status.textContent = "Data found!";
      status.style.color = "green";

    } catch (err) {
      console.error(err);
      status.textContent = "Error checking phone!";
      status.style.color = "red";
    }
  });

  // ---------------------------
  // ✅ SUBMIT FOLLOWUP FORM
  // ---------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      action: "followup",
      phone: lookupPhone.value.trim(),
      fullname: document.getElementById("fullname").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      email: document.getElementById("email").value.trim(),
      trainingBy: document.getElementById("trainingBy").value.trim(),
      trainingStatus: document.getElementById("trainingStatus").value.trim(),
      selection: document.getElementById("selection").value.trim(),
      finalRemark: document.getElementById("finalRemark").value.trim(),
    };

    console.log("Submitting Followup:", formData);

    status.textContent = "Submitting...";
    status.style.color = "blue";

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Submit Response:", data);

      if (data.success) {
        status.textContent = "Saved successfully!";
        status.style.color = "green";

        // redirect after success
        setTimeout(() => {
          window.location.href = "bgv.html";
        }, 800);

      } else {
        status.textContent = "Saving failed!";
        status.style.color = "red";
      }

    } catch (err) {
      console.error(err);
      status.textContent = "Submit error!";
      status.style.color = "red";
    }
  });
});
