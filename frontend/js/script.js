const backendURL = "http://localhost:5000/api/auth";

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
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
    localStorage.setItem("role", data.user.role);
    redirectToDashboard(data.user.role);
  } else {
    alert(data.message);
  }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
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
    localStorage.setItem("role", data.role);
    redirectToDashboard(data.role);
  } else {
    alert(data.message);
  }
});

// Redirect Function
function redirectToDashboard(role) {
  if (role === "student") {
    window.location.href = "student.html";
  } else if (role === "teacher") {
    window.location.href = "teachers.html";
  }
}
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  sidebar.classList.toggle("active");

  if (sidebar.classList.contains("active")) {
    mainContent.style.marginLeft = "250px";
  } else {
    mainContent.style.marginLeft = "0";
  }
}
