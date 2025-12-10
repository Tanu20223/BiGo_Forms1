document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  // 🔹 Replace with your deployed Apps Script Web App URL
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbw54eK_nkV2iEtcbC-q01IQLaSyV2y2s1UImHbuDn1m6giLigILkOo_h_jEmHM1qNys7g/exec";

  // 1️⃣ GET PHONE FROM URL
  const urlParams = new URLSearchParams(window.location.search);
  const phoneFromLogin = urlParams.get("phone");

  if (!phoneFromLogin) {
    status.textContent = "❌ Missing phone number in URL";
    status.style.color = "red";
    return;
  }

  // Put phone into hidden field (Apps Script expects `phone`)
  const phoneField = document.getElementById("phone");
  if (phoneField) phoneField.value = phoneFromLogin;

  // 2️⃣ FETCH CANDIDATE DETAILS
  fetch(`${WEB_APP_URL}?action=getFollowup&phone=${encodeURIComponent(phoneFromLogin)}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        status.textContent = "⚠ Phone not found in sheet";
        status.style.color = "red";
        return;
      }

      const r = data.record || {};

      // Auto-fill form fields
      form.fullname.value = r["Full Name"] || "";
      form.contact.value = r["Contact Number"] || "";
      form.email.value = r["Email Address"] || "";
      form.currentAddress.value = r["Current Address"] || "";
      form.permanentAddress.value = r["Permanent Address"] || "";
      form.position.value = r["Position Applied For"] || "";

      // Optional: make auto-filled fields read-only
      form.fullname.readOnly = true;
      form.contact.readOnly = true;
      form.email.readOnly = true;

      status.textContent = "✅ Candidate data loaded";
      status.style.color = "green";
    })
    .catch((err) => {
      console.error("GET error:", err);
      status.textContent = "⚠ Error fetching candidate data";
      status.style.color = "red";
    });

  // 3️⃣ FINAL REMARK CHARACTER COUNT
  const finalRemark = document.getElementById("finalRemark");
  const remarkCount = document.getElementById("remarkCount");

  finalRemark.addEventListener("input", () => {
    const count = finalRemark.value.length;
    remarkCount.textContent = `${count} / 50`;
    remarkCount.style.color = count >= 45 ? "red" : "gray";
  });

  // 4️⃣ SUBMIT FOLLOW-UP FORM
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "⏳ Submitting follow-up...";
    status.style.color = "blue";

    // Prepare payload
    const payload = {
      phone: phoneFromLogin, // REQUIRED for Apps Script
      interviewBy: form.interviewBy.value.trim(),
      trainingBy: form.trainingBy.value.trim(),
      trainingStatus: form.trainingStatus.value.trim(),
      selection: form.selection.value.trim(),
      finalRemark: form.finalRemark.value.trim(),
    };

    fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", // Matches your Apps Script
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          status.textContent = "✅ Follow-up submitted successfully!";
          status.style.color = "green";

          // Redirect to BGV page if selection = Yes
          if ((payload.selection || "").toLowerCase() === "yes") {
            window.location.href = `bgv.html?phone=${encodeURIComponent(phoneFromLogin)}`;
          } else {
            form.reset();
            remarkCount.textContent = "0 / 50";
            remarkCount.style.color = "gray";
          }
        } else {
          status.textContent = "⚠ Submission failed: " + (data.message || "Unknown error");
          status.style.color = "red";
        }
      })
      .catch((err) => {
        console.error("POST error:", err);
        status.textContent = "❌ Error submitting follow-up";
        status.style.color = "red";
      });
  });
});
