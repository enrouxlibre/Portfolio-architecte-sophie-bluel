let loggedIn = false;
if (localStorage.getItem("token")) {
  loggedIn = true;
  document.body.classList.add("edition-mode-active");
  document.querySelector(".add-photo-button").addEventListener("click", () => {
    document.querySelector(".modal-container").classList.add("photo-mode");
  });
  document.querySelector(".back-button").addEventListener("click", () => {
    document.querySelector(".modal-container").classList.remove("photo-mode");
  });
  document
    .querySelector(".close-editor-modal")
    .addEventListener("click", () => {
      document.querySelector("#editor-modal").close();
    });
  document.querySelector(".open-editor-modal").addEventListener("click", () => {
    document.querySelector("#editor-modal").showModal();
  });

  window.addEventListener("dragover", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

  window.addEventListener("drop", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

  const dropZone = document.querySelector("#drop-zone");
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  });

  const savedHTML = dropZone.innerHTML;

  const imageInput = document.querySelector("#image-input");

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length === 1) {
      const file = files[0];
      try {
        if (validateImage(file)) {
          imageInput.files = files;
          displayImage(file);
          checkForm(addPhotoForm);
        }
      } catch (error) {
        uploadMessageDiv.innerText = error;
        uploadMessageDiv.style.color = "red";
      }
    }
  });
  imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    try {
      if (validateImage(file)) {
        displayImage(file);
        checkForm(addPhotoForm);
      }
    } catch (error) {
      imageInput.value = "";
      uploadMessageDiv.innerText = error;
      uploadMessageDiv.style.color = "red";
    }
  });

  let addPhotoForm = document.querySelector("#add-photo-form");

  addPhotoForm.querySelectorAll("input,select").forEach(function (e) {
    e.addEventListener("change", function () {
      checkForm(addPhotoForm);
    });
    e.addEventListener("keyup", function () {
      checkForm(addPhotoForm);
    });
  });

  const uploadMessageDiv = document.querySelector("#upload-message");

  addPhotoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!checkForm(addPhotoForm)) {
      return false;
    }

    let workData = new FormData(addPhotoForm);
    postWork(workData).then((success) => {
      if (success) {
        addPhotoForm.querySelectorAll("input,select").forEach(function (e) {
          e.value = "";
        });
        dropZone.innerHTML = savedHTML;
        displayWorks(true);
        checkForm(addPhotoForm);
        uploadMessageDiv.innerText = "Le projet a bien été envoyé.";
        uploadMessageDiv.style.color = "green";
      } else {
        uploadMessageDiv.innerText =
          "Une erreur a eu lieu lors de l'envoi du projet.";
        uploadMessageDiv.style.color = "red";
      }
    });
  });
}

displayCategories(loggedIn);
displayWorks(loggedIn);
