
const form = document.getElementById('handoverForm');
const status = document.getElementById('successMessage');
const submitBtn = form.querySelector('button[type="submit"]'); // ✅ define submit button

const vehicleSpeed = document.getElementById('vehicleSpeed');
const licenseGroup = document.getElementById('licenseGroup');

// Show/hide license fields
vehicleSpeed.addEventListener('change', () => {
    if (vehicleSpeed.value === "high") {
        licenseGroup.style.display = "block";
    } else {
        licenseGroup.style.display = "none";
    }
});

form.addEventListener('submit', e => {
    e.preventDefault();

    // Disable button immediately
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    // Collect all file inputs
    const files = {
        aadharPhoto: document.getElementById('aadharPhoto').files[0],
        panPhoto: document.getElementById('panPhoto').files[0],
        voterPhoto: document.getElementById('voterPhoto').files[0],
        drivingLicense: document.getElementById('drivingLicense').files[0],
        odometerPhoto: document.getElementById('odometerPhoto').files[0]
    };

    // Helper to convert a file to base64
    function fileToBase64(file) {
        return new Promise(resolve => {
            if (!file) return resolve({ base64: null, filename: "" });
            const reader = new FileReader();
            reader.onload = event => resolve({ base64: event.target.result.split(',')[1], filename: file.name });
            reader.readAsDataURL(file);
        });
    }

    Promise.all([
        fileToBase64(files.aadharPhoto),
        fileToBase64(files.panPhoto),
        fileToBase64(files.voterPhoto),
        fileToBase64(files.drivingLicense),
        fileToBase64(files.odometerPhoto)
    ]).then(([aadhar, pan, voter, license, odometer]) => {
        const data = {
            formType: "vehicle_handover",
            id: form.id.value,
            name: form.name.value,
            email: form.email.value,
            representative: form.representative.value,
            location: form.location.value,
            handoverType: form.handoverType.value,
            recipientName: form.recipientName.value,
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
            drivingLicenseNumber: form.drivingLicenseNumber.value,
            license_base64: license.base64,
            license_filename: license.filename,
            regNumber: form.regNumber.value,
            odometer: form.odometer.value,
            odometer_base64: odometer.base64,
            odometer_filename: odometer.filename
        };

        fetch('https://script.google.com/macros/s/AKfycbzOg8FH9-M4GmsfcKLj08Dts5kaA-Pc9ZxmKL_1t3vEkHpySenzb3GlNROa1kxhDoS7qQ/exec', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'text/plain' }
        })
        .then(response => response.json())
        .then(result => {
            status.innerText = result.message || "Vehicle handover form submitted successfully!";
            form.reset();
            licenseGroup.style.display = "none"; // reset hidden field
        })
        .catch(err => {
            status.innerText = 'Error: ' + err.message;
        })
        .finally(() => {
            // Re-enable button after everything is done
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";
        });
    });
});
