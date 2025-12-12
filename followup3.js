document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const status = document.getElementById("status");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzvAqircKR1eSCRwwweR2-NTRkm1b78dnAc5PuSWZnaZzOufjNxXnmXTjmfPhtEs5SaZw/exec";

  const urlParams = new URLSearchParams(window.location.search);
  const phoneFromLogin = urlParams.get("phone");

  if (!phoneFromLogin) {
    alert("❌ Missing phone number in URL. Use ?phone=XXXXXXXXXX");
    status.innerText = "❌ Missing phone number in URL.";
    return;
  }

  // ====== GET DATA ======
  fetch(`${WEB_APP_URL}?action=getDetails&phone=${encodeURIComponent(phoneFromLogin)}`)
    .then(res => res.json())
    .then(data => {
      console.log("GET Response:", data);

      if (data.status === true) {
        const r = data.data || {};

        form.fullname.value = r["Full Name"] || "";
        form.contact.value = r["Contact Number"] || "";
        form.email.value = r["Email Address"] || "";
        form.currentAddress.value = r["Current Address"] || "";
        form.permanentAddress.value = r["Permanent Address"] || "";
        form.position.value = r["Position Applied For"] || "";

        form.fullname.readOnly = true;
        form.contact.readOnly = true;
        form.email.readOnly = true;

        status.innerText = "✅ Candidate data loaded.";
      } else {
        status.innerText = "⚠️ " + (data.message || "Record not found");
      }
    })
    .catch(err => {
      console.error("GET Error:", err);
      status.innerText = "❌ Error fetching data.";
    });

  // ====== REMARK COUNT ======
  const finalRemark = document.getElementById("finalRemark");
  const remarkCount = document.getElementById("remarkCount");

  finalRemark.addEventListener("input", () => {
    const count = finalRemark.value.length;
    remarkCount.textContent = `${count} / 50`;
    remarkCount.style.color = count >= 45 ? "red" : "gray";
  });

  // ====== SUBMIT ======
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.innerText = "⏳ Submitting...";

    const data = {
      phone: phoneFromLogin,
      interviewBy: form.interviewBy.value,
      trainingBy: form.trainingBy.value,
      trainingStatus: form.trainingStatus.value,
      selection: form.selection.value,
      finalRemark: form.finalRemark.value
    };

    fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        console.log("POST Response:", result);

        if (result.success) {
          status.innerText = "✅ Follow-up submitted!";

          if ((data.selection || "").toLowerCase() === "yes") {
            window.location.href = `bgv.html?phone=${encodeURIComponent(phoneFromLogin)}`;
          } else {
            form.reset();
            remarkCount.textContent = "0 / 50";
          }

        } else {
          status.innerText = "⚠️ Failed: " + (result.message || "Unknown error");
        }
      })
      .catch(err => {
        console.error("POST Error:", err);
        status.innerText = "❌ Error submitting data.";
      });
  });
});
