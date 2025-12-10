document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  // YOUR DEPLOYED WEB APP URL (DO NOT USE EXEC URL)
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbw54eK_nkV2iEtcbC-q01IQLaSyV2y2s1UImHbuDn1m6giLigILkOo_h_jEmHM1qNys7g/exec"; // <-- keep your correct URL here



  /* -----------------------------------------
      1) GET PHONE FROM URL
  ------------------------------------------ */
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");

  if (!phone) {
    status.innerText = "Phone missing in URL!";
    return;
  }

  document.getElementById("currentPhone").value = phone;
  document.getElementById("phoneFromLogin").value = phone;

  /* -----------------------------------------
      2) AUTO-FILL DATA USING LOOKUP
  ------------------------------------------ */
  fetch(`${WEB_APP_URL}?action=lookup&phone=${phone}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        status.innerText = "No data found for this phone!";
        return;
      }

      // Auto-fill fields from sheet data
      document.getElementById("fullname").value = data.fullname || "";
      document.getElementById("contact").value = data.contact || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("currentAddress").value = data.currentAddress || "";
      document.getElementById("permanentAddress").value = data.permanentAddress || "";
      document.getElementById("position").value = data.position || "";
    })
    .catch((err) => {
      status.innerText = "Lookup error!";
      console.error(err);
    });

  /* -----------------------------------------
      3) REMARK CHARACTER COUNT
  ------------------------------------------ */
  const remarkField = document.getElementById("finalRemark");
  const remarkCount = document.getElementById("remarkCount");

  remarkField.addEventListener("input", () => {
    remarkCount.innerText = `${remarkField.value.length} / 50`;
  });

  /* -----------------------------------------
      4) FORM SUBMIT
  ------------------------------------------ */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.innerText = "Submitting...";

    const formData = new FormData(form);
    formData.append("action", "followup");

    // Convert formData to plain text body (required)
    const plain = new URLSearchParams(formData).toString();

    fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: plain,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          status.style.color = "green";
          status.innerText = "Follow-up submitted successfully!";
          form.reset();
          remarkCount.innerText = "0 / 50";
        } else {
          status.style.color = "red";
          status.innerText = data.message || "Submission failed!";
        }
      })
      .catch((err) => {
        status.style.color = "red";
        status.innerText = "Error submitting form!";
        console.error(err);
      });
  });
});
