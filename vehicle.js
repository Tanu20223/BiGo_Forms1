const form = document.getElementById('handoverForm');
const status = document.getElementById('successMessage');
const submitBtn = form.querySelector('button[type="submit"]');

const vehicleSpeed = document.getElementById('vehicleSpeed');
const licenseGroup = document.getElementById('licenseGroup');
const licenseNumberInput = document.getElementById('drivingLicenseNumber');
const licenseFileInput = document.getElementById('drivingLicense');

// Show/hide license fields dynamically
vehicleSpeed.addEventListener('change', () => {
  const isHighSpeed = (vehicleSpeed.value === "high");
  licenseGroup.style.display = isHighSpeed ? "block" : "none";
  licenseNumberInput.required = isHighSpeed;
  licenseFileInput.required = isHighSpeed;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";

  // Helper to convert files to base64
  const fileToBase64 = file => new Promise((resolve, reject) => {
    if (!file) return resolve({ base64: null, filename: "" });
    const reader = new FileReader();
    reader.onload = e => resolve({ base64: e.target.result.split(',')[1], filename: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const files = {
    aadharPhoto: document.getElementById('aadharPhoto').files[0],
    panPhoto: document.getElementById('panPhoto').files[0],
    voterPhoto: document.getElementById('voterPhoto').files[0],
    drivingLicense: licenseFileInput.files[0],
    odometerPhoto: document.getElementById('odometerPhoto').files[0],
    relationProof: document.getElementById('relationProof').files[0],
    witnessAadharPhoto: document.getElementById('witnessAadharPhoto').files[0],
    paymentScreenshot: document.getElementById('paymentScreenshot').files[0]
  };

  Promise.all([
    fileToBase64(files.aadharPhoto),
    fileToBase64(files.panPhoto),
    fileToBase64(files.voterPhoto),
    fileToBase64(files.drivingLicense),
    fileToBase64(files.odometerPhoto),
    fileToBase64(files.relationProof),
    fileToBase64(files.witnessAadharPhoto),
    fileToBase64(files.paymentScreenshot)
  ])
  .then(([aadhar, pan, voter, license, odometer, proof, witnessAadhar, payment]) => {

    const data = {
      name: form.name.value,
      email: form.email.value,
      representative: form.representative.value,
      handoverType: form.handoverType.value,
      recipientType: form.recipientType.value,
      contact: form.contact.value,
      recipientEmail: form.recipientEmail.value,
      aadharNumber: form.aadharNumber.value,
      aadhar_base64: aadhar.base64,
      aadhar_filename: aadhar.filename,
      panNumber: form.panNumber.value,
      pan_base64: pan.base64,
      pan_filename: pan.filename,
      voterNumber: form.voterNumber.value,
      voter_base64: voter.base64,
      voter_filename: voter.filename,
      vehicleSpeed: form.vehicleSpeed.value,
      drivingLicenseNumber: licenseNumberInput.value,
      license_base64: license.base64,
      license_filename: license.filename,
      regNumber: form.regNumber.value,
      odometer: form.odometer.value,
      odometer_base64: odometer.base64,
      odometer_filename: odometer.filename,
      witnessName: form.witnessName.value,
      witnessRelation: form.witnessRelation.value,
      witnessPhone: form.witnessPhone.value,
      witnessDOB: form.witnessDOB.value,
      relationProof_base64: proof.base64,
      relationProof_filename: proof.filename,
      witnessAadhar_base64: witnessAadhar.base64,
      witnessAadhar_filename: witnessAadhar.filename,
      helmetQuantity: form.helmetQuantity.value,
      tshirtQuantity: form.tshirtQuantity.value,
      raincoatQuantity: form.raincoatQuantity.value,
      payment_base64: payment.base64,
      payment_filename: payment.filename
    };

    // ✅ Fixed fetch (CORS-safe)
    return fetch('https://script.google.com/macros/s/AKfycbwpb8WMzzXa7am08FlXiyV9tz4P7hFn5qw35KsfLJUIVsrrmwujFbaKpa-9D6m9k1ARaA/exec', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'text/plain' }
    });
  })
  .then(response => response.json())
  .then(result => {
    if (result.status === "error") throw new Error(result.message);
    status.innerText = result.message || "✅ Vehicle handover form submitted successfully!";
    form.reset();
    licenseGroup.style.display = "none";
    licenseNumberInput.required = false;
    licenseFileInput.required = false;
  })
  .catch(err => {
    console.error('Submission Error:', err);
    status.innerText = '❌ Error: ' + err.message;
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit";
  });
});
