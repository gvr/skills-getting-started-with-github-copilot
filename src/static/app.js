document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      displayActivities(activities);

      // Add option to select dropdown
      Object.entries(activities).forEach(([name, details]) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to display activities
  function displayActivities(activitiesData) {
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    Object.entries(activitiesData).forEach(([name, details]) => {
      const participantsList = details.participants
        .map(participant => `
          <li>
            <span class="participant-name">${participant}</span>
            <span class="delete-participant" title="Remove participant" data-activity="${name}" data-participant="${participant}">&#128465;</span>
          </li>
        `)
        .join("");

      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
        <div class="participants">
          <h5>Signed Up Students</h5>
          <ul>${participantsList || "<li style='color: #999;'>No participants yet</li>"}</ul>
        </div>
      `;
      activitiesList.appendChild(card);
    });

    // Add event listeners for delete icons
    document.querySelectorAll('.delete-participant').forEach(icon => {
      icon.addEventListener('click', function() {
        const activity = this.getAttribute('data-activity');
        const participant = this.getAttribute('data-participant');
        unregisterParticipant(activity, participant);
      });
    });
  }

  // Function to unregister a participant from an activity
  function unregisterParticipant(activityName, participantEmail) {
    fetch(`/activities/${encodeURIComponent(activityName)}/unregister`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: participantEmail })
    })
      .then(async response => {
        if (!response.ok) {
          const result = await response.json();
          alert(result.detail || "Failed to remove participant.");
        } else {
          const result = await response.json();
          // Optionally show a message
          // alert(result.message);
          fetchActivities();
        }
      })
      .catch(() => {
        alert("Failed to remove participant. Please try again.");
      });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
