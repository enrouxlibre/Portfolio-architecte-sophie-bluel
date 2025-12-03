/* ========================================
   LOGIN PAGE LOGIC
   ======================================== */

// Redirect to home page if user is already logged in
if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}

// Handle login form submission
document
  .querySelector("#login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Get user credentials from form inputs
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Attempt login via API
    login(email, password).then((success) => {
      if (success) {
        // Redirect to home page on successful login
        window.location.href = "index.html";
      } else {
        // Display error message on failed login
        document.querySelector("#error-message").innerText =
          "Erreur dans l'identifiant ou le mot de passe.";
      }
    });
  });
