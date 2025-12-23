const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyx0oIr5GKbIe2PYMTbnWgRM3UWMyV_k2JOiMLYiw-H_QruFB0oEYB2QoX-JhHx_kt-RQ/exec";

let latitude = "";
let longitude = "";

// 📍 GPS LOCATION
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    },
    () => alert("Please allow location for attendance")
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

  const payload = {
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

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (json.success) {
      msg.style.color = "green";
      msg.textContent = json.message || "Submitted successfully";
    } else {
      msg.style.color = "red";
      msg.textContent = json.message || "Submission failed";
    }

  } catch (err) {
    console.error(err);
    msg.style.color = "red";
    msg.textContent = "Server error. Try again.";
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

