const backendURL = "http://localhost:5000/api/v1/auth";

// Form toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const signupToggle = document.getElementById("signupToggle");
  const loginToggle = document.getElementById("loginToggle");
  const toLoginLink = document.getElementById("toLoginLink");
  const toSignupLink = document.getElementById("toSignupLink");

  // Toggle between login and signup forms
  function showLoginForm() {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    loginToggle.classList.add("active");
    signupToggle.classList.remove("active");
  }

  function showSignupForm() {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
    signupToggle.classList.add("active");
    loginToggle.classList.remove("active");
  }

  // Event listeners for form toggling
  loginToggle.addEventListener("click", showLoginForm);
  signupToggle.addEventListener("click", showSignupForm);
  toLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginForm();
  });
  toSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSignupForm();
  });

  // Form validation functions
  function validateEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function showError(input, message) {
    const formGroup = input.closest(".form-group");
    formGroup.classList.add("show-error");
    const errorElement = formGroup.querySelector(".error-message");
    if (errorElement) errorElement.textContent = message;
  }

  function clearError(input) {
    const formGroup = input.closest(".form-group");
    formGroup.classList.remove("show-error");
  }

  function showSuccess(form) {
    const successMessage = form.querySelector(".success-message");
    successMessage.style.display = "block";
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }

  // Input validation on blur
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.value.trim() === "") {
        showError(input, `${input.getAttribute("placeholder")} is required`);
      } else if (input.type === "email" && !validateEmail(input.value)) {
        showError(input, "Please enter a valid email address");
      } else if (input.type === "password" && input.value.length < 6) {
        showError(input, "Password must be at least 6 characters");
      } else {
        clearError(input);
      }
    });

    input.addEventListener("input", () => {
      clearError(input);
    });
  });
});

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form elements
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");
  const roleSelect = document.getElementById("signupRole");

  // Validate inputs
  let isValid = true;

  if (nameInput.value.trim() === "") {
    showError(nameInput, "Please enter your full name");
    isValid = false;
  }

  if (!validateEmail(emailInput.value)) {
    showError(emailInput, "Please enter a valid email address");
    isValid = false;
  }

  if (passwordInput.value.length < 6) {
    showError(passwordInput, "Password must be at least 6 characters");
    isValid = false;
  }

  if (!isValid) return;

  // Submit form if valid
  try {
    const response = await fetch(`${backendURL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        role: roleSelect.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess(document.getElementById("signupForm"));

      // Store role & token
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("accessToken", data.user.accessToken);

      // Clear form
      nameInput.value = "";
      emailInput.value = "";
      passwordInput.value = "";

      // Redirect after short delay
      setTimeout(() => {
        redirectToDashboard(data.user.role);
      }, 1500);
    } else {
      showError(emailInput, data.message || "Registration failed");
    }
  } catch (error) {
    showError(emailInput, "An error occurred. Please try again.");
    console.error("Signup error:", error);
  }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form elements
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  // Validate inputs
  let isValid = true;

  if (!validateEmail(emailInput.value)) {
    showError(emailInput, "Please enter a valid email address");
    isValid = false;
  }

  if (passwordInput.value.trim() === "") {
    showError(passwordInput, "Please enter your password");
    isValid = false;
  }

  if (!isValid) return;

  // Submit form if valid
  try {
    const response = await fetch(`${backendURL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess(document.getElementById("loginForm"));

      // Store Access Token & Role
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.user.role);

      // Clear form
      emailInput.value = "";
      passwordInput.value = "";

      // Redirect after short delay
      setTimeout(() => {
        redirectToDashboard(data.user.role);
      }, 1500);
    } else {
      showError(emailInput, data.message || "Login failed");
    }
  } catch (error) {
    showError(emailInput, "An error occurred. Please try again.");
    console.error("Login error:", error);
  }
});

// Helper functions defined at global scope
function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function showError(input, message) {
  const formGroup = input.closest(".form-group");
  formGroup.classList.add("show-error");
  const errorElement = formGroup.querySelector(".error-message");
  if (errorElement) errorElement.textContent = message;
}

function clearError(input) {
  const formGroup = input.closest(".form-group");
  formGroup.classList.remove("show-error");
}

function showSuccess(form) {
  const successMessage = form.querySelector(".success-message");
  successMessage.style.display = "block";
  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
}

// Redirect Function
function redirectToDashboard(role) {
  if (role === "student") {
    window.location.href = "student.html";
  } else if (role === "teacher") {
    window.location.href = "teachers.html";
  }
}

function toggleSidebar() {
  document.body.classList.toggle("sidebar-collapsed");

  // If you want to save the state
  const isSidebarCollapsed =
    document.body.classList.contains("sidebar-collapsed");
  localStorage.setItem("sidebar-collapsed", isSidebarCollapsed);
}

// Check saved sidebar state on page load
document.addEventListener("DOMContentLoaded", () => {
  const isSidebarCollapsed =
    localStorage.getItem("sidebar-collapsed") === "true";
  if (isSidebarCollapsed) {
    document.body.classList.add("sidebar-collapsed");
  }
});
