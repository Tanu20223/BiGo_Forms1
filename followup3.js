const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyx0oIr5GKbIe2PYMTbnWgRM3UWMyV_k2JOiMLYiw-H_QruFB0oEYB2QoX-JhHx_kt-RQ/exec";

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const phone = params.get("phone");
  const status = document.getElementById("status");
  const form = document.getElementById("followupForm");

  if (!phone) {
    status.innerText = "❌ Missing phone in URL";
    return;
  }

  // ===== FETCH CANDIDATE DATA =====
  fetch(`${WEB_APP_URL}?action=getFollowup&phone=${encodeURIComponent(phone)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        status.innerText = "⚠️ " + data.message;
        return;
      }

      const r = data.record;

      fullname.value = r.fullName || "";
      contact.value = r.contact || "";
      email.value = r.email || "";
      currentAddress.value = r.currentAddress || "";
      permanentAddress.value = r.permanentAddress || "";
      position.value = r.position || "";

      status.innerText = "✅ Candidate data loaded";
    })
    .catch(() => {
      status.innerText = "❌ Error fetching data";
    });

  // ===== CHARACTER COUNTER =====
  finalRemark.addEventListener("input", () => {
    remarkCount.textContent = `${finalRemark.value.length} / 50`;
    remarkCount.style.color =
      finalRemark.value.length >= 45 ? "red" : "gray";
  });

  // ===== SUBMIT FOLLOW-UP =====
  form.addEventListener("submit", e => {
    e.preventDefault();
    status.innerText = "⏳ Submitting...";

    fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        interviewBy: interviewBy.value.trim(),
        trainingBy: trainingBy.value.trim(),
        trainingStatus: trainingStatus.value,
        selection: selection.value,
        finalRemark: finalRemark.value.trim()
      })
    })
    .then(res => res.json())
    .then(res => {
      status.innerText = res.success
        ? "✅ Follow-up submitted successfully!"
        : "❌ " + res.message;
    })
    .catch(() => {
      status.innerText = "❌ Submission error";
    });
  });
});
