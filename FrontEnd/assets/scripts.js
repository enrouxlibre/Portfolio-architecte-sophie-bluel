const url = "http://localhost:5678/api";

async function getWorks() {
  try {
    const response = await fetch(url + "/works", {
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

async function getCategories() {
  try {
    const response = await fetch(url + "/categories", {
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

displayCategories();
displayWorks();

async function displayCategories() {
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
  let filterButtons = document.querySelector(".filter-buttons");
  categories.forEach((category) => {
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
  });
}
async function displayWorks() {
  let works = await getWorks();
  let gallery = document.querySelector(".gallery");
  works.forEach((work) => {
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
  });
}
