/* api stuff */

const url = "http://localhost:5678/api";

async function getData(endpoint) {
  try {
    const response = await fetch(url + endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

async function getWorks() {
  return await getData("/works");
}

async function getCategories() {
  return await getData("/categories");
}

async function login(email, password) {
  try {
    const response = await fetch(url + "/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    localStorage.setItem("token", result.token);
    return true;
  } catch (error) {
    console.error(error.message);
  }
}

async function deleteWork(workId) {
  let token = localStorage.getItem("token");
  try {
    const response = await fetch(url + "/works/" + workId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(error.message);
  }
}

async function postWork(workData) {
  let token = localStorage.getItem("token");
  try {
    const response = await fetch(url + "/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: workData,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* DOM stuff */

async function displayCategories(loggedIn = false) {
  let allWorksButton = document.getElementById("show_all_works");
  allWorksButton.addEventListener("click", () => {
    document
      .querySelector(".filter-buttons button.active")
      .classList.remove("active");
    allWorksButton.classList.add("active");
    let allWorks = document.querySelectorAll(".gallery figure");
    allWorks.forEach((work) => {
      work.style.display = "block";
    });
  });

  let categories = await getCategories();
  categories.forEach((category) => {
    addFilterButton(category);
    if (loggedIn) {
      addCategoryOption(category);
    }
  });
}

function addCategoryOption(category) {
  let categorySelect = document.getElementById("category-selector");
  let option = document.createElement("option");
  option.value = category.id;
  option.innerText = category.name;
  categorySelect.appendChild(option);
}

function addFilterButton(category) {
  let filterButtons = document.querySelector(".filter-buttons");
  let button = document.createElement("button");
  button.innerText = category.name;
  button.dataset.categoryId = category.id;
  button.addEventListener("click", (event) => {
    let currentButton = event.target;
    document
      .querySelector(".filter-buttons button.active")
      .classList.remove("active");
    currentButton.classList.add("active");
    let selectedCategoryId = currentButton.dataset.categoryId;
    let categoryWorks = document.querySelectorAll(
      ".gallery [data-category-id='" + selectedCategoryId + "']"
    );
    let allWorks = document.querySelectorAll(".gallery figure");
    allWorks.forEach((work) => {
      work.style.display = "none";
    });
    categoryWorks.forEach((work) => {
      work.style.display = "block";
    });
  });
  filterButtons.appendChild(button);
}

async function displayWorks(loggedIn = false) {
  let gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  let modalGallery = document.querySelector(".modal-gallery-main");
  modalGallery.innerHTML = "";
  let works = await getWorks();
  works.forEach((work) => {
    addWorkElement(work, gallery);
    if (loggedIn) {
      addWorkToModal(work, modalGallery);
    }
  });
}

function addWorkToModal(work, modalGallery) {
  const deleteMessageDiv = document.querySelector("#delete-message");
  let figure = document.createElement("figure");
  let img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;
  let deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash-can", "delete-icon");
  deleteIcon.addEventListener("click", (event) => {
    deleteWork(work.id).then((success) => {
      if (success) {
        displayWorks(true);
      } else {
        deleteMessageDiv.innerHTML = "La suppression a échoué.";
        deleteMessageDiv.style.color = "red";
      }
    });
  });
  figure.appendChild(img);
  figure.appendChild(deleteIcon);
  modalGallery.appendChild(figure);
}

function addWorkElement(work, gallery) {
  let figure = document.createElement("figure");
  figure.dataset.categoryId = work.categoryId;
  let img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;
  let caption = document.createElement("figcaption");
  caption.innerText = work.title;
  figure.appendChild(img);
  figure.appendChild(caption);
  gallery.appendChild(figure);
}

function checkForm(form) {
  const submitButton = form.querySelector("[type='submit']");
  let result = true;
  form.querySelectorAll("input,select").forEach(function (e) {
    if (e.value == "") {
      result = false;
    }
  });
  submitButton.disabled = !result;
  return result;
}

function displayImage(file) {
  let dropZone = document.getElementById("drop-zone");
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.alt = file.name;
  dropZone.innerHTML = "";
  dropZone.appendChild(img);
}

function validateImage(file) {
  if (file.type === "image/png" || file.type === "image/jpeg") {
    if (file.size < 4194304) {
      return true;
    } else {
      throw new Error("Votre image doit faire moins de 4 Mo.");
    }
  } else {
    throw new Error("Veuillez envoyer une image au format JPG ou PNG.");
  }
  return false;
}
