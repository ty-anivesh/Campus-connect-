// Function to render student cards
function renderStudents(data) {
  const container = document.getElementById("student-container");
  if (!container) return; // Exit if the container element doesn't exist

  container.innerHTML = ""; // Clear existing content

  // Check if the data is valid and not empty
  if (data.length === 0) {
    container.innerHTML = "<p>No students found for this filter.</p>";
    return;
  }

  // Loop through the data and create a card for each student
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
            <button class="bookmark-btn" data-id="${
              student.id
            }" data-type="student">Bookmark</button>
        `;
    container.appendChild(card);
  });
}
