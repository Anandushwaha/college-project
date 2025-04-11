// Notification handling for both students and teachers
document.addEventListener("DOMContentLoaded", function () {
  // Debug log to verify script runs
  console.log("Notifications script loaded");

  // Check if the user is logged in
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.log("No access token found, skipping notification setup");
    return;
  }

  const role = localStorage.getItem("role");
  console.log("User role:", role);

  // Initialize notification elements
  const notificationIcon = document.getElementById("notification-icon");
  const notificationCount = document.getElementById("notification-count");
  const notificationDropdown = document.getElementById("notification-dropdown");
  const notificationsContainer = document.getElementById(
    "notifications-container"
  );
  const clearNotificationsBtn = document.getElementById("clear-notifications");

  // Log DOM element availability
  console.log("DOM Elements found:", {
    notificationIcon: !!notificationIcon,
    notificationCount: !!notificationCount,
    notificationDropdown: !!notificationDropdown,
    notificationsContainer: !!notificationsContainer,
    clearNotificationsBtn: !!clearNotificationsBtn,
  });

  if (!notificationIcon || !notificationDropdown || !notificationsContainer) {
    console.error("Required notification elements not found in the DOM");
    return;
  }

  // Replace the existing click handler with a more reliable implementation
  function showNotificationDropdown() {
    // First fetch fresh notifications
    fetchNotifications();

    // Make the dropdown visible through both class and style
    notificationDropdown.classList.remove("hidden");
    notificationDropdown.style.display = "block";
    notificationDropdown.style.opacity = "1";

    console.log("Dropdown should be visible now");
  }

  function hideNotificationDropdown() {
    notificationDropdown.classList.add("hidden");
    notificationDropdown.style.display = "none";
    console.log("Dropdown hidden");
  }

  // Toggle dropdown on icon click
  notificationIcon.addEventListener("click", function (e) {
    e.stopPropagation();
    console.log("Notification icon clicked");

    const isHidden = notificationDropdown.classList.contains("hidden");
    console.log("Is dropdown currently hidden?", isHidden);

    if (isHidden) {
      showNotificationDropdown();
    } else {
      hideNotificationDropdown();
    }
  });

  // Hide dropdown when clicking elsewhere
  document.addEventListener("click", function (e) {
    if (
      !notificationIcon.contains(e.target) &&
      !notificationDropdown.contains(e.target)
    ) {
      hideNotificationDropdown();
    }
  });

  // Clear all notifications
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener("click", clearAllNotifications);
  }

  // Fetch notifications on page load
  getNotificationCount();
  // Initial fetch of notifications
  fetchNotifications();

  // Fetch notification count every 30 seconds
  setInterval(getNotificationCount, 30000);
  // Refresh notifications periodically (every minute)
  setInterval(fetchNotifications, 60000);

  // Fetch notifications function
  async function fetchNotifications() {
    try {
      console.log("Fetching notifications...");
      console.log("Notification container exists:", !!notificationsContainer);

      const response = await fetch(
        "http://localhost:5000/api/v1/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const notifications = await response.json();
      console.log("Notifications received:", notifications);

      if (notificationsContainer) {
        displayNotifications(notifications);
      } else {
        console.error(
          "notificationsContainer is null when trying to display notifications"
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (notificationsContainer) {
        notificationsContainer.innerHTML = `
          <div class="empty-notification">
            <p>Error loading notifications. Please try again.</p>
          </div>
        `;
      } else {
        console.error(
          "Cannot display error because notificationsContainer is null"
        );
      }
    }
  }

  // Get notification count
  async function getNotificationCount() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch notification count");

      const data = await response.json();
      console.log("Unread notification count:", data.count);
      updateNotificationBadge(data.count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  }

  // Display notifications in dropdown
  function displayNotifications(notifications) {
    if (!notificationsContainer) {
      console.error("Notifications container not found");
      console.log("DOM elements:", {
        icon: !!notificationIcon,
        count: !!notificationCount,
        dropdown: !!notificationDropdown,
        container: !!notificationsContainer,
      });
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.log("No notifications to display");
      notificationsContainer.innerHTML = `
        <div class="empty-notification">
          <p>No notifications to display</p>
        </div>
      `;
      return;
    }

    console.log("Displaying notifications:", notifications.length);
    notificationsContainer.innerHTML = "";

    try {
      notifications.forEach((notification) => {
        const notificationCard = document.createElement("div");
        notificationCard.classList.add("notification-card");
        if (!notification.isRead) {
          notificationCard.classList.add("unread");
        }
        notificationCard.dataset.id = notification._id;

        let actionButtons = "";

        // If it's an enrollment request notification for teacher
        if (
          role === "teacher" &&
          notification.type === "enrollment_request" &&
          notification.actionRequired
        ) {
          // Ensure data exists to avoid undefined errors
          const studentId = notification.data?.studentId?._id || "";
          const courseId = notification.courseId?._id || "";

          actionButtons = `
            <div class="notification-actions">
              <button class="action-btn approve-btn" data-student-id="${studentId}" data-course-id="${courseId}">
                <i class="fas fa-check"></i> Approve
              </button>
              <button class="action-btn reject-btn" data-student-id="${studentId}" data-course-id="${courseId}">
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          `;
        }

        // Format date or use fallback
        let formattedDate = "Recently";
        try {
          const date = new Date(notification.createdAt);
          formattedDate = formatTimeAgo(date);
        } catch (dateError) {
          console.error("Error formatting date:", dateError);
        }

        notificationCard.innerHTML = `
          <p class="notification-message">${
            notification.message || "New notification"
          }</p>
          <small>${formattedDate}</small>
          ${actionButtons}
          ${
            !notification.isRead
              ? '<button class="mark-read">Mark as read</button>'
              : ""
          }
        `;

        // Add click event directly to each card when created
        notificationCard.addEventListener("click", function (e) {
          // Don't trigger if clicking on a button
          if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
            return;
          }

          console.log("Notification card clicked:", notification._id);

          // Mark as read if unread
          if (!notification.isRead) {
            markAsRead(notification._id, this);
          }

          // Toggle expanded state
          this.classList.toggle("expanded");
        });

        notificationsContainer.appendChild(notificationCard);
      });

      // Setup event listeners for action buttons
      setupNotificationEventListeners();
    } catch (itemError) {
      console.error(
        "Error creating notification card:",
        itemError,
        notifications
      );
    }
  }

  // Update notification badge count
  function updateNotificationBadge(count) {
    if (!notificationCount) return;

    notificationCount.textContent = count;

    if (count === 0) {
      notificationCount.style.display = "none";
    } else {
      notificationCount.style.display = "flex";
    }
  }

  // Setup event listeners for notification actions
  function setupNotificationEventListeners() {
    // Mark as read buttons
    document.querySelectorAll(".mark-read").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation(); // Prevent card click
        const card = this.closest(".notification-card");
        const notificationId = card.dataset.id;

        markAsRead(notificationId, card);
      });
    });

    // Approve enrollment buttons
    document.querySelectorAll(".approve-btn").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        const card = this.closest(".notification-card");
        const notificationId = card.dataset.id;
        const studentId = this.dataset.studentId;
        const courseId = this.dataset.courseId;

        approveEnrollment(notificationId, studentId, courseId, card);
      });
    });

    // Reject enrollment buttons
    document.querySelectorAll(".reject-btn").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        const card = this.closest(".notification-card");
        const notificationId = card.dataset.id;
        const studentId = this.dataset.studentId;
        const courseId = this.dataset.courseId;

        rejectEnrollment(notificationId, studentId, courseId, card);
      });
    });
  }

  // Mark notification as read
  async function markAsRead(notificationId, card) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to mark notification as read");

      // Update UI
      card.classList.remove("unread");
      const markReadBtn = card.querySelector(".mark-read");
      if (markReadBtn) {
        markReadBtn.remove();
      }

      // Update badge count
      getNotificationCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  // Approve enrollment request
  async function approveEnrollment(notificationId, studentId, courseId, card) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/courses/enroll/approve/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId, courseId }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve enrollment");

      const data = await response.json();

      // Show success message
      showToast("Enrollment approved successfully!", "success");

      // Update UI
      card.classList.remove("unread");
      card.querySelector(".notification-actions").innerHTML = `
        <div class="status-pill status-success">Approved</div>
      `;

      // Update enrollment count in UI if applicable
      updateEnrollmentCountInUI(courseId, data.enrollmentCount);

      // Update badge count
      getNotificationCount();
    } catch (error) {
      console.error("Error approving enrollment:", error);
      showToast("Failed to approve enrollment", "error");
    }
  }

  // Reject enrollment request
  async function rejectEnrollment(notificationId, studentId, courseId, card) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/courses/enroll/reject/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId, courseId }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject enrollment");

      // Show success message
      showToast("Enrollment rejected", "success");

      // Update UI
      card.classList.remove("unread");
      card.querySelector(".notification-actions").innerHTML = `
        <div class="status-pill status-inactive">Rejected</div>
      `;

      // Update badge count
      getNotificationCount();
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      showToast("Failed to reject enrollment", "error");
    }
  }

  // Clear all notifications
  async function clearAllNotifications() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/notifications/clear-all",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to clear notifications");

      // Update UI
      notificationsContainer.innerHTML = `
        <div class="empty-notification">
          <p>No notifications to display</p>
        </div>
      `;

      // Update badge count
      updateNotificationBadge(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  // Update enrollment count in UI if we're on the course management page
  function updateEnrollmentCountInUI(courseId, count) {
    const courseCard = document.querySelector(
      `.course-card[data-course-id="${courseId}"]`
    );
    if (courseCard) {
      const studentCountEl = courseCard.querySelector(".student-count");
      if (studentCountEl) {
        studentCountEl.textContent = `${count} Students`;
      }
    }
  }

  // Show toast message
  function showToast(message, type = "info") {
    // Check if there's already a toast container
    let toastContainer = document.querySelector(".toast-container");

    // If not, create one
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }

    // Create toast
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    }, 10);

    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      toast.style.opacity = "0";

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Format time ago
  function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    if (interval === 1) return "1 year ago";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    if (interval === 1) return "1 month ago";

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "1 day ago";

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    if (interval === 1) return "1 minute ago";

    if (seconds < 10) return "just now";

    return Math.floor(seconds) + " seconds ago";
  }
});
