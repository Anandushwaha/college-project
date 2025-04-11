document.addEventListener("DOMContentLoaded", async () => {
  const coursesContainer = document.getElementById("courses-container");
  const emptyState = document.getElementById("emptyState");

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Unauthorized: Please log in first.");
      window.location.href = "../index.html";
      return;
    }

    // Show loading state
    coursesContainer.innerHTML =
      '<div class="loading" style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="font-size: 30px; color: var(--primary-color);"></i><p style="margin-top: 15px; color: var(--text-light);">Loading courses...</p></div>';

    const response = await fetch("http://localhost:5000/api/v1/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const courses = await response.json();

    if (!response.ok) {
      showErrorMessage(courses.message || "Failed to load courses");
      coursesContainer.innerHTML = "";
      return;
    }

    // Check if courses array is empty
    if (!courses || courses.length === 0) {
      coursesContainer.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    // Hide empty state if courses exist
    emptyState.style.display = "none";

    // Render courses with improved UI
    coursesContainer.innerHTML = courses
      .map((course, index) => {
        // Generate a placeholder image if course doesn't have one
        const courseImage =
          course.imageUrl ||
          `https://via.placeholder.com/600x400?text=${encodeURIComponent(
            course.title
          )}`;

        // Format course description with fallback
        const description =
          course.description ||
          "Explore this course to learn new skills and advance your knowledge.";

        // Limit description length
        const shortDescription =
          description.length > 120
            ? description.substring(0, 120) + "..."
            : description;

        return `
            <div class="course-card" style="--index: ${index}">
                <div class="course-image">
                    <img src="${courseImage}" alt="${course.title}">
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    
                    <div class="course-instructor">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(
                          course.teacherId
                            ? course.teacherId.name
                            : "Instructor"
                        )}&background=4a6de5&color=fff" alt="Instructor">
                        <span>${
                          course.teacherId
                            ? course.teacherId.name
                            : "Instructor"
                        }</span>
                    </div>
                    
                    <div class="course-description">
                        ${shortDescription}
                    </div>
                    
                    <div class="course-stats">
                        <span><i class="fas fa-users"></i> ${
                          Math.floor(Math.random() * 30) + 5
                        } Students</span>
                        <span><i class="fas fa-clock"></i> ${
                          Math.floor(Math.random() * 10) + 2
                        } weeks</span>
                    </div>
                    
                    <button class="enroll-btn" data-id="${course._id}">
                        <i class="fas fa-graduation-cap"></i> Enroll Now
                    </button>
                </div>
            </div>
          `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading courses:", error);
    showErrorMessage("Failed to load courses. Please try again later.");
    coursesContainer.innerHTML = "";
  }
});

// Event delegation for enrollment buttons
document.addEventListener("click", (e) => {
  if (e.target.closest(".enroll-btn")) {
    const button = e.target.closest(".enroll-btn");
    const courseId = button.getAttribute("data-id");
    if (!courseId) {
      showErrorMessage("Course information missing");
      return;
    }

    // Change button state while processing
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    enrollInCourse(courseId, button);
  }
});

async function enrollInCourse(courseId, buttonElement) {
  try {
    if (!courseId) {
      console.error("Invalid courseId:", courseId);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      showErrorMessage("You must be logged in!");
      buttonElement.disabled = false;
      buttonElement.innerHTML =
        '<i class="fas fa-graduation-cap"></i> Enroll Now';
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/v1/courses/enroll/${courseId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Enrollment failed");

    // Show success message
    showSuccessMessage("Enrollment request sent successfully!");

    // Update button to show enrolled state
    buttonElement.disabled = true;
    buttonElement.innerHTML =
      '<i class="fas fa-check-circle"></i> Request Sent';
    buttonElement.style.backgroundColor = "var(--success)";

    // Add enrolled badge to course card
    const courseCard = buttonElement.closest(".course-card");
    const badge = document.createElement("div");
    badge.className = "enrolled-badge";
    badge.innerHTML = "Request Pending";
    courseCard.appendChild(badge);
  } catch (error) {
    console.error("Error sending enrollment request:", error);
    showErrorMessage(error.message || "Failed to send enrollment request");

    // Reset button
    buttonElement.disabled = false;
    buttonElement.innerHTML =
      '<i class="fas fa-graduation-cap"></i> Enroll Now';
  }
}

// Toast message functions
function showSuccessMessage(message) {
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");

  successText.textContent = message;
  successMessage.style.display = "flex";

  setTimeout(() => {
    successMessage.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    successMessage.style.opacity = "0";
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 300);
  }, 3000);
}

function showErrorMessage(message) {
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");

  errorText.textContent = message;
  errorMessage.style.display = "flex";

  setTimeout(() => {
    errorMessage.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    errorMessage.style.opacity = "0";
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 300);
  }, 3000);
}
