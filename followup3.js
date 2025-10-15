
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx-NFfoq5BzTVyS9f5SIMj81CMCClRfYym5BBfpdi9ZrEOAlsLpPfrBwX28fzoyhCtSeQ/exec";
  const urlParams = new URLSearchParams(window.location.search);
  const phoneFromLogin = urlParams.get("phone");

  if (!phoneFromLogin) {
    alert("❌ Missing phone number in URL. Use ?phone=XXXXXXXXXX");
    status.innerText = "❌ Missing phone number in URL.";
    return;
  }

  // ====== FETCH CANDIDATE DATA ======
  fetch(`${WEB_APP_URL}?action=getFollowup&phone=${encodeURIComponent(phoneFromLogin)}`)
    .then(res => res.json())
    .then(data => {
      console.log("GET response:", data);
      if (data.success) {
        const r = data.record || {};
        form.fullname.value = r["Full Name"] || "";
        form.contact.value = r["Contact Number"] || phoneFromLogin;
        form.email.value = r["Email Address"] || "";
        form.currentAddress.value = r["Current Address"] || "";
        form.permanentAddress.value = r["Permanent Address"] || "";
        form.position.value = r["Position Applied For"] || "";

        form.fullname.readOnly = true;
        form.contact.readOnly = true;
        form.email.readOnly = true;

        status.innerText = "✅ Candidate data loaded successfully.";
      } else {
        status.innerText = "⚠️ " + (data.message || "Record not found");
      }
    })
    .catch(err => {
      console.error("GET fetch error:", err);
      status.innerText = "❌ Error fetching candidate data.";
    });

  // ====== SUBMIT FOLLOW-UP ======
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.innerText = "⏳ Submitting follow-up data...";

    const data = {
      phone: phoneFromLogin,
      interviewBy: form.interviewBy.value.trim(),
      trainingBy: form.trainingBy.value.trim(),
      trainingStatus: form.trainingStatus.value.trim(),
      selection: form.selection.value.trim(),
      finalRemark: form.finalRemark.value.trim()
    };

    fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        console.log("POST response:", result);
        if (result.success) {
          status.innerText = "✅ Follow-up submitted successfully!";

          if ((data.selection || "").toLowerCase() === "yes") {
            window.location.href = `bgv.html?phone=${encodeURIComponent(phoneFromLogin)}`;
          } else {
            form.reset();
          }

        } else {
          status.innerText = "⚠️ Submission failed: " + (result.message || "Unknown error");
        }
      })
      .catch(err => {
        console.error("POST error:", err);
        status.innerText = "❌ Error submitting follow-up data.";
      });
  });
});