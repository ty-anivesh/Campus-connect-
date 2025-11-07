
import { 
  getStorageItem, 
  setStorageItem, 
  removeStorageItem, 
  apiLogin, 
  apiSignup,
  apiGetData,  
  apiSaveData  
} from './storage.js';
import { STORAGE_KEYS } from './config.js';
import { calculateAttendance } from './attendance.js';

document.addEventListener("DOMContentLoaded", () => {
  // --- AUTHENTICATION & UI LOGIC ---
  const authTabs = document.querySelectorAll(".auth-tab");
  const loginFormWrapper = document.getElementById("login-form-wrapper");
  const signupFormWrapper = document.getElementById("signup-form-wrapper");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginError = document.getElementById("login-error");
  const signupSuccess = document.getElementById("signup-success");

  // Profile section elements
  const profileAvatar = document.querySelector(".profile-avatar");
  const profileDetails = document.querySelector(".profile-details");
  const logoutBtn = document.getElementById("logout-btn");

  // Handle tab switching for Login/Signup
  if (authTabs.length > 0) {
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        authTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        if (tab.dataset.tab === "login") {
          loginFormWrapper.classList.add("active");
          signupFormWrapper.classList.remove("active");
        } else {
          signupFormWrapper.classList.add("active");
          loginFormWrapper.classList.remove("active");
        }
      });
    });
  }

  
  // --- Signup Form Submission ---
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => { // ADD 'async' HERE
      e.preventDefault();
      const username = document.getElementById("signup-username").value;
      const password = document.getElementById("signup-password").value;
      const role = document.getElementById("signup-role").value;

      signupSuccess.textContent = "Signing up...";
      signupSuccess.style.color = "#64748B";

      // NEW: Call the API signup function
      const apiResponse = await apiSignup(username, password, role);

      if (apiResponse && apiResponse.success) {
        signupSuccess.textContent = "Signup successful! You can now log in.";
        signupSuccess.style.color = "#2ecc71";
        signupForm.reset();
      } else {
        signupSuccess.textContent = apiResponse?.message || "Error: Username already exists or network failed.";
        signupSuccess.style.color = "#e74c3c";
      }
    });
  }

  // Image upload elements
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const imageInput = document.getElementById("image-input");

  // Handle image upload button click
  if (uploadImageBtn) {
    uploadImageBtn.addEventListener("click", () => {
      if (imageInput) imageInput.click();
    });
  }

  
 // --- Login Form Submission ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => { // ADD 'async' HERE
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      const role = document.getElementById("login-role").value;

      loginError.textContent = "Logging in...";

      // NEW: Call the API login function (await means 'wait for the server')
      const apiResponse = await apiLogin(username, password, role);

      if (apiResponse && apiResponse.success) {
        // Only save to localStorage (session) after the backend confirms success
        setStorageItem(STORAGE_KEYS.LOGGED_IN_USER, apiResponse.user);
        window.location.href = "index.html";
      } else {
        loginError.textContent = apiResponse?.message || "Invalid username, password, or role.";
      }
    });
  }

  // --- Logout Logic ---
  function logout() {
    removeStorageItem(STORAGE_KEYS.LOGGED_IN_USER);
    const loginPagePath = window.location.pathname.includes("/pages/")
      ? "../login.html"
      : "login.html";
    window.location.href = loginPagePath;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // --- Profile & UI Logic for all pages ---
  const loggedInUser = getStorageItem(STORAGE_KEYS.LOGGED_IN_USER);

  // Redirect to login if not logged in and not on the login page (TEMPORARILY DISABLED FOR BACKEND MIGRATION)
  /*
  if (!loggedInUser && !window.location.pathname.endsWith("login.html")) {
    const loginPagePath = window.location.pathname.includes("/pages/")
      ? "../login.html"
      : "login.html";
    window.location.href = loginPagePath;
  }
  */

  // Update profile avatar and details if a user is logged in
  if (loggedInUser && profileAvatar) {
    if (loggedInUser.profileImage) {
      let imagePath = loggedInUser.profileImage;
      // If the image path is relative and we are on a nested page, adjust the path
      if (
        !imagePath.startsWith("http") &&
        !imagePath.startsWith("data:") &&
        window.location.pathname.includes("/pages/")
      ) {
        imagePath = "../" + imagePath;
      }
      profileAvatar.querySelector("img").src = imagePath;
    } else {
      // MODIFIED: Show a transparent pixel instead of a placeholder
      profileAvatar.querySelector("img").src =
        "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    }
    profileAvatar.addEventListener("click", (e) => {
      if (profileDetails) profileDetails.classList.toggle("active");
      e.stopPropagation();
    });
  }

  // Handle file selection and save image to localStorage
  if (imageInput) {
    imageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        // NEW: Add a file size check (2MB limit)
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
        if (file.size > MAX_FILE_SIZE) {
          alert(
            "Error: The selected image is too large. Please choose an image smaller than 2 MB."
          );
          return; // Stop the function if the file is too big
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target.result;
          const users = getStorageItem(STORAGE_KEYS.USERS);
          const userIndex = users.findIndex(
            (u) => u.username === loggedInUser.username
          );
          if (userIndex > -1) {
            users[userIndex].profileImage = imageDataUrl;
            loggedInUser.profileImage = imageDataUrl;
            setStorageItem(STORAGE_KEYS.USERS, users);
            setStorageItem(STORAGE_KEYS.LOGGED_IN_USER, loggedInUser);
            if (profileAvatar)
              profileAvatar.querySelector("img").src = imageDataUrl;
            alert("Profile image updated successfully!");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Update username display
  const usernameDisplay = document.getElementById("username");
  if (usernameDisplay && loggedInUser) {
    usernameDisplay.textContent = `${loggedInUser.username} (${loggedInUser.role})`;
  }

  // Hide profile dropdown when clicking outside
  document.addEventListener("click", () => {
    if (profileDetails) profileDetails.classList.remove("active");
  });

  /// --- General UI & Feature Logic ---
  const sidebar = document.querySelector(".sidebar");
  const themeToggle = document.querySelector(".theme-toggle");
  const hamburgerMenu = document.querySelector(".hamburger-menu");

  // NEW: Sidebar hover logic
  if (sidebar) {
    // Only apply hover effect on larger screens
    if (window.innerWidth > 768) {
      sidebar.addEventListener("mouseenter", () => {
        sidebar.classList.remove("collapsed");
      });
      sidebar.addEventListener("mouseleave", () => {
        sidebar.classList.add("collapsed");
      });
    }
  }

  // NEW: Hamburger menu logic for mobile
  if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener("click", () => {
      sidebar.classList.toggle("visible");
      // When sidebar is open on mobile, it should not be collapsed
      sidebar.classList.remove("collapsed");
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // --- To-Do List Logic (User-Specific) ---
  const todoForm = document.getElementById("todo-form");
  if (todoForm && loggedInUser) {
    const todoInput = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");
    const todoKey = `${STORAGE_KEYS.TODOS_PREFIX}${loggedInUser.username}`;
    let todos = getStorageItem(todoKey, []);
    const saveTodos = () => setStorageItem(todoKey, todos);
    const renderTodos = () => {
      if (!todoList) return;
      todoList.innerHTML = "";
      todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.draggable = true;
        li.innerHTML = `<span class="todo-text ${
          todo.completed ? "completed" : ""
        }">${
          todo.text
        }</span><div class="todo-actions"><button class="complete-btn" data-index="${index}"><i class="fas fa-check"></i></button><button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button></div>`;
        todoList.appendChild(li);
      });
    };
    todoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (text) {
        todos.push({ text: text, completed: false });
        todoInput.value = "";
        saveTodos();
        renderTodos();
      }
    });
    todoList.addEventListener("click", (e) => {
      const completeBtn = e.target.closest(".complete-btn");
      const deleteBtn = e.target.closest(".delete-btn");
      if (completeBtn) {
        const index = completeBtn.dataset.index;
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
      } else if (deleteBtn) {
        const index = deleteBtn.dataset.index;
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
      }
    });
    renderTodos();
  }

  // --- Notice Board Logic ---
  const noticeBoard = document.getElementById("notice-board");
  const addNoticeContainer = document.getElementById("add-notice-container");
  const addNoticeModal = document.getElementById("add-notice-modal");
  const addNoticeForm = document.getElementById("add-notice-form");
  const cancelNoticeBtn = document.getElementById("cancel-notice-btn");

  if (noticeBoard && loggedInUser) {
    const noticeKey = STORAGE_KEYS.NOTICES;
    const initialNotices = [
      {
        id: 1,
        title: "Urgent: College Closed Tomorrow",
        tag: "Urgent",
        date: "Sep 19, 2025",
        attachment: null,
        attachmentName: null,
      },
      {
        id: 2,
        title: "New Academic Calendar Published",
        tag: "All",
        date: "Sep 18, 2025",
        attachment: null,
        attachmentName: null,
      },
      {
        id: 3,
        title: "CSE Dept. Seminar on AI",
        tag: "Department",
        date: "Sep 17, 2025",
        attachment: null,
        attachmentName: null,
      },
    ];

    function getNotices() {
      let notices = getStorageItem(noticeKey);
      if (!notices) {
        setStorageItem(noticeKey, initialNotices);
        return initialNotices;
      }
      return notices;
    }

    let notices = getNotices();
    const saveNotices = () => setStorageItem(noticeKey, notices);

    const renderNotices = () => {
      noticeBoard.innerHTML = "";
      const sortedNotices = [...notices].sort((a, b) => b.id - a.id);

      sortedNotices.forEach((notice) => {
        const li = document.createElement("li");
        li.className = "notice-item";
        li.dataset.id = notice.id;

        let attachmentLink = "";
        if (notice.attachment && notice.attachmentName) {
          attachmentLink = `<p class="notice-attachment"><a href="${notice.attachment}" download="${notice.attachmentName}"><i class="fas fa-paperclip"></i> Download Attachment</a></p>`;
        }

        const deleteButtonHTML =
          loggedInUser.role === "faculty"
            ? `<button class="delete-notice-btn"><i class="fas fa-trash"></i></button>`
            : "";

        // This HTML structure is updated to work with the new CSS
        li.innerHTML = `
                <div class="notice-details">
                    <div class="notice-title-tag">
                        <span class="notice-title">${notice.title}</span>
                        <span class="notice-tag tag-${notice.tag
                          .toLowerCase()
                          .replace(" ", "-")}">${notice.tag}</span>
                    </div>
                    <p class="notice-date">${notice.date}</p>
                    ${attachmentLink}
                </div>
                ${deleteButtonHTML}
            `;
        noticeBoard.appendChild(li);
      });
    };

    if (loggedInUser.role === "faculty") {
      const addNoticeBtn = document.createElement("button");
      addNoticeBtn.textContent = "Add New Notice";
      addNoticeBtn.className = "profile-action-btn";
      addNoticeBtn.addEventListener("click", () =>
        addNoticeModal.classList.add("active")
      );
      if (addNoticeContainer) addNoticeContainer.appendChild(addNoticeBtn);

      if (addNoticeForm) {
        addNoticeForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const title = document.getElementById("notice-title").value;
          const tag = document.getElementById("notice-tag").value;
          const fileInput = document.getElementById("notice-file");
          const file = fileInput.files[0];
          const date = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          const newNotice = {
            id: Date.now(),
            title,
            tag,
            date,
            attachment: null,
            attachmentName: null,
          };

          if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
              newNotice.attachment = event.target.result;
              newNotice.attachmentName = file.name;
              notices.unshift(newNotice);
              saveNotices();
              renderNotices();
              addNoticeForm.reset();
              addNoticeModal.classList.remove("active");
            };
            reader.readAsDataURL(file);
          } else {
            notices.unshift(newNotice);
            saveNotices();
            renderNotices();
            addNoticeForm.reset();
            addNoticeModal.classList.remove("active");
          }
        });
      }

      if (cancelNoticeBtn) {
        cancelNoticeBtn.addEventListener("click", () =>
          addNoticeModal.classList.remove("active")
        );
      }

      noticeBoard.addEventListener("click", (e) => {
        const deleteButton = e.target.closest(".delete-notice-btn");
        if (deleteButton) {
          const noticeItem = deleteButton.closest(".notice-item");
          const noticeId = Number(noticeItem.dataset.id);
          notices = notices.filter((n) => n.id !== noticeId);
          saveNotices();
          renderNotices();
        }
      });
    }
    renderNotices();
  }

  // --- Timetable Logic ---
  // --- Timetable Logic ---
const timetableData = [
    {
      year: "1",
      branch: "Applied science and humanities",
      pdf: "assets/pdfs/cs-year1-timetable.pdf",
    },
    {
      year: "2",
      branch: "Information Technology",
      pdf: "assets/pdfs/cs-year2-timetable.pdf",
    },
    {
      year: "2",
      branch: "Electrical Engineering",
      pdf: "assets/pdfs/cs-year2-timetable.pdf",
    },
    {
      year: "2",
      branch: "Mechanical Engineering",
      pdf: "assets/pdfs/cs-year2-timetable.pdf",
    },
    {
      year: "3",
      branch: "Information Technology",
      pdf: "assets/pdfs/cs-year3-timetable.pdf",
    },
    {
      year: "3",
      branch: "Electrical Engineering",
      pdf: "assets/pdfs/cs-year3-timetable.pdf",
    },
    {
      year: "3",
      branch: "Mechanical Engineering",
      pdf: "assets/pdfs/cs-year3-timetable.pdf",
    },
    {
      year: "4",
      branch: "Information Technology",
      pdf: "assets/pdfs/cs-year4-timetable.pdf",
    },
    {
      year: "4",
      branch: "Electrical Engineering",
      pdf: "assets/pdfs/cs-year4-timetable.pdf",
    },
    {
      year: "4",
      branch: "Mechanical Engineering",
      pdf: "assets/pdfs/cs-year4-timetable.pdf",
    },
];

  const timetableContainer = document.getElementById("timetable-content");
  if (timetableContainer) {
    timetableContainer.innerHTML = "";
    const groupedData = {};
    timetableData.forEach((item) => {
      if (!groupedData[item.year]) groupedData[item.year] = [];
      groupedData[item.year].push(item);
    });
    const years = Object.keys(groupedData).sort(
      (a, b) => Number(a) - Number(b)
    );
    years.forEach((year) => {
      const yearSection = document.createElement("div");
      yearSection.className = "timetable-year-section";
      yearSection.innerHTML = `<h3>Year ${year}</h3>`;
      const branchList = document.createElement("ul");
      groupedData[year].forEach((item) => {
        const branchItem = document.createElement("li");
        let linkText = "";
        if (item.year === "1") {
          linkText = `Common Timetable (PDF)`;
        } else {
          let branchAbbreviation = item.branch;
          if (item.branch === "Information Technology") branchAbbreviation = "IT";
          if (item.branch === "Electrical Engineering") branchAbbreviation = "EE";
          if (item.branch === "Mechanical Engineering") branchAbbreviation = "ME";
          linkText = `${branchAbbreviation} Timetable (PDF)`;
        }

        // For years > 1, group them under a single heading
        if (item.year !== "1") {
          yearSection.style.display = 'flex';
          yearSection.style.gap = '15px';
        }
        branchItem.innerHTML = `<a href="${item.pdf}" target="_blank">${linkText}</a>`;
        branchList.appendChild(branchItem);
      });
      yearSection.appendChild(branchList);
      timetableContainer.appendChild(yearSection);
    });
  }

  // --- Global Search Functionality ---
  const searchInput = document.getElementById("search-input");
  const searchResultsContainer = document.getElementById(
    "search-results-container"
  );

  if (searchInput && searchResultsContainer) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase().trim();
      if (searchTerm.length < 2) {
        searchResultsContainer.style.display = "none";
        return;
      }

      // --- NEW: Comprehensive search across all data types ---
      // --- FIX: Get data from localStorage first, with fallback to initial data ---
      const currentStudents = getStorageItem(STORAGE_KEYS.STUDENT_PROFILES, typeof studentsData !== 'undefined' ? studentsData : []);
      const currentFaculty = getStorageItem('userProfiles_faculty', typeof facultyData !== 'undefined' ? facultyData : []);
      const currentAlumni = getStorageItem('userProfiles_alumni', typeof alumniData !== 'undefined' ? alumniData : []);
      const currentEvents = getStorageItem(STORAGE_KEYS.CAMPUS_EVENTS, typeof eventsData !== 'undefined' ? eventsData : []);
      const currentClubs = typeof clubsData !== 'undefined' ? clubsData : [];


      const results = {
        students: currentStudents.filter(s => s.name.toLowerCase().includes(searchTerm) || s.branch.toLowerCase().includes(searchTerm) || (s.skills && s.skills.some(skill => skill.toLowerCase().includes(searchTerm)))),
        faculty: currentFaculty.filter(f => f.name.toLowerCase().includes(searchTerm) || f.branch.toLowerCase().includes(searchTerm) || f.research.toLowerCase().includes(searchTerm)),
        alumni: currentAlumni.filter(a => a.name.toLowerCase().includes(searchTerm) || a.company.toLowerCase().includes(searchTerm) || a.currentRole.toLowerCase().includes(searchTerm)),
        events: currentEvents.filter(e => e.title.toLowerCase().includes(searchTerm) || e.description.toLowerCase().includes(searchTerm) || e.organizer.toLowerCase().includes(searchTerm)),
        clubs: currentClubs.filter(c => c.name.toLowerCase().includes(searchTerm)),
        tools: [], // Will be populated from aiToolsData and careerData
      };

      // Search AI and Career tools
      const allTools = [];
      if (typeof aiToolsData !== 'undefined') {
        Object.values(aiToolsData).forEach(category => allTools.push(...category.map(tool => ({ ...tool, page: 'ai-tools.html', category: 'AI Tool' }))));
      }
      if (typeof careerData !== 'undefined') {
        Object.values(careerData).forEach(category => allTools.push(...category.map(tool => ({ ...tool, page: 'career.html', category: 'Career Portal' }))));
      }
      results.tools = allTools.filter(t => t.name.toLowerCase().includes(searchTerm));

      renderSearchResults(results);
    });

    function renderSearchResults(results) {
      searchResultsContainer.innerHTML = "";
      let hasResults = false;

      const basePath = window.location.pathname.includes("/pages/") ? "." : "pages";

      const createResultItem = (text, category, url) => {
        const item = document.createElement("a");
        item.className = "search-result-item";
        item.href = url;
        item.innerHTML = `<span class="result-name">${text}</span><span class="result-category">${category}</span>`;
        return item;
      };

      const appendCategory = (title, items, textKey, categoryKey, page) => {
        if (items.length > 0) {
          hasResults = true;
          searchResultsContainer.innerHTML += `<div class="search-category-header">${title}</div>`;
          items.forEach(item => {
            const categoryText = typeof categoryKey === 'function' ? categoryKey(item) : item[categoryKey];
            searchResultsContainer.appendChild(createResultItem(item[textKey], categoryText, `${basePath}/${page}`));
          });
        }
      };

      appendCategory('Students', results.students, 'name', 'branch', 'student.html');
      appendCategory('Faculty', results.faculty, 'name', 'branch', 'faculty.html');
      appendCategory('Alumni', results.alumni, 'name', (item) => `${item.currentRole} @ ${item.company}`, 'alumni.html');
      appendCategory('Events', results.events, 'title', 'organizer', 'events.html');
      appendCategory('Clubs', results.clubs, 'name', () => 'Student Club', 'clubs.html');

      // Handle tools separately as they have a different structure
      if (results.tools.length > 0) {
        hasResults = true;
        searchResultsContainer.innerHTML += `<div class="search-category-header">Tools & Portals</div>`;
        results.tools.forEach(tool => {
            const item = document.createElement("a");
            item.className = "search-result-item";
            item.href = tool.url;
            item.target = "_blank"; // Open external links in a new tab
            item.innerHTML = `<span class="result-name">${tool.name}</span><span class="result-category">${tool.category}</span>`;
            searchResultsContainer.appendChild(item);
        });
      }

      if (!hasResults) {
        searchResultsContainer.innerHTML =
          '<div class="search-result-item">No results found.</div>';
      }
      searchResultsContainer.style.display = "block";
    }

    document.addEventListener("click", (event) => {
      if (
        !searchResultsContainer.contains(event.target) &&
        event.target !== searchInput
      ) {
        searchResultsContainer.style.display = "none";
      }
    });
  }

  // --- FIX: Search result items are now <a> tags, so they don't need a nested <a> ---
  // The CSS needs to be adjusted to style the item itself.
  // I'll add a new style rule in `style.css` for this.
  // The old search result item was a div with a nested a. The new one is just an a.
  // This makes the HTML cleaner and more semantic.
  // The `renderSearchResults` function has been updated to create `<a>` elements directly.
  // The CSS change will be in the `style.css` file.








  // --- AKTU One-View Modal Logic ---
  const aktuModalBtn = document.getElementById("aktu-modal-btn");
  const aktuModal = document.getElementById("aktu-modal");
  const closeAktuModalBtn = document.getElementById("close-aktu-modal-btn");

  if (aktuModalBtn && aktuModal && closeAktuModalBtn) {
    aktuModalBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent the '#' from changing the URL
      aktuModal.classList.add("active");
    });

    closeAktuModalBtn.addEventListener("click", () => {
      aktuModal.classList.remove("active");
    });

    // Close modal if clicking on the overlay
    aktuModal.addEventListener("click", (e) => {
      if (e.target === aktuModal) {
        aktuModal.classList.remove("active");
      }
    });
  }

  // --- Attendance Summary Modal Logic ---
  const showAttendanceSummaryBtn = document.getElementById('show-attendance-summary-btn');
  const attendanceSummaryModal = document.getElementById('attendance-summary-modal');
  const closeAttendanceSummaryModalBtn = document.getElementById('close-attendance-summary-modal-btn');

  function renderAttendanceSummary() {
    const summaryList = document.getElementById('attendance-summary-list');
    if (!summaryList) return;

    if (!loggedInUser || loggedInUser.role !== 'student') {
      summaryList.innerHTML = '<li><p>This feature is available for students.</p></li>';
      if (showAttendanceSummaryBtn) showAttendanceSummaryBtn.style.display = 'none'; // Hide button if not a student
      return;
    }

    if (showAttendanceSummaryBtn) showAttendanceSummaryBtn.style.display = 'block'; // Ensure button is visible for students

    const studentProfile = getStorageItem(STORAGE_KEYS.STUDENT_PROFILES, []).find(p => p.username === loggedInUser.username);
    if (!studentProfile) {
      summaryList.innerHTML = '<li><p>Please create your student profile to view attendance.</p></li>';
      return;
    }

    // --- MODIFIED: Get latest subject data from storage ---
    // The calculateAttendance function now handles getting the correct subjects internally.
    // We only need to pass the username. The second argument is not needed as the function is self-sufficient.
    const stats = calculateAttendance(loggedInUser.username);

    if (Object.keys(stats).length === 0) {
      summaryList.innerHTML = '<li><p>No subjects found for your profile.</p></li>';
      return;
    }

    summaryList.innerHTML = '';
    for (const subjectId in stats) {
      const subjectStat = stats[subjectId];
      const li = document.createElement('li');

      let color = 'var(--primary-color)';
      if (subjectStat.percentage < 75) color = '#f59e0b'; // Yellow
      if (subjectStat.percentage < 50) color = '#ef4444'; // Red

      li.innerHTML = `
        <span class="subject-name">${subjectStat.name}</span>
        <div class="percentage-bar">
          <div class="percentage-fill" style="width: ${subjectStat.percentage}%; background-color: ${color};"></div>
        </div>
        <span class="percentage-text" style="color: ${color};">${subjectStat.percentage}%</span>
      `;
      summaryList.appendChild(li);
    }
  }

  if (showAttendanceSummaryBtn && attendanceSummaryModal && closeAttendanceSummaryModalBtn) {
    showAttendanceSummaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderAttendanceSummary(); // Calculate and render fresh data each time
      attendanceSummaryModal.classList.add('active');
    });
    closeAttendanceSummaryModalBtn.addEventListener('click', () => attendanceSummaryModal.classList.remove('active'));
    attendanceSummaryModal.addEventListener('click', (e) => { if (e.target === attendanceSummaryModal) attendanceSummaryModal.classList.remove('active'); });
  }

  // Listen for the custom event from attendance.js to re-render summary if modal is open
  window.addEventListener('attendanceUpdated', () => {
      if (attendanceSummaryModal && attendanceSummaryModal.classList.contains('active')) {
          renderAttendanceSummary();
      }
  });

  // Initial check to hide/show the button based on role
  renderAttendanceSummary();
});
