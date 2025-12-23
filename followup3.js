let latitude = '';
let longitude = '';

// 📍 GPS LOCATION
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    },
    () => alert('Please allow location for attendance')
  );
}

// 📷 Convert file to Base64
function getBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// SUBMIT HANDLER
document.getElementById("submitBtn").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  msg.style.color = "orange";
  msg.textContent = "Submitting...";

  const riderName = riderNameEl.value.trim();
  const phone = phoneEl.value.trim();
  const selfie = selfieEl.files[0];
  const odometer = odometerEl.files[0];

  if (!riderName || !phone) {
    alert("Rider Name and Phone are mandatory");
    return;
  }

  if (!selfie || !odometer) {
    alert("Please capture both Selfie and Odometer photo");
    return;
  }

  const data = {
    inOut: inOut.value,
    riderName,
    phone,
    client: client.value,
    reportingTime: reportingTime.value,
    reportingKm: reportingKm.value,
    reportingCharge: reportingCharge.value,
    currentLocation: currentLocation.value,
    selfie: await getBase64(selfie),
    odometer: await getBase64(odometer),
    tShirt: tShirt.value,
    latitude,
    longitude
  };

  // ⚠️ This will work ONLY inside Google Apps Script Web App
  if (typeof google !== "undefined") {
    google.script.run.withSuccessHandler(res => {
      msg.style.color = "green";
      msg.textContent = res;
    }).submitAttendance(data);
  } else {
    // VS Code / Browser test mode
    console.log("Form Data:", data);
    msg.style.color = "green";
    msg.textContent = "Form validated (local test)";
  }
});

// ELEMENT SHORTCUTS
const inOut = document.getElementById("inOut");
const riderNameEl = document.getElementById("riderName");
const phoneEl = document.getElementById("phone");
const client = document.getElementById("client");
const reportingTime = document.getElementById("reportingTime");
const reportingKm = document.getElementById("reportingKm");
const reportingCharge = document.getElementById("reportingCharge");
const currentLocation = document.getElementById("currentLocation");
const selfieEl = document.getElementById("selfie");
const odometerEl = document.getElementById("odometer");
const tShirt = document.getElementById("tShirt");
