const form = document.getElementById("interviewForm");
const experience = document.getElementById("experience");
const extraFields = document.getElementById("extraFields");
const interviewType = document.getElementById("interviewType");
const skillsSection = document.getElementById("skillsSection");
const cvSection = document.getElementById("cvSection");
const riderFields = document.getElementById("riderFields");
const drivingYearsSelect = document.getElementById("drivingYears");
const status = document.getElementById("status");

// Your Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz7mu4_wA5kWbVyJhnxlpkxtDu_3MUP7EaD6fJ8YxbVhz9qUYpxJbN7SDsP2qL6IdRdyw/exec";

// Function to populate the Driving Years dropdown (0 to 30)
function populateDrivingYears() {
  for (let i = 0; i <= 30; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = i + (i === 1 ? ' Year' : ' Years');
    drivingYearsSelect.appendChild(option);
  }
}

// Call the function to populate the dropdown when the script loads
populateDrivingYears();


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

// Show/hide CV & Skills & Rider fields based on interview type
interviewType.addEventListener("change", () => {
  const selectedType = interviewType.value;
  
  // Logic for 'Sir' interview
  if (selectedType === "Sir") {
    skillsSection.style.display = "block";
    cvSection.style.display = "block";
    riderFields.classList.add("hidden");
    riderFields.querySelector('#drivingYears').required = false;
    riderFields.querySelector('#licenseDate').required = false;
  } 
  // Logic for 'Rider' interview
  else if (selectedType === "Rider") {
    skillsSection.style.display = "none";
    cvSection.style.display = "none";
    riderFields.classList.remove("hidden");
    riderFields.querySelector('#drivingYears').required = true;
    riderFields.querySelector('#licenseDate').required = true;
  }
  // Logic for 'Rental' or no selection
  else {
    skillsSection.style.display = "none";
    cvSection.style.display = "none";
    riderFields.classList.add("hidden");
    riderFields.querySelector('#drivingYears').required = false;
    riderFields.querySelector('#licenseDate').required = false;
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
        // FIX: Keys must match your Google Sheet headers (e.g., "Full Name")
        form.fullname.value = r["Full Name"] || "";
        form.contact.value = r["Contact Number"] || phone;
        form.email.value = r["Email Address"] || "";
        form.currentAddress.value = r["Current Address"] || "";
        form.area.value = r["Area"] || "";
        form.permanentAddress.value = r["Permanent Address"] || "";
        form.position.value = r["Position Applied For"] || ""; // Assuming this header name
        form.experience.value = r["Total Years of Experience"] || ""; // Assuming this header name
        form.company.value = r["Previous Company Name"] || ""; // Assuming this header name
        form.qualification.value = r["Highest Qualification"] || ""; // Assuming this header name
        form.interviewType.value = r["Interview Type"] || "";
        form.skills.value = r["Key Skills"] || ""; // Assuming this header name
        form.drivingYears.value = r["Driving Years"] || ""; // Assuming this header name
        form.licenseDate.value = r["License Issue Date"] || ""; // Assuming this header name
        

        // Make auto-fetched fields read-only
        form.fullname.readOnly = true;
        form.contact.readOnly = true;
        
        experience.dispatchEvent(new Event("change"));
        interviewType.dispatchEvent(new Event("change"));

        status.innerText = "✅ Existing data loaded. Please review or update.";
      } else if (data.status === "not_found") {
        status.innerText = "ℹ️ No existing record found. Please fill the form.";
      } else {
        status.innerText = "⚠️ Could not fetch data. Check App Script doGet headers.";
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
  
  // Check for CV requirement for "Sir" interview
  if (selectedType === "Sir") {
    const file = document.getElementById("cv").files[0];
    if (!file) {
      status.innerText = "⚠️ Please upload your CV before submitting.";
      return;
    }

    // Limit file size to 1 MB
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      status.innerText = "⚠️ File size exceeds 1 MB limit. Please upload a smaller CV.";
      return;
    }


    const reader = new FileReader();
    reader.onload = e => sendData(e.target.result.split(",")[1], file.name);
    reader.readAsDataURL(file);
  } 
  // No CV required for other types, proceed to send data
  else {
    sendData(null, null);
  }
});

function sendData(base64Data, filename) {
  const data = {
    formType: "interview",
    fullname: form.fullname.value,
    contact: form.contact.value,
    email: form.email.value,
    currentAddress: form.currentAddress.value,
    area: form.area.value,
    permanentAddress: form.permanentAddress.value,
    position: form.position.value,
    experience: form.experience.value,
    company: form.company.value,
    qualification: form.qualification.value,
    interviewType: form.interviewType.value,
    skills: form.skills.value,
    // Data remains the same, it now comes from the select box
    drivingYears: form.drivingYears.value, 
    licenseDate: form.licenseDate.value,
    
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
      
      // Reset visibility states after form submission
      extraFields.classList.add("hidden");
      skillsSection.style.display = "block"; // Default state after reset
      cvSection.style.display = "block";     // Default state after reset
      riderFields.classList.add("hidden");   // Reset rider fields
    })
    .catch(err => { status.innerText = "❌ Error: " + err.message; });
}