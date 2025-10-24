const form = document.getElementById("bgv");
const status = document.getElementById("successMessage");
const submitBtn = form.querySelector('button[type="submit"]');
const bgvType = document.getElementById("bgvType");
const rentalSection = document.getElementById("rentalSection");
const jobSection = document.getElementById("jobSection");

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1ERXSIr1i8VbaoCvhSq2kjTkb8XywZQmTKHP5JihuYhQt7T9mOvoS3YKlqunEzE-9iA/exec"; // replace with your Apps Script URL

// =============================
// 🌟 AUTO FETCH DATA FROM MAIN SHEET
// =============================
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");

  if (!phone) {
    status.innerText = "❌ Missing ?phone= in URL";
    return;
  }

  fetch(`${WEB_APP_URL}?action=getCandidate&phone=${encodeURIComponent(phone)}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "success" && data.record) {
        const r = data.record;

        form.name.value = r["Full Name"] || "";
        form.email.value = r["Email Address"] || "";
        form.phone.value = r["Contact Number"] || phone;
        form.fatherName.value = r["Father's name"] || "";
        form.aadharAddress.value = r["Adhar address"] || "";
        form.residenceType.value = r["Residence Type"] || "";
        form.dob.value = r["Date of Birth"] || "";
        form.currentAddress.value = r["Current Address"] || "";

        ["name", "email", "phone","currentAddress"]
          .forEach(id => document.getElementById(id).readOnly = true);

        status.innerText = "✅ Candidate details loaded from Main sheet.";
      } else {
        status.innerText = "⚠️ Candidate record not found.";
      }
    })
    .catch(err => {
      console.error(err);
      status.innerText = "❌ Error fetching candidate data.";
    });
});

// =============================
// 🧾 SHOW/HIDE SECTIONS
// =============================
bgvType.addEventListener('change', () => {
  rentalSection.classList.add('hidden');
  jobSection.classList.add('hidden');
  if (bgvType.value === "rental") rentalSection.classList.remove('hidden');
  if (bgvType.value === "job") jobSection.classList.remove('hidden');
});

// =============================
// 📤 SUBMIT FORM + UPLOAD FILES
// =============================
form.addEventListener("submit", e => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";

  const toBase64 = file => new Promise(resolve => {
    if (!file) return resolve({ base64: null, filename: "" });
    const reader = new FileReader();
    reader.onload = e => resolve({ base64: e.target.result.split(',')[1], filename: file.name });
    reader.readAsDataURL(file);
  });

  const fileIds = [
    'aadharFront','aadharBack','voterFront','voterBack',
    'dlFront','dlBack','panFront','panBack','swastasathiPhoto','selfie'
  ];

  Promise.all(fileIds.map(id => toBase64(document.getElementById(id).files[0])))
    .then(files => {
      const data = {
        formType: "bgv",
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        aadharLinkPhone: form.aadharLinkPhone.value,
        fatherName: form.fatherName.value,
        aadharAddress: form.aadharAddress.value,
        currentAddress: form.currentAddress.value,
        residenceType: form.residenceType.value,
        dob: form.dob.value,
        aadharNo: form.aadharNo.value,
        aadharFront: files[0],
        aadharBack: files[1],
        voterNo: form.voterNo.value,
        voterFront: files[2],
        voterBack: files[3],
        dlNo: form.dlNo.value,
        dlFront: files[4],
        dlBack: files[5],
        panNo: form.panNo.value,
        panFront: files[6],
        panBack: files[7],
        swastasathiNo: form.swastasathiNo.value,
        swastasathiPhoto: files[8],
        selfie: files[9],
        referrer: form.referrer.value,
        bgvType: form.bgvType.value,
        rentPurpose: form.rentPurpose.value,
        companyName: form.companyName.value,
        position: form.position.value,
        joinDate: form.joinDate.value
      };

      return fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data)
      });
    })
    .then(res => res.json())
    .then(result => {
      if (result.status === "success") {
        status.innerText = "✅ Form submitted successfully!";
        form.reset();
        rentalSection.classList.add('hidden');
        jobSection.classList.add('hidden');
      } else {
        status.innerText = "⚠️ Error: " + (result.message || "Something went wrong.");
      }
    })
    .catch(err => {
      console.error(err);
      status.innerText = "❌ " + err.message;
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit";
    });
});
