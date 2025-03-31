document.addEventListener("DOMContentLoaded", async () => {
  const coursesContainer = document.getElementById("courses-container");

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Unauthorized: Please log in first.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/v1/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const courses = await response.json();

    if (!response.ok) {
      alert(`Error: ${courses.message}`);
      return;
    }

    // Render courses
    coursesContainer.innerHTML = courses
      .map(
        (course) => `
            <div class="course-card">
                <h3>${course.title}</h3>
               <p><strong>Instructor:</strong> ${
                 course.teacherId ? course.teacherId.name : "Unknown"
               } </p>

                <button class="enroll-btn"  id ="enroll" data-id="${
                  course._id
                }">Enroll</button>
            </div>
        `
      )
      .join("");

    // Add event listeners for enrollment
  } catch (error) {
    console.error("Error loading courses:", error);
    alert("Failed to load courses.");
  }
});
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("enroll-btn")) {
    const courseId = e.target.getAttribute("data-id"); // ✅ Get courseId from button
    if (!courseId) {
      console.error("No course ID found!");
      return;
    }
    enrollInCourse(courseId);
  }
});

async function enrollInCourse(courseId) {
  try {
    if (!courseId) {
      console.error("Invalid courseId:", courseId);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return alert("You must be logged in!");

    const response = await fetch(
      `http://localhost:5000/api/v1/courses/enroll/${courseId}`, // ✅ Correct URL
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    alert("Enrollment request sent successfully!");
  } catch (error) {
    console.error("Error sending enrollment request:", error);
    alert(error.message || "Failed to send request.");
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const lecturesContainer = document.getElementById("lectures-container");

  try {
    // Fetch enrolled courses (Assuming API exists)
    const courseResponse = await fetch("/api/v1/courses/enrolled", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!courseResponse.ok) {
      throw new Error("Failed to fetch enrolled courses");
    }

    const courses = await courseResponse.json();

    for (const course of courses) {
      // Fetch lectures for each enrolled course
      const lectureResponse = await fetch(`/api/v1/lectures/${course._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!lectureResponse.ok) {
        throw new Error(`Failed to fetch lectures for ${course.title}`);
      }

      const lectures = await lectureResponse.json();

      // Create course section
      const courseSection = document.createElement("div");
      courseSection.innerHTML = `<h3>${course.title}</h3>`;

      // List lectures
      lectures.forEach((lecture) => {
        const lectureItem = document.createElement("div");
        lectureItem.innerHTML = `
          <p>${lecture.title} - <a href="${lecture.fileUrl}" target="_blank">Download</a></p>
        `;
        courseSection.appendChild(lectureItem);
      });

      lecturesContainer.appendChild(courseSection);
    }
  } catch (error) {
    console.error(error);
    lecturesContainer.innerHTML = "<p>Failed to load lectures.</p>";
  }
});
