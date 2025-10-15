const form = document.getElementById("interviewForm");
const experience = document.getElementById("experience");
const extraFields = document.getElementById("extraFields");
const interviewType = document.getElementById("interviewType");
const skillsSection = document.getElementById("skillsSection");
const cvSection = document.getElementById("cvSection");
const status = document.getElementById("status");

// Your Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby6YnM7nA_SD6Nq9A6fLeEdd5nrrk4MVuhQSn16lj1qgFF4LFYVpSB9gRGUu_diGhonMw/exec";

// Auto-fill phone from login URL & fetch candidate data
const urlParams = new URLSearchParams(window.location.search);
const phoneFromLogin = urlParams.get("phone");
if (phoneFromLogin) {
  document.getElementById("contact").value = phoneFromLogin;
  fetchCandidateData(phoneFromLogin);
}

// Show/hide extra fields based on experience
experience.addEventListener("change", () => {
  if (experience.value === "Fresher" || experience.value === "") {
    extraFields.classList.add("hidden");
  } else {
    extraFields.classList.remove("hidden");
  }
});

// Show/hide CV & Skills based on interview type
interviewType.addEventListener("change", () => {
  if (interviewType.value === "Sir") {
    skillsSection.style.display = "block";
    cvSection.style.display = "block";
  } else {
    skillsSection.style.display = "none";
    cvSection.style.display = "none";
  }
});

// Fetch candidate data from Main
function fetchCandidateData(phone) {
  status.innerText = "🔍 Fetching your details...";
  fetch(`${WEB_APP_URL}?action=getCandidate&phone=${phone}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        const r = data.record;
        form.fullname.value = r["Full Name"] || "";
        form.contact.value = r["Contact Number"] || phone;
        form.email.value = r["Email Address"] || "";
        form.currentAddress.value = r["Current Address"] || "";
        form.permanentAddress.value = r["Permanent Address"] || "";
        form.position.value = r["Position"] || "";
        form.experience.value = r["Experience"] || "";
        form.company.value = r["Company"] || "";
        form.ctc.value = r["CTC"] || "";
        form.qualification.value = r["Qualification"] || "";
        form.skills.value = r["Skills"] || "";
        form.interviewType.value = r["Interview Type"] || "";

        // Make auto-fetched fields read-only
        form.fullname.readOnly = true;
        form.contact.readOnly = true;
        
        


        
        experience.dispatchEvent(new Event("change"));
        interviewType.dispatchEvent(new Event("change"));

        status.innerText = "✅ Existing data loaded. Please review or update.";
      } else if (data.status === "not_found") {
        status.innerText = "ℹ️ No existing record found. Please fill the form.";
      } else {
        status.innerText = "⚠️ Could not fetch data.";
      }
    })
    .catch(err => {
      console.error(err);
      status.innerText = "⚠️ Error fetching data. Try again later.";
    });
}

// Submit form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const selectedType = interviewType.value;
  if (selectedType === "Sir") {
    const file = document.getElementById("cv").files[0];
    if (!file) {
      status.innerText = "⚠️ Please upload your CV before submitting.";
      return;
    }
    const reader = new FileReader();
    reader.onload = e => sendData(e.target.result.split(",")[1], file.name);
    reader.readAsDataURL(file);
  } else {
    sendData(null, null);
  }
});

function sendData(base64Data, filename) {
  const data = {
    formType: "interview",
    interviewType: interviewType.value,
    fullname: form.fullname.value,
    contact: form.contact.value,
    email: form.email.value,
    currentAddress: form.currentAddress.value,
    permanentAddress: form.permanentAddress.value,
    position: form.position.value,
    experience: form.experience.value,
    company: form.company.value,
    ctc: form.ctc.value,
    skills: form.skills.value,
    qualification: form.qualification.value,
    cv_base64: base64Data,
    cv_filename: filename
  };
  status.innerText = "⏳ Submitting...";
  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "text/plain" }
  })
    .then(res => res.json())
    .then(result => {
      status.innerText = result.message || "✅ Submitted successfully!";
      form.reset();
      extraFields.classList.add("hidden");
      skillsSection.style.display = "block";
      cvSection.style.display = "block";
    })
    .catch(err => { status.innerText = "❌ Error: " + err.message; });
}
