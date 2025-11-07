const careerData = {
  jobs: [
    { name: "LinkedIn", url: "https://www.linkedin.com/jobs/" },
    { name: "Indeed", url: "https://www.indeed.com/" },
    { name: "Naukri.com", url: "https://www.naukri.com/" },
    { name: "Glassdoor", url: "https://www.glassdoor.com/Job/index.htm" },
    { name: "Wellfound (AngelList)", url: "https://wellfound.com/" },
    { name: "Google Careers", url: "https://careers.google.com/" },
    { name: "Dice", url: "https://www.dice.com/" },
    { name: "Hired", url: "https://hired.com/" },
    { name: "Monster", url: "https://www.monster.com/" },
    { name: "ZipRecruiter", url: "https://www.ziprecruiter.com/" },
  ],
  internships: [
    { name: "Internshala", url: "https://internshala.com/" },
    { name: "LinkedIn", url: "https://www.linkedin.com/jobs/internship-jobs/" },
    { name: "AICTE Internship Portal", url: "https://internship.aicte-india.org/" },
    { name: "Unstop", url: "https://unstop.com/internships" },
    { name: "Chegg Internships", url: "https://www.internships.com/" },
    { name: "Handshake", url: "https://joinhandshake.com/" },
    { name: "WayUp", url: "https://www.wayup.com/" },
    { name: "Idealist", url: "https://www.idealist.org/" },
    { name: "Y Combinator", url: "https://www.workatastartup.com/" },
    { name: "Glassdoor", url: "https://www.glassdoor.com/Job/intern-jobs-SRCH_KO0,6.htm" },
  ],
  freelance: [
    { name: "Upwork", url: "https://www.upwork.com/" },
    { name: "Fiverr", url: "https://www.fiverr.com/" },
    { name: "Toptal", url: "https://www.toptal.com/" },
    { name: "Freelancer.com", url: "https://www.freelancer.com/" },
    { name: "PeoplePerHour", url: "https://www.peopleperhour.com/" },
    { name: "Guru", url: "https://www.guru.com/" },
    { name: "99designs", url: "https://99designs.com/" },
    { name: "Dribbble", url: "https://dribbble.com/jobs" },
    { name: "Behance", url: "https://www.behance.net/joblist" },
    { name: "FlexJobs", url: "https://www.flexjobs.com/" },
  ],
};

/**
 * Generates a URL for a website's logo using a third-party service.
 * @param {string} domain The domain of the website (e.g., "linkedin.com").
 * @returns {string} The URL of the logo.
 */
function getLogoUrl(domain) {
  // Using a simple and effective logo fetching service.
  return `https://logo.clearbit.com/${domain}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const careerContainer = document.getElementById("career-portals-container");
  if (!careerContainer) return;

  const createSection = (title, sites) => {
    const section = document.createElement("div");
    section.className = "career-section";

    const siteLinks = sites
      .map((site) => {
        // Extract domain from URL for the logo service
        const domain = new URL(site.url).hostname.replace("www.", "");
        return `
          <a href="${site.url}" target="_blank" class="portal-link-item">
            <img src="${getLogoUrl(domain)}" alt="${site.name} Logo" class="portal-logo" onerror="this.style.display='none'">
            <span class="portal-name">${site.name}</span>
            <i class="fas fa-external-link-alt"></i>
          </a>
        `;
      })
      .join("");

    section.innerHTML = `
      <button class="club-header">
        <span class="club-name">${title}</span>
        <i class="fas fa-chevron-down collapse-icon"></i>
      </button>
      <div class="club-details-content portal-links-grid">
        ${siteLinks}
      </div>
    `;
    return section;
  };

  const jobSection = createSection("Job Portals", careerData.jobs);
  const internshipSection = createSection("Internship Portals", careerData.internships);
  const freelanceSection = createSection("Freelance Platforms", careerData.freelance);

  careerContainer.appendChild(jobSection);
  careerContainer.appendChild(internshipSection);
  careerContainer.appendChild(freelanceSection);

  // Add collapsible functionality
  careerContainer.addEventListener("click", (e) => {
    const header = e.target.closest(".club-header");
    if (header) {
      const section = header.parentElement;
      section.classList.toggle("active");
    }
  });
});