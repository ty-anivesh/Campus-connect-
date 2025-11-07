// This script handles rendering and filtering for the faculty directory page.

/**
 * Renders the faculty cards to the container.
 * @param {Array} data The array of faculty data to render.
 */
function renderFaculty(data) {
  const container = document.getElementById("faculty-container");
  if (!container) return;

  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p>No faculty found for this filter.</p>";
    return;
  }

  data.forEach((faculty) => {
    const card = document.createElement("div");
    card.className = "profile-card faculty-card"; // Reusing profile-card style
    card.innerHTML = `
        <h3>${faculty.name}</h3>
        <p>${faculty.designation}</p>
        <p><strong>Branch:</strong> ${faculty.branch}</p>
        <p><strong>Research:</strong> ${faculty.research}</p>
        <div class="social-links">
            <a href="mailto:${faculty.email}" title="Email"><i class="fas fa-envelope"></i></a>
        </div>
    `;
    container.appendChild(card);
  });
}

// --- Filtering logic for the faculty page ---
document.addEventListener("DOMContentLoaded", () => {
  const branchFilter = document.getElementById("branch-filter");

  // Make the applyFilters function globally accessible for faculty-profile.js to call after updates.
  window.applyFilters = function () {
    const selectedBranch = branchFilter.value;

    // Get the latest faculty data from localStorage or fallback to initial data.
    const allFaculty =
      JSON.parse(localStorage.getItem("userProfiles_faculty")) || facultyData;

    let filteredFaculty = allFaculty;

    if (selectedBranch !== "all") {
      filteredFaculty = filteredFaculty.filter(
        (f) => f.branch === selectedBranch
      );
    }

    renderFaculty(filteredFaculty);
  };

  if (branchFilter) {
    branchFilter.addEventListener("change", window.applyFilters);
  }

  // Initial render on page load.
  window.applyFilters();
});