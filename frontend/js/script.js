const backendURL = "http://localhost:5000/api/auth";
function redirectToDashboard(role) {
  if (role === "teacher") {
    window.location.href = "teacher.html";
  } else if (role === "student") {
    window.location.href = "student.html";
  } else {
    alert("Unknown role. Redirecting to homepage.");
    window.location.href = "index.html";
  }
}
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
    localStorage.setItem("role", data.user.role); // Store role
    window.location.href = "dashboard.html"; // Redirect
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
    alert(`Welcome ${data.user.name}! Your role: ${data.user.role}`);
    localStorage.setItem("role", data.user.role); // ✅ Store role
    redirectToDashboard(data.user.role); // ✅ Redirect based on role
  } else {
    alert(data.message);
  }
});
