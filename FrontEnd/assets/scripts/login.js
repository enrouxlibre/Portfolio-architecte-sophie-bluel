if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}

document
  .querySelector("#login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    login(email, password).then((success) => {
      if (success) {
        window.location.href = "index.html";
      } else {
        document.querySelector("#error-message").innerText =
          "La connexion a échoué. Veuillez vérifier votre e-mail et votre mot de passe.";
      }
    });
  });
