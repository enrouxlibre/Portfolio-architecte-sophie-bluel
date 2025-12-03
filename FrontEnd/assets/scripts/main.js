/* ========================================
   MAIN APPLICATION LOGIC
   ======================================== */

// Check if user is logged in by verifying token in localStorage
let loggedIn = false;
if (localStorage.getItem("token")) {
  loggedIn = true;
  // Enable edition mode styling and features
  document.body.classList.add("edition-mode-active");

  /* ========================================
     MODAL NAVIGATION EVENT LISTENERS
     ======================================== */

  // Switch to "add photo" mode in modal
  document.querySelector(".add-photo-button").addEventListener("click", () => {
    document.querySelector(".modal-container").classList.add("photo-mode");
  });

  // Return to gallery view in modal
  document.querySelector(".back-button").addEventListener("click", () => {
    document.querySelector(".modal-container").classList.remove("photo-mode");
  });

  // Close modal when clicking close button
  document
    .querySelector(".close-editor-modal")
    .addEventListener("click", () => {
      document.querySelector("#editor-modal").close();
    });

  // Close modal when clicking outside (on backdrop)
  document.querySelector("#editor-modal").addEventListener("click", (event) => {
    if (event.target == document.querySelector("#editor-modal")) {
      document.querySelector("#editor-modal").close();
    }
  });

  // Open modal when clicking edit button
  document.querySelector(".open-editor-modal").addEventListener("click", () => {
    document.querySelector("#editor-modal").showModal();
  });

  /* ========================================
     DRAG AND DROP EVENT LISTENERS
     ======================================== */

  // Prevent default drag behavior on window (prevents file from opening in browser)
  window.addEventListener("dragover", (e) => {
    // Only prevent default if dragging a file
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

  // Prevent default drop behavior on window
  window.addEventListener("drop", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

  // Configure drop zone for file uploads
  const dropZone = document.querySelector("#drop-zone");
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    // Show copy cursor when dragging over drop zone
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  });

  // Save original drop zone HTML to restore after image display
  const savedHTML = dropZone.innerHTML;

  const imageInput = document.querySelector("#image-input");

  // Handle file drop in drop zone
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Get dropped files
    const files = e.dataTransfer ? e.dataTransfer.files : null;
    // Only accept single file
    if (files && files.length === 1) {
      const file = files[0];
      try {
        // Validate and display image
        if (validateImage(file)) {
          imageInput.files = files; // Assign to file input
          displayImage(file);
          checkForm(addPhotoForm);
        }
      } catch (error) {
        // Display validation error message
        uploadMessageDiv.innerText = error;
        uploadMessageDiv.style.color = "red";
      }
    }
  });

  /* ========================================
     FILE INPUT EVENT LISTENER
     ======================================== */

  // Handle manual file selection via input
  imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    try {
      if (validateImage(file)) {
        displayImage(file);
        checkForm(addPhotoForm);
      }
    } catch (error) {
      // Clear invalid file and show error
      imageInput.value = "";
      uploadMessageDiv.innerText = error;
      uploadMessageDiv.style.color = "red";
    }
  });

  /* ========================================
     FORM VALIDATION AND SUBMISSION
     ======================================== */

  let addPhotoForm = document.querySelector("#add-photo-form");

  // Add real-time form validation listeners
  addPhotoForm.querySelectorAll("input,select").forEach(function (e) {
    // Check form validity on change
    e.addEventListener("change", function () {
      checkForm(addPhotoForm);
    });
    // Check form validity on keyup (for text inputs)
    e.addEventListener("keyup", function () {
      checkForm(addPhotoForm);
    });
  });

  const uploadMessageDiv = document.querySelector("#upload-message");

  // Handle form submission
  addPhotoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Final validation check before submission
    if (!checkForm(addPhotoForm)) {
      return false;
    }

    // Create FormData from form inputs
    let workData = new FormData(addPhotoForm);
    postWork(workData).then((success) => {
      if (success) {
        // Reset form on successful upload
        addPhotoForm.querySelectorAll("input,select").forEach(function (e) {
          e.value = "";
        });
        // Restore drop zone to original state
        dropZone.innerHTML = savedHTML;
        // Refresh works display with new work
        displayWorks(true);
        // Recheck form (should disable submit button)
        checkForm(addPhotoForm);
        // Show success message
        uploadMessageDiv.innerText = "Le projet a bien été envoyé.";
        uploadMessageDiv.style.color = "green";
      } else {
        // Show error message on failure
        uploadMessageDiv.innerText =
          "Une erreur a eu lieu lors de l'envoi du projet.";
        uploadMessageDiv.style.color = "red";
      }
    });
  });
}

/* ========================================
   INITIAL PAGE SETUP
   ======================================== */

// Display categories and works on page load
displayCategories(loggedIn);
displayWorks(loggedIn);

/* ========================================
   LOGOUT FUNCTIONALITY
   ======================================== */

// Handle logout link click
const logoutLink = document.querySelector("#logout a");
logoutLink.addEventListener("click", function (e) {
  e.preventDefault();
  logout();
});
