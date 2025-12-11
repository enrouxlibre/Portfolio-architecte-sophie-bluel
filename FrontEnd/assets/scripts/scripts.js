/* ========================================
   API COMMUNICATION FUNCTIONS
   ======================================== */

// Base URL for all API requests
const url = "http://localhost:5678/api";

/**
 * Generic function to fetch data from the API
 * @param {string} endpoint - API endpoint to fetch from (e.g., "/works", "/categories")
 * @returns {Promise<Object|Array>} JSON response from the API
 */
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

/**
 * Fetch all works/projects from the API
 * @returns {Promise<Array>} Array of work objects
 */
async function getWorks() {
  return await getData("/works");
}

/**
 * Fetch all categories from the API
 * @returns {Promise<Array>} Array of category objects
 */
async function getCategories() {
  return await getData("/categories");
}

/**
 * Authenticate user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<boolean>} True if login successful, undefined otherwise
 */
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
    // Store authentication token in localStorage for future requests
    localStorage.setItem("token", result.token);
    return true;
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Delete a work/project from the database
 * @param {number} workId - ID of the work to delete
 * @returns {Promise<boolean>} True if deletion successful, undefined otherwise
 */
async function deleteWork(workId) {
  // Retrieve authentication token from localStorage
  let token = localStorage.getItem("token");
  try {
    const response = await fetch(url + "/works/" + workId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token, // Include token for authentication
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

/**
 * Upload a new work/project to the database
 * @param {FormData} workData - FormData object containing image, title, and category
 * @returns {Promise<Object>} Created work object if successful
 */
async function postWork(workData) {
  // Retrieve authentication token from localStorage
  let token = localStorage.getItem("token");
  try {
    const response = await fetch(url + "/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token, // Include token for authentication
      },
      body: workData, // FormData is sent as-is (multipart/form-data)
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

/**
 * Log out the user by removing their token and redirecting to home page
 */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* ========================================
   DOM MANIPULATION FUNCTIONS
   ======================================== */

/**
 * Display category filter buttons and populate category dropdown
 * @param {boolean} loggedIn - Whether the user is logged in (affects dropdown visibility)
 */
async function displayCategories(loggedIn = false) {
  // Set up "All" button to show all works when clicked
  let allWorksButton = document.getElementById("show_all_works");
  allWorksButton.addEventListener("click", () => {
    // Remove active class from currently active button
    document
      .querySelector(".filter-buttons button.active")
      .classList.remove("active");
    allWorksButton.classList.add("active");
    // Show all works by setting display to block
    let allWorks = document.querySelectorAll(".gallery figure");
    allWorks.forEach((work) => {
      work.style.display = "block";
    });
  });

  // Fetch categories and create filter buttons for each
  let categories = await getCategories();
  categories.forEach((category) => {
    addFilterButton(category);
    // If logged in, also add categories to the modal dropdown
    if (loggedIn) {
      addCategoryOption(category);
    }
  });
}

/**
 * Add a category option to the category selector dropdown in the modal
 * @param {Object} category - Category object with id and name
 */
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
  // Clear existing works from both gallery and modal
  let gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  let modalGallery = document.querySelector(".modal-gallery-main");
  modalGallery.innerHTML = "";

  // Fetch all works from API
  let works = await getWorks();
  works.forEach((work) => {
    // Add work to main gallery
    addWorkElement(work, gallery);
    // If logged in, also add to modal gallery with delete option
    if (loggedIn) {
      addWorkToModal(work, modalGallery);
    }
  });
}

/**
 * Add a work element to the modal gallery with delete functionality
 * @param {Object} work - Work object with id, imageUrl, and title
 * @param {HTMLElement} modalGallery - Modal gallery container element
 */
function addWorkToModal(work, modalGallery) {
  const deleteMessageDiv = document.querySelector("#delete-message");

  // Create figure element with image
  let figure = document.createElement("figure");
  let img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  // Create delete icon
  let deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash-can", "delete-icon");

  // Add click handler to delete work
  deleteIcon.addEventListener("click", (event) => {
    if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
      deleteWork(work.id).then((success) => {
        if (success) {
          // Refresh works display after successful deletion
          displayWorks(true);
        } else {
          // Show error message
          deleteMessageDiv.innerHTML = "La suppression a échoué.";
          deleteMessageDiv.style.color = "red";
        }
      });
    }
  });

  figure.appendChild(img);
  figure.appendChild(deleteIcon);
  modalGallery.appendChild(figure);
}

/**
 * Add a work element to the main gallery
 * @param {Object} work - Work object with categoryId, imageUrl, and title
 * @param {HTMLElement} gallery - Gallery container element
 */
function addWorkElement(work, gallery) {
  // Create figure element with category data attribute for filtering
  let figure = document.createElement("figure");
  figure.dataset.categoryId = work.categoryId;

  // Create and configure image
  let img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  // Create caption with work title
  let caption = document.createElement("figcaption");
  caption.innerText = work.title;

  figure.appendChild(img);
  figure.appendChild(caption);
  gallery.appendChild(figure);
}

/**
 * Validate form by checking if all inputs have values
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} True if all fields are filled, false otherwise
 */
function checkForm(form) {
  const submitButton = form.querySelector("[type='submit']");
  let result = true;

  // Check if any input or select field is empty
  form.querySelectorAll("input,select").forEach(function (e) {
    if (e.value == "") {
      result = false;
    }
  });

  // Enable/disable submit button based on validation
  if (result) {
    submitButton.classList.remove("disabled");
  } else {
    submitButton.classList.add("disabled");
  }

  return result;
}

/**
 * Display selected image in the drop zone
 * @param {File} file - Image file to display
 */
function displayImage(file) {
  let dropZone = document.getElementById("drop-zone");
  // Create image preview using object URL
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.alt = file.name;
  // Replace drop zone content with image preview
  dropZone.innerHTML = "";
  dropZone.appendChild(img);
}

/**
 * Validate image file type and size
 * @param {File} file - Image file to validate
 * @returns {boolean} True if valid
 * @throws {Error} If file type or size is invalid
 */
function validateImage(file) {
  // Check if file type is PNG or JPEG
  if (file.type === "image/png" || file.type === "image/jpeg") {
    // Check if file size is less than 4MB (4194304 bytes)
    if (file.size < 4194304) {
      return true;
    } else {
      throw new Error("Votre image doit faire moins de 4 Mo.");
    }
  } else {
    throw new Error("Veuillez envoyer une image au format JPG ou PNG.");
  }
}
