document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");
  const remark = document.getElementById("finalRemark");
  const remarkCount = document.getElementById("remarkCount");

  // YOUR WEB APP URL ↓
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw54eK_nkV2iEtcbC-q01IQLaSyV2y2s1UImHbuDn1m6giLigILkOo_h_jEmHM1qNys7g/exec";

  /**
   * -------------------------------------
   *  CHARACTER COUNTER FOR FINAL REMARK
   * -------------------------------------
   */
  remark.addEventListener("input", () => {
    const count = remark.value.length;
    remarkCount.textContent = `${count} / 50`;

    if (count > 50) {
      remark.value = remark.value.slice(0, 50);
      remarkCount.textContent = `50 / 50`;
    }
  });

  /**
   * -------------------------------------
   *  AUTO LOAD FOLLOWUP DETAILS
   * -------------------------------------
   */
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");

  if (phone) {
    fetch(`${WEB_APP_URL}?action=getFollowup&phone=${phone}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById("fullName").textContent = data.record.fullName || "";
          document.getElementById("contactNumber").textContent = data.record.contactNumber || "";
          document.getElementById("email").textContent = data.record.email || "";
          document.getElementById("currentAddress").textContent = data.record.currentAddress || "";
          document.getElementById("permanentAddress").textContent = data.record.permanentAddress || "";
          document.getElementById("position").textContent = data.record.positionAppliedFor || "";
        } else {
          status.textContent = "No details found.";
        }
      })
      .catch(err => {
        status.textContent = "Error loading details.";
        console.error(err);
      });
  }

  /**
   * -------------------------------------
   *  SUBMIT FOLLOWUP FORM
   * -------------------------------------
   */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "Saving...";

    const payload = {
      phone: phone,
      interviewBy: document.getElementById("interviewBy").value.trim(),
      trainingBy: document.getElementById("trainingBy").value.trim(),
      trainingStatus: document.getElementById("trainingStatus").value.trim(),
      selection: document.getElementById("selection").value.trim(),
      finalRemark: remark.value.trim()
    };

    fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"   // IMPORTANT: must match Apps Script
      },
      body: JSON.stringify(payload)
    })
    .


