document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Unauthorized access!");
    window.location.href = "../index.html";
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/courses/teacher",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const courseList = document.getElementById("courseList");
    courseList.innerHTML = ""; // Clear existing list

    if (data.courses.length === 0) {
      courseList.innerHTML = "<li>No courses found.</li>";
    } else {
      data.courses.forEach((course) => {
        const courseItem = document.createElement("li");
        courseItem.innerHTML = `
            ${course.title} 
            <button class="edit-btn" onclick="updateCourse('${course._id}')">✏️</button>
            <button class="delete-btn" onclick="deleteCourse('${course._id}')">🗑️</button>
          `;
        courseList.appendChild(courseItem);
      });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
});

// Function to Delete a Course
async function deleteCourse(courseId) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to delete this course?")) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/courses/${courseId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    alert(data.message);
    location.reload(); // Refresh after deletion
  } catch (error) {
    console.error("Error deleting course:", error);
  }
}

// Function to Update a Course
async function updateCourse(courseId) {
  const newTitle = prompt("Enter new course title:");
  if (!newTitle) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/courses/${courseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      }
    );

    const data = await response.json();
    alert(data.message);
    location.reload(); // Refresh after update
  } catch (error) {
    console.error("Error updating course:", error);
  }
}
