// Video Call Functionality
const API_URL = "http://localhost:5000/api"; // Base API URL

// Function to create a new video call room
async function createVideoRoom() {
  try {
    // Show loading indicator in the iframe
    const videoFrame = document.getElementById("videoCallFrame");
    videoFrame.src = "about:blank";
    if (videoFrame.contentDocument) {
      videoFrame.contentDocument.body.innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; height: 100%; font-family: Arial; color: #4a6de5;">Creating video room...</div>';
    }

    // Make request to backend to create a room
    const response = await fetch(`${API_URL}/video/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.roomUrl) {
      // Set the video iframe source to the Jitsi room URL
      document.getElementById("videoCallFrame").src = data.roomUrl;
      console.log("Video call started:", data.roomUrl);
    } else {
      console.error(
        "Failed to create video room:",
        data.error || "Unknown error"
      );
      alert("Failed to create video room. Please try again.");
    }
  } catch (error) {
    console.error("Error creating video room:", error);
    alert("An error occurred while creating the video room. Please try again.");
  }
}

// Function to get an existing video room if available
async function getExistingRoom() {
  try {
    const response = await fetch(`${API_URL}/video/get-room`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.roomUrl) {
      return data.roomUrl;
    }
    return null;
  } catch (error) {
    console.error("Error getting existing room:", error);
    return null;
  }
}

// Initialize video call when modal is opened
document.addEventListener("DOMContentLoaded", () => {
  // Handle live classes card click
  const liveClassesCard = document.getElementById("live-classes");
  if (liveClassesCard) {
    liveClassesCard.addEventListener("click", async () => {
      const videoCallModal = document.getElementById("videoCallModal");
      if (videoCallModal) {
        videoCallModal.style.display = "block";

        // Try to get existing room first, create new one if none exists
        const existingRoom = await getExistingRoom();
        if (existingRoom) {
          document.getElementById("videoCallFrame").src = existingRoom;
        } else {
          createVideoRoom();
        }
      }
    });
  }

  // Handle end call button
  const endCallButton = document.getElementById("endCallButton");
  if (endCallButton) {
    endCallButton.addEventListener("click", () => {
      // Reset iframe
      document.getElementById("videoCallFrame").src = "about:blank";
      // Close modal
      document.getElementById("videoCallModal").style.display = "none";
    });
  }

  // Close modal when X is clicked
  const closeButtons = document.querySelectorAll(".close");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
      // Reset video call iframe when modal is closed
      const videoFrame = document.getElementById("videoCallFrame");
      if (videoFrame) {
        videoFrame.src = "about:blank";
      }
    });
  });
});
