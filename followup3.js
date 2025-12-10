document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  // YOUR WEB APP URL
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbw54eK_nkV2iEtcbC-q01IQLaSyV2y2s1UImHbuDn1m6giLigILkOo_h_jEmHM1qNys7g/exec";

  // GET phone from URL
  const urlParams = new URLSearchParams(window.location.search);
  const phoneFromLogin = urlParams.get("phone");

  // Set hidden phone field
  document.getElementById("currentPhone").value = phoneFromLogin;

  // Load user data
  fetch(`${WEB_APP_URL}?action=lookup&phone=${phoneFromLogin}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || !data.data) {
        status.textContent = "No data found for this phone!";
        status.style.color = "red";
        return;
      }

      // Autofill form
      document.getElementById("fullname").value = data.data.fullname || "";
      document.getElementById("contact").value = data.data.contact || "";
      document.getElementById("email").value = data.data.email || "";
      document.getElementById("currentAddress").value = data.data.currentAddress || "";
      document.getElementById("permanentAddress").value = data.data.permanentAddress || "";
      document.getElementById("position").value = data.data.position || "";
    })
    .catch(() => {
      status.textContent = "Failed to load details!";
      status.style.color = "red";
    });

  // Submit Form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      action: "followup",              // 🔥 REQUIRED
      phone: phoneFromLogin,           // 🔥 REQUIRED
      interviewBy: form.interviewBy.value.trim(),
      trainingBy: form.trainingBy.value.trim(),
      trainingStatus: form.trainingStatus.value,
      selection: form.selection.value,
      finalRemark: form.finalRemark.value.trim(),
    };

    status.textContent = "Submitting...";
    status.style.color = "blue";

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        status.textContent = "Submitted successfully!";
        status.style.color = "green";

        // Redirect to BGV page
        setTimeout(() => {
          window.location.href = `bgv.html?phone=${phoneFromLogin}`;
        }, 1000);
      } else {
        status.textContent = "Submission failed: " + result.message;
        status.style.color = "red";
      }
    } catch (err) {
      status.textContent = "Submission failed!";
      status.style.color = "red";
    }
  });
});

