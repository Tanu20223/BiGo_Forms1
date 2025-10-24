const form = document.getElementById('handoverForm');
const status = document.getElementById('successMessage');
const submitBtn = form.querySelector('button[type="submit"]');

const vehicleSpeed = document.getElementById('vehicleSpeed');
const licenseGroup = document.getElementById('licenseGroup');
const licenseNumberInput = document.getElementById('drivingLicenseNumber');
const licenseFileInput = document.getElementById('drivingLicense');

// Show/hide license fields AND set mandatory requirement
vehicleSpeed.addEventListener('change', () => {
    const isHighSpeed = (vehicleSpeed.value === "high");
    
    licenseGroup.style.display = isHighSpeed ? "block" : "none";
    licenseNumberInput.required = isHighSpeed;
    licenseFileInput.required = isHighSpeed;
});

form.addEventListener('submit', e => {
    e.preventDefault();

    // 1. Disable button immediately
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    // Helper to convert a file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) return resolve({ base64: null, filename: "" });
            const reader = new FileReader();
            reader.onload = event => resolve({ base64: event.target.result.split(',')[1], filename: file.name });
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // 2. Collect all file inputs
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

    // 3. Run all file conversions
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
        
        // 4. Create data object (formType, id, and transactionId removed)
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

        // 5. Send to Google
        // Use your correct, active deployment URL
        return fetch('https://script.google.com/macros/s/AKfycbz-0zbFG4__wUc_hHdRQBDS0MRtFoQYbnBjjndTaxyjy2iWEZIQi51UeltXj2J5KX00/exec', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'text/plain' }
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.status === "error") {
            throw new Error(result.message);
        }
        status.innerText = result.message || "Vehicle handover form submitted successfully!";
        form.reset();
        licenseGroup.style.display = "none";
        licenseNumberInput.required = false; // Reset conditional fields
        licenseFileInput.required = false;   // Reset conditional fields
    })
    .catch(err => {
        console.error('Submission Error:', err);
        status.innerText = 'Error: ' + err.message;
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
    });
});