import { getStorageItem, setStorageItem } from './storage.js';
import { STORAGE_KEYS } from './config.js';

if (window.location.pathname.includes("alumni.html")) {

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
        const alumniContainer = document.getElementById("alumni-container");

        const ALUMNI_STORAGE_KEY = 'userProfiles_alumni';

        // --- DATA MANAGEMENT ---
        function getAlumniData() {
            const storedAlumni = getStorageItem(ALUMNI_STORAGE_KEY);
            if (storedAlumni) {
                return storedAlumni;
            }
            setStorageItem(ALUMNI_STORAGE_KEY, alumniData);
            return alumniData;
        }

        let allAlumni = getAlumniData();

        // --- PROFILE ACTIONS (ADD/EDIT) ---
        function setupProfileActions() {
            if (!loggedInUser || loggedInUser.role !== "student" || !actionContainer) {
                return;
            }

            const userProfile = allAlumni.find(
                (s) => s.username === loggedInUser.username
            );

            const button = document.createElement("button");
            button.className = "profile-action-btn";
            button.textContent = userProfile ? "Edit Your Alumni Profile" : "Add Your Alumni Profile";

            button.addEventListener("click", () => {
                document.getElementById("modal-title").textContent = userProfile
                    ? "Edit Your Alumni Profile"
                    : "Add Your Alumni Profile";

                if (userProfile) {
                    document.getElementById("profile-name").value = userProfile.name || "";
                    document.getElementById("profile-branch").value = userProfile.branch || "Information Technology";
                    document.getElementById("profile-graduationYear").value = userProfile.graduationYear || "";
                    document.getElementById("profile-currentRole").value = userProfile.currentRole || "";
                    document.getElementById("profile-company").value = userProfile.company || "";
                    document.getElementById("profile-linkedin").value = userProfile.linkedin || "";
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

            deleteBtn.addEventListener("click", () => {
                const userProfileIndex = allAlumni.findIndex(
                    (s) => s.username === loggedInUser.username
                );

                if (userProfileIndex > -1) {
                    allAlumni.splice(userProfileIndex, 1);
                    setStorageItem(ALUMNI_STORAGE_KEY, allAlumni);
                    modal.classList.remove("active");
                    applyFilters();
                    setupProfileActions();
                }
            });

            profileForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const userProfileIndex = allAlumni.findIndex(
                    (s) => s.username === loggedInUser.username
                );

                const formData = {
                    name: document.getElementById("profile-name").value,
                    branch: document.getElementById("profile-branch").value,
                    graduationYear: document.getElementById("profile-graduationYear").value,
                    currentRole: document.getElementById("profile-currentRole").value,
                    company: document.getElementById("profile-company").value,
                    linkedin: document.getElementById("profile-linkedin").value,
                };

                if (userProfileIndex > -1) {
                    allAlumni[userProfileIndex] = {
                        ...allAlumni[userProfileIndex],
                        ...formData,
                    };
                } else {
                    const newProfile = {
                        ...formData,
                        id: Date.now(),
                        username: loggedInUser.username,
                        email: `${loggedInUser.username}@example.edu`,
                    };
                    allAlumni.push(newProfile);
                }

                setStorageItem(ALUMNI_STORAGE_KEY, allAlumni);

                modal.classList.remove("active");
                applyFilters();
                setupProfileActions();
            });
        }

        // --- RENDER ALUMNI CARDS ---
        function renderAlumni(data) {
            if (!alumniContainer) return;
            alumniContainer.innerHTML = "";

            if (data.length === 0) {
                alumniContainer.innerHTML = "<p>No alumni found for this filter.</p>";
                return;
            }

            data.forEach((alumnus) => {
                const card = document.createElement("div");
                card.className = "profile-card alumni-card";
                card.innerHTML = `
                    <h3>${alumnus.name}</h3>
                    <p class="alumni-status">${alumnus.currentRole} at <strong>${alumnus.company}</strong></p>
                    <p>Branch: ${alumnus.branch}</p>
                    <p>Graduated: ${alumnus.graduationYear}</p>
                    <div class="social-links">
                        <a href="mailto:${alumnus.email}" title="Email"><i class="fas fa-envelope"></i></a>
                        ${alumnus.linkedin ? `<a href="${alumnus.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                    </div>
                `;
                alumniContainer.appendChild(card);
            });
        }

        // --- FILTERING LOGIC ---
        function applyFilters() {
            const selectedYear = yearFilter.value;
            const selectedBranch = branchFilter.value;

            let filteredAlumni = allAlumni;
            if (selectedYear !== "all") {
                filteredAlumni = filteredAlumni.filter((s) => s.graduationYear == selectedYear);
            }
            if (selectedBranch !== "all") {
                filteredAlumni = filteredAlumni.filter(
                    (s) => s.branch === selectedBranch
                );
            }
            renderAlumni(filteredAlumni);
        }

        function populateYearFilter() {
            const years = [...new Set(allAlumni.map(a => a.graduationYear))].sort((a, b) => b - a);
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            });
        }

        if (yearFilter && branchFilter) {
            yearFilter.addEventListener("change", applyFilters);
            branchFilter.addEventListener("change", applyFilters);
        }

        // --- INITIALIZATION ---
        setupProfileActions();
        populateYearFilter();
        applyFilters();
    });
}