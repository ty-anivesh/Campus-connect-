import { getStorageItem, setStorageItem } from './storage.js';
import { STORAGE_KEYS } from './config.js';

// This script will now run on all pages to handle the global "Edit Profile" button.

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTS ---
  const loggedInUser = getStorageItem(STORAGE_KEYS.LOGGED_IN_USER);
  const actionContainer = document.getElementById("profile-action-container");
  const modal = document.getElementById("profile-modal");
  const profileForm = document.getElementById("profile-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const yearFilter = document.getElementById("year-filter");
  const branchFilter = document.getElementById("branch-filter");
  const studentContainer = document.getElementById("student-container");
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const profileModal = document.getElementById("profile-modal");

  // --- DATA MANAGEMENT ---
  function getStudentsData() {
    const storedStudents = getStorageItem(STORAGE_KEYS.STUDENT_PROFILES);
    // If storage has data, use it.
    if (storedStudents) {
      return storedStudents;
    }
    // Otherwise, initialize storage with the default data from data.js
    setStorageItem(STORAGE_KEYS.STUDENT_PROFILES, studentsData);
    return studentsData;
  }

  let allStudents = getStudentsData();

  // --- PROFILE ACTIONS (ADD/EDIT) ---
  function updateUserDropdownButton() {
      if (editProfileBtn && loggedInUser && loggedInUser.role === 'student') {
          const userProfile = allStudents.find(s => s.username === loggedInUser.username);
          if (userProfile) {
              editProfileBtn.textContent = "Edit Your Profile";
          } else {
              editProfileBtn.textContent = "Add Profile Detail";
          }
          editProfileBtn.style.display = 'block'; // Ensure it's visible for students
      } else if (editProfileBtn) {
          // Hide the button for non-students to avoid confusion
          editProfileBtn.style.display = 'none';
      }
  }

  function setupProfileActions() {
    if (!loggedInUser || loggedInUser.role !== "student" || !actionContainer) {
      return;
    }

    const userProfile = allStudents.find(
      (s) => s.username === loggedInUser.username
    );

    const button = document.createElement("button");
    button.className = "profile-action-btn";
    button.textContent = userProfile ? "Edit Your Profile" : "Add Your Profile";

    button.addEventListener("click", () => {
      document.getElementById("modal-title").textContent = userProfile
        ? "Edit Your Profile"
        : "Add Your Profile";

      if (userProfile) {
        // Populate form for editing
        document.getElementById("profile-name").value = userProfile.name || "";
        document.getElementById("profile-rollNo").value =
          userProfile.rollNo || "";
        document.getElementById("profile-year").value = userProfile.year || "1";
        document.getElementById("profile-branch").value =
          userProfile.branch || "Computer Science";
        document.getElementById("profile-intro").value =
          userProfile.intro || "";
        document.getElementById("profile-skills").value = userProfile.skills
          ? userProfile.skills.join(", ")
          : "";
        document.getElementById("profile-linkedin").value =
          userProfile.linkedin || "";
        document.getElementById("profile-github").value =
          userProfile.github || "";
      } else {
        profileForm.reset(); // Clear form for adding
      }
      modal.classList.add("active");
    });

    actionContainer.innerHTML = "";
    actionContainer.appendChild(button);
  }

  // --- MODAL & FORM HANDLING ---
  if (modal && profileForm) {
    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    deleteBtn.addEventListener("click", () => {
      const userProfileIndex = allStudents.findIndex(
        (s) => s.username === loggedInUser.username
      );

      if (userProfileIndex > -1) {
        allStudents.splice(userProfileIndex, 1);
        setStorageItem(STORAGE_KEYS.STUDENT_PROFILES, allStudents);
        modal.classList.remove("active");
        if (studentContainer) applyFilters();
        if (actionContainer) setupProfileActions();
        updateUserDropdownButton();
      }
    });

    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            if (loggedInUser && loggedInUser.role === 'student' && profileModal) {
              const userProfile = allStudents.find(s => s.username === loggedInUser.username);
              
              // This is the fix: Check if a profile exists before populating the form.
              if (userProfile) {
                  document.getElementById("modal-title").textContent = "Edit Your Profile";
                  document.getElementById("profile-name").value = userProfile.name || "";
                  document.getElementById("profile-rollNo").value = userProfile.rollNo || "";
                  document.getElementById("profile-year").value = userProfile.year || "1";
                  document.getElementById("profile-branch").value = userProfile.branch || "Information Technology";
                  document.getElementById("profile-intro").value = userProfile.intro || "";
                  document.getElementById("profile-skills").value = (userProfile.skills || []).join(", ");
                  document.getElementById("profile-linkedin").value = userProfile.linkedin || "";
                  document.getElementById("profile-github").value = userProfile.github || "";
              } else {
                  document.getElementById("modal-title").textContent = "Create Your Profile";
                  profileForm.reset();
              }
                profileModal.classList.add("active");
            }
        });
    }

    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const userProfileIndex = allStudents.findIndex(
        (s) => s.username === loggedInUser.username
      );

      // Collect all data from the form
      const formData = {
        name: document.getElementById("profile-name").value,
        rollNo: document.getElementById("profile-rollNo").value,
        year: document.getElementById("profile-year").value,
        branch: document.getElementById("profile-branch").value,
        intro: document.getElementById("profile-intro").value,
        skills: document
          .getElementById("profile-skills")
          .value.split(",")
          .map((skill) => skill.trim()),
        linkedin: document.getElementById("profile-linkedin").value,
        github: document.getElementById("profile-github").value,
      };

      if (userProfileIndex > -1) {
        // Update existing profile by merging new data into the old object
        allStudents[userProfileIndex] = {
          ...allStudents[userProfileIndex],
          ...formData,
        };
      } else {
        // Add new profile, creating a complete object
        const newProfile = {
          ...formData,
          id: Date.now(),
          username: loggedInUser.username,
          email: `${loggedInUser.username}@example.edu`,
        };
        allStudents.push(newProfile);
      }

      // Save updated list to localStorage
      setStorageItem(STORAGE_KEYS.STUDENT_PROFILES, allStudents);

      modal.classList.remove("active");
      if (studentContainer) applyFilters(); // Re-render student cards only if on the student page
      if (actionContainer) setupProfileActions(); // Update button text on student page
      updateUserDropdownButton(); // Update dropdown button text everywhere
    });
  } else if (editProfileBtn) {
    // If the modal doesn't exist on the page, but the button does,
    // clicking it should redirect to a page where the modal exists.
    editProfileBtn.addEventListener("click", () => {
        if (loggedInUser && loggedInUser.role === 'student') {
            alert("Redirecting to the dashboard to edit your profile.");
            // Adjust path based on current location
            const dashboardPath = window.location.pathname.includes("/pages/") ? "../index.html" : "index.html";
            window.location.href = dashboardPath;
        }
    });
  }

  // --- RENDER STUDENT CARDS ---
  function renderStudents(data) {
    if (!studentContainer) return; // Safety check

    studentContainer.innerHTML = "";

    if (data.length === 0) {
      studentContainer.innerHTML = "<p>No students found for this filter.</p>";
      return;
    }

    data.forEach((student) => {
      const card = document.createElement("div");
      card.className = "profile-card student-card";
      card.innerHTML = `
              <h3>${student.name}</h3>
              <p>Roll No: ${student.rollNo}</p>
              <p>Year: ${student.year} | Branch: ${student.branch}</p>
              <p>Intro: ${student.intro}</p>
              <p>Skills: ${student.skills.join(", ")}</p>
              <div class="social-links">
                  <a href="mailto:${
                    student.email
                  }" title="Email"><i class="fas fa-envelope"></i></a>
                  <a href="${
                    student.linkedin
                  }" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                  <a href="${
                    student.github
                  }" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
              </div>
          `;
      studentContainer.appendChild(card);
    });
  }

  // --- FILTERING LOGIC ---
  function applyFilters() {
    if (!yearFilter || !branchFilter) return; // Safety check
    const selectedYear = yearFilter.value;
    const selectedBranch = branchFilter.value;

    let filteredStudents = allStudents;
    if (selectedYear !== "all") {
      filteredStudents = filteredStudents.filter((s) => s.year == selectedYear);
    }
    if (selectedBranch !== "all") {
      filteredStudents = filteredStudents.filter(
        (s) => s.branch === selectedBranch
      );
    }
    renderStudents(filteredStudents);
  }

  if (yearFilter && branchFilter) {
    yearFilter.addEventListener("change", applyFilters);
    branchFilter.addEventListener("change", applyFilters);
  }

  // --- NEW: First-time login check for students on dashboard ---
  function checkAndPromptForProfile() {
      if (loggedInUser && loggedInUser.role === 'student' && profileModal) {
          const userProfile = allStudents.find(s => s.username === loggedInUser.username);
          if (!userProfile) {
              // Use a small timeout to ensure the page is fully rendered
              setTimeout(() => {
                  profileModal.classList.add("active");
              }, 500);
          }
      }
  }

  // --- INITIALIZATION ---
  if (loggedInUser) {
    if (actionContainer) setupProfileActions();
    if (studentContainer) applyFilters(); // Only render cards on the student page
    updateUserDropdownButton(); // Set initial text for the dropdown button
    if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
        checkAndPromptForProfile();
    }
  }
});
