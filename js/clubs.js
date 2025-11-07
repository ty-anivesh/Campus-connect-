document.addEventListener("DOMContentLoaded", () => {
  const clubsContainer = document.getElementById("clubs-container");

  // --- RENDER CLUBS ---
  function renderClubs() {
    if (!clubsContainer || typeof clubsData === 'undefined') {
      return;
    }
    clubsContainer.innerHTML = "";
    if (clubsData.length === 0) {
      clubsContainer.innerHTML = "<p>No clubs information available.</p>";
      return;
    }

    clubsData.forEach(club => {
      const clubElement = document.createElement("div");
      clubElement.className = "club-item";

      // Create list items for mentors
      const finalYearMentors = club.mentors.finalYear.map(name => `<li>${name}</li>`).join('');
      const thirdYearMentors = club.mentors.thirdYear.map(name => `<li>${name}</li>`).join('');

      clubElement.innerHTML = `
        <button class="club-header">
          <i class="${club.logo} club-logo"></i>
          <span class="club-name">${club.name}</span>
          <i class="fas fa-chevron-down collapse-icon"></i>
        </button>
        <div class="club-details-content">
          <div class="coordinator-info">
            <img src="${club.facultyCoordinator.photo}" alt="${club.facultyCoordinator.name}" class="coordinator-photo">
            <p><strong>Faculty Coordinator:</strong><br>${club.facultyCoordinator.name}</p>
          </div>
          <div class="mentor-section">
            <h4>Final Year Mentors</h4>
            <ul>
              ${finalYearMentors}
            </ul>
          </div>
          <div class="mentor-section">
            <h4>Third Year Mentors</h4>
            <ul>
              ${thirdYearMentors}
            </ul>
          </div>
        </div>
      `;
      clubsContainer.appendChild(clubElement);
    });
  }

  // --- EVENT LISTENER FOR COLLAPSIBLE ---
  if (clubsContainer) {
    clubsContainer.addEventListener('click', (e) => {
      const header = e.target.closest('.club-header');
      if (header) {
        header.parentElement.classList.toggle('active');
      }
    });
  }

  // --- INITIAL RENDER ---
  renderClubs();
});