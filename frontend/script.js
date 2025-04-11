const backendURL = "http://localhost:5000/api/v1/auth";

// Add event listeners only if elements exist
document.addEventListener("DOMContentLoaded", () => {
  // Signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      const role = document.getElementById("signupRole").value;

      const response = await fetch(`${backendURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        // Store role & token
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("accessToken", data.user.accessToken);

        redirectToDashboard(data.user.role);
      } else {
        alert(data.message);
      }
    });
  }

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const response = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 🔹 Store Access Token & Role
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", data.user.role);

        redirectToDashboard(data.user.role);
      } else {
        alert(data.message);
      }
    });
  }

  // Check saved sidebar state on page load
  const isSidebarCollapsed =
    localStorage.getItem("sidebar-collapsed") === "true";
  if (isSidebarCollapsed) {
    document.body.classList.add("sidebar-collapsed");
  }
});

// Redirect Function
function redirectToDashboard(role) {
  if (role === "student") {
    window.location.href = "html/student.html";
  } else if (role === "teacher") {
    window.location.href = "html/teachers.html";
  }
}

function toggleSidebar() {
  document.body.classList.toggle("sidebar-collapsed");

  // If you want to save the state
  const isSidebarCollapsed =
    document.body.classList.contains("sidebar-collapsed");
  localStorage.setItem("sidebar-collapsed", isSidebarCollapsed);
}
