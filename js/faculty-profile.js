document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTS ---
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const actionContainer = document.getElementById("profile-action-container");
  const modal = document.getElementById("profile-modal");
  const profileForm = document.getElementById("profile-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const deleteBtn = document.getElementById("delete-btn");

  let applyFilters;
  if (typeof window.applyFilters === "function") {
    applyFilters = window.applyFilters;
  } else {
    console.error("CRITICAL: applyFilters function not found. UI cannot update.");
    applyFilters = () => {};
  }

  // --- DATA MANAGEMENT ---
  function getFacultyData() {
    const storedFaculty = localStorage.getItem("userProfiles_faculty");
    if (storedFaculty) {
      return JSON.parse(storedFaculty);
    }
    localStorage.setItem("userProfiles_faculty", JSON.stringify(facultyData));
    return facultyData;
  }

  // --- PROFILE ACTIONS (ADD/EDIT) ---
  function setupProfileActions() {
    if (!loggedInUser || loggedInUser.role !== "faculty" || !actionContainer) {
      return;
    }

    let allFaculty = getFacultyData(); // Get latest data
    const userProfile = allFaculty.find(
      (f) => f.username === loggedInUser.username
    );

    const button = document.createElement("button");
    button.className = "profile-action-btn btn-primary";
    button.textContent = userProfile ? "Edit Your Profile" : "Add Your Profile";

    button.addEventListener("click", () => {
      document.getElementById("modal-title").textContent = userProfile
        ? "Edit Your Profile"
        : "Add Your Profile";

      if (userProfile) {
        document.getElementById("profile-name").value = userProfile.name || "";
        document.getElementById("profile-designation").value =
          userProfile.designation || "";
        document.getElementById("profile-branch").value =
          userProfile.branch || "Information Technology";
        document.getElementById("profile-research").value =
          userProfile.research || "";
        // Populate the new email field
        document.getElementById("profile-email").value = userProfile.email || "";
      } else {
        profileForm.reset();
      }
      modal.classList.add("active");
    });

    actionContainer.innerHTML = "";
    actionContainer.appendChild(button);
  }

  // --- MODAL & FORM HANDLING ---
  if (modal) {
    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    // FIXED: Delete button logic
    deleteBtn.addEventListener("click", () => {
      let currentFacultyList = getFacultyData();
      const userProfileIndex = currentFacultyList.findIndex(
        (f) => f.username === loggedInUser.username
      );

      if (userProfileIndex > -1) {
        // Remove the profile from the array
        currentFacultyList.splice(userProfileIndex, 1);
        // Save the updated array back to localStorage
        localStorage.setItem(
          "userProfiles_faculty",
          JSON.stringify(currentFacultyList)
        );

        // Hide the modal and refresh the UI
        modal.classList.remove("active");
        applyFilters();
        setupProfileActions(); // Button should now say "Add Profile"
      }
    });

    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let currentFacultyList = getFacultyData();
      const userProfileIndex = currentFacultyList.findIndex(
        (f) => f.username === loggedInUser.username
      );

      // Collect data, including the new email field
      const formData = {
        name: document.getElementById("profile-name").value,
        designation: document.getElementById("profile-designation").value,
        branch: document.getElementById("profile-branch").value,
        research: document.getElementById("profile-research").value,
        email: document.getElementById("profile-email").value, // Get email from form
      };

      if (userProfileIndex > -1) {
        // Update existing profile
        currentFacultyList[userProfileIndex] = {
          ...currentFacultyList[userProfileIndex],
          ...formData,
        };
      } else {
        // Create new profile
        const newProfile = {
          ...formData,
          id: Date.now(),
          username: loggedInUser.username,
        };
        currentFacultyList.push(newProfile);
      }

      localStorage.setItem(
        "userProfiles_faculty",
        JSON.stringify(currentFacultyList)
      );
      
      modal.classList.remove("active");
      applyFilters();
      setupProfileActions();
    });
  }

  // --- INITIALIZATION ---
  setupProfileActions();
});