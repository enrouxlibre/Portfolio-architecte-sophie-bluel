displayCategories();
displayWorks();

if (localStorage.getItem("token")) {
  document.body.classList.add("edition-mode-active");
}
