document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("familyMembersSection");
  const addBtn = document.getElementById("addMemberBtn");

  // Function to add new family row
  function addFamilyRow() {
    const div = document.createElement("div");
    div.classList.add("family-row");
    div.innerHTML = `
      <input type="text" name="family_name[]" placeholder="Enter family member name">
      <input type="tel" name="family_phone[]" placeholder="Enter phone number">
      <button type="button" class="remove-row-btn">✖</button>
    `;
    section.appendChild(div);
  }

  // Initial row
  addFamilyRow();

  // Add new row
  addBtn.addEventListener("click", () => addFamilyRow());

  // Remove row (delegation)
  section.addEventListener("click", e => {
    if (e.target.classList.contains("remove-row-btn")) {
      const row = e.target.closest(".family-row");
      row.remove();

      // If all rows are deleted, add one empty row back
      if (section.children.length === 0) {
        addFamilyRow();
      }
    }
  });

  // Submit form
  document.getElementById("bigoForm").addEventListener("submit", e => {
    e.preventDefault();

    const file = document.getElementById("signatureFile").files[0];
    if (!file) return alert("Please upload your signature image.");

    const reader = new FileReader();
    reader.onloadend = function() {
      const signatureData = reader.result;

      const names = [...document.getElementsByName("family_name[]")].map(x => x.value);
      const phones = [...document.getElementsByName("family_phone[]")].map(x => x.value);
      const familyDetails = names.map((n, i) => `${i + 1}. ${n} - ${phones[i]}`).join("\n");

      const data = Object.fromEntries(new FormData(e.target).entries());
      data.family_details = familyDetails;
      data.signature = signatureData;

      fetch("https://script.google.com/macros/s/AKfycbxJin1_Id8vpCh4ULJ81ORZBs6kEgRYY3moZDRdCpg7_KsrToUgibBeRo3osp-xFSPe1g/exec", {
        method: "POST",
        body: JSON.stringify(data)
      })
      .then(res => res.text())
      .then(() => {
        document.getElementById("responseMessage").innerText = "✅ Form submitted successfully!";
        e.target.reset();
        section.innerHTML = "";
        addFamilyRow();
      })
      .catch(() => {
        document.getElementById("responseMessage").innerText = "❌ Error submitting form.";
      });
    };
    reader.readAsDataURL(file);
  });
});




