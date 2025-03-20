// document.addEventListener("DOMContentLoaded", async () => {
//   fetchTeacherCourses();
// });

// // Function to open the modal
// function openModal() {
//   document.getElementById("courseModal").style.display = "block";
// }

// // Function to close the modal
// function closeModal() {
//   document.getElementById("courseModal").style.display = "none";
// }

// // Function to Fetch Courses
// async function fetchTeacherCourses() {
//   const token = localStorage.getItem("token");

//   try {
//     const response = await fetch(
//       "http://localhost:5000/api/v1/courses/teacher",
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await response.json();
//     const courseList = document.getElementById("teacherCourses");
//     courseList.innerHTML = ""; // Clear list

//     if (data.courses.length === 0) {
//       courseList.innerHTML = "<li>No courses found.</li>";
//     } else {
//       data.courses.forEach((course) => {
//         const courseItem = document.createElement("li");
//         courseItem.innerHTML = `
//             ${course.title} - ${course.className} (${course.division})
//             <button onclick="updateCourse('${course._id}')">✏️ Edit</button>
//             <button onclick="deleteCourse('${course._id}')">🗑️ Delete</button>
//           `;
//         courseList.appendChild(courseItem);
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching courses:", error);
//   }
// }

// // Function to Create a Course
// async function createCourse() {
//   const title = document.getElementById("courseTitle").value.trim();
//   const className = document.getElementById("className").value.trim();
//   const division = document.getElementById("division").value.trim();

//   if (!title || !className || !division) {
//     alert("Please fill all fields.");
//     return;
//   }

//   const token = localStorage.getItem("token");

//   try {
//     const response = await fetch(
//       "http://localhost:5000/api/v1/courses/create",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ title, className, division }),
//       }
//     );

//     const data = await response.json();
//     alert(data.message);
//     closeModal(); // Close modal
//     fetchTeacherCourses(); // Refresh course list
//   } catch (error) {
//     console.error("Error creating course:", error);
//   }
// }

// // Function to Update a Course
// async function updateCourse(courseId) {
//   const newTitle = prompt("Enter new course title:");
//   if (!newTitle) return;

//   const token = localStorage.getItem("token");

//   try {
//     const response = await fetch(
//       `http://localhost:5000/api/v1/courses/${courseId}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ title: newTitle }),
//       }
//     );

//     const data = await response.json();
//     alert(data.message);
//     fetchTeacherCourses(); // Refresh course list
//   } catch (error) {
//     console.error("Error updating course:", error);
//   }
// }

// // Function to Delete a Course
// async function deleteCourse(courseId) {
//   const token = localStorage.getItem("token");
//   if (!confirm("Are you sure you want to delete this course?")) return;

//   try {
//     const response = await fetch(
//       `http://localhost:5000/api/v1/courses/${courseId}`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await response.json();
//     alert(data.message);
//     fetchTeacherCourses(); // Refresh course list
//   } catch (error) {
//     console.error("Error deleting course:", error);
//   }
// }
