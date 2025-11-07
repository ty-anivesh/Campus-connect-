import { getStorageItem, setStorageItem } from './storage.js';
import { STORAGE_KEYS } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = getStorageItem(STORAGE_KEYS.LOGGED_IN_USER);
    const studentProfile = getStorageItem(STORAGE_KEYS.STUDENT_PROFILES, []).find(p => p.username === loggedInUser.username);

    if (!loggedInUser || loggedInUser.role !== 'student' || !studentProfile) {
        const section = document.querySelector('.attendance-section');
        if(section) {
            section.innerHTML = `<h1>Attendance Log</h1>
            <div class="card"><p>This feature requires a student profile to know your year and branch.</p>
            <p>Please go to the <strong>Students</strong> page and click <strong>'Add Your Profile'</strong> to get started.</p></div>`;
        }
        return;
    }

    const attendanceDateInput = document.getElementById('attendance-date');
    const subjectListContainer = document.getElementById('subject-list');
    const saveBtn = document.getElementById('save-attendance-btn');
    const clearBtn = document.getElementById('clear-attendance-btn');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const showStatsBtn = document.getElementById('show-stats-btn');
    const statsModal = document.getElementById('attendance-stats-modal');
    const closeStatsModalBtn = document.getElementById('close-stats-modal-btn');
    const statsModalBody = document.getElementById('stats-modal-body');
    const statsStartDateInput = document.getElementById('stats-start-date');
    const statsEndDateInput = document.getElementById('stats-end-date');
    const recalculateStatsBtn = document.getElementById('recalculate-stats-btn');

    // --- NEW: Edit Subject Modal Elements ---
    const editSubjectModal = document.getElementById('edit-subject-modal');
    const editSubjectForm = document.getElementById('edit-subject-form');
    const cancelEditSubjectBtn = document.getElementById('cancel-edit-subject-btn');
    const editSubjectIdInput = document.getElementById('edit-subject-id');
    const editSubjectNameInput = document.getElementById('edit-subject-name');

    const ATTENDANCE_KEY = `attendance_${loggedInUser.username}`;
    const SUBJECTS_KEY = 'subjectsData'; // Key for storing editable subjects

    // --- NEW: Default subject data is now self-contained here ---
    const defaultSubjectsByYearBranch = {
        "3": {
            "Information Technology": [
                { id: "IT301", name: "Data Science", type: "Theory" },
                { id: "IT302", name: "Compiler Design", type: "Theory" },
                { id: "IT303", name: "Web Technology", type: "Theory" },
                { id: "IT304", name: "Software Engineering", type: "Theory" },
                { id: "IT305", name: "Cryptography & Network Security", type: "Theory" },
                { id: "OE01", name: "Open Elective I", type: "Theory" },
                { id: "IT301L", name: "Data Science Lab", type: "Lab" },
                { id: "IT303L", name: "Web Technology Lab", type: "Lab" },
                { id: "IT304L", name: "Software Engineering Lab", type: "Lab" },
                { id: "MiniP", name: "Mini Project", type: "Lab" },
            ]
        },
        "4": {
            "Information Technology": [
                { id: "IT401", name: "Cloud Computing", type: "Theory" },
                { id: "IT402", name: "AI", type: "Theory" },
            ]
        }
    };

    // --- NEW: Function to get editable subject data ---
    function getSubjectsData() {
        let subjects = getStorageItem(SUBJECTS_KEY);
        if (!subjects) {
            // If not in storage, use default from data.js and save it
            subjects = defaultSubjectsByYearBranch;
            setStorageItem(SUBJECTS_KEY, subjects);
        }
        return subjects;
    }

    let allSubjectsData = getSubjectsData();
    const studentSubjects = allSubjectsData[studentProfile.year]?.[studentProfile.branch] || [];

    function getAttendanceData() {
        return getStorageItem(ATTENDANCE_KEY, {});
    }


    function renderSubjectsForDate(date) {
        if (studentSubjects.length === 0) {
            subjectListContainer.innerHTML = '<p>No subjects found for your year and branch.</p>';
            saveBtn.style.display = 'none';
            return;
        }

        const attendanceData = getAttendanceData();
        const dailyLog = attendanceData[date] || {};

        subjectListContainer.innerHTML = '';
        studentSubjects.forEach(subject => {
            const subjectRow = document.createElement('div');
            subjectRow.className = 'subject-log-row';

            const status = dailyLog[subject.id] || 'unmarked';

            subjectRow.innerHTML = `
                <div class="subject-name-wrapper">
                    <span class="subject-name">${subject.name}</span>
                    <span class="subject-type">${subject.type}</span>
                    <i class="fas fa-pencil-alt edit-subject-btn" data-subject-id="${subject.id}" data-subject-name="${subject.name}" title="Edit Name"></i>
                </div>
                <div class="attendance-options" data-subject-id="${subject.id}">
                    <label>
                        <input type="radio" name="status-${subject.id}" value="attended" ${status === 'attended' ? 'checked' : ''}>
                        <span>Attended</span>
                    </label>
                    <label>
                        <input type="radio" name="status-${subject.id}" value="missed" ${status === 'missed' ? 'checked' : ''}>
                        <span>Missed</span>
                    </label>
                    <label>
                        <input type="radio" name="status-${subject.id}" value="cancelled" ${status === 'cancelled' ? 'checked' : ''}>
                        <span>Cancelled</span>
                    </label>
                </div>
            `;
            subjectListContainer.appendChild(subjectRow);
        });

        saveBtn.style.display = 'block';
        clearBtn.style.display = 'block';
    }

    attendanceDateInput.addEventListener('change', () => {
        const selectedDate = attendanceDateInput.value;
        if (!selectedDate) return;

        const dateObj = new Date(selectedDate + 'T00:00:00'); // Ensure local timezone
        const day = dateObj.getDay();

        // 0 is Sunday, 6 is Saturday
        if (day === 0 || day === 6) {
            subjectListContainer.innerHTML = '<p>College is off on weekends. Please select a weekday.</p>';
            saveBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            selectedDateDisplay.textContent = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return;
        }

        selectedDateDisplay.textContent = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        renderSubjectsForDate(selectedDate);
    });

    // --- FINAL FIX: Allow unchecking radio buttons ---
    subjectListContainer.addEventListener('click', (e) => {
        const radio = e.target;
        // Only act if the clicked element is a radio button
        if (radio.type !== 'radio') return;

        // The 'data-was-checked' attribute will store the state *before* the click.
        const wasChecked = radio.getAttribute('data-was-checked') === 'true';

        if (wasChecked) {
            // If it was already checked, this click should uncheck it.
            radio.checked = false;
        }
    });
    subjectListContainer.addEventListener('mousedown', (e) => {
        // Before the click happens, record the current state of the radio button.
        const radio = e.target;
        if (radio.type === 'radio') {
            radio.setAttribute('data-was-checked', radio.checked);
        }
    }, true); // Use capture phase to ensure this runs before the click.

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all selections for this date?')) {
            const checkedRadios = subjectListContainer.querySelectorAll('input[type="radio"]:checked');
            checkedRadios.forEach(radio => {
                radio.checked = false;
            });
        }
    });
    saveBtn.addEventListener('click', () => {
        const selectedDate = attendanceDateInput.value;
        if (!selectedDate) {
            alert('Please select a date first.');
            return;
        }

        const allAttendanceData = getAttendanceData();
        const newDailyLog = {}; // Create a fresh log for the day
        const rows = document.querySelectorAll('.attendance-options');

        rows.forEach(row => {
            const subjectId = row.dataset.subjectId;
            const checkedRadio = row.querySelector('input[type="radio"]:checked');
            if (checkedRadio) {
                // Only add to the log if a status is explicitly selected
                newDailyLog[subjectId] = checkedRadio.value;
            }
        });

        if (Object.keys(newDailyLog).length > 0) {
            allAttendanceData[selectedDate] = newDailyLog;
        } else {
            // If the log for the day is empty, delete it entirely
            delete allAttendanceData[selectedDate];
        }

        setStorageItem(ATTENDANCE_KEY, allAttendanceData);
        alert('Attendance for ' + selectedDate + ' saved successfully!');

        // Dispatch a custom event to notify the dashboard to update
        window.dispatchEvent(new CustomEvent('attendanceUpdated'));

    });

    // --- NEW: Edit Subject Logic ---
    if (editSubjectModal) {
        subjectListContainer.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-subject-btn');
            if (editBtn) {
                const subjectId = editBtn.dataset.subjectId;
                const subjectName = editBtn.dataset.subjectName;
                editSubjectIdInput.value = subjectId;
                editSubjectNameInput.value = subjectName;
                editSubjectModal.classList.add('active');
            }
        });

        cancelEditSubjectBtn.addEventListener('click', () => editSubjectModal.classList.remove('active'));

        editSubjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subjectIdToEdit = editSubjectIdInput.value;
            const newName = editSubjectNameInput.value.trim();

            if (newName) {
                // Find and update the subject in our main data source
                const subject = studentSubjects.find(s => s.id === subjectIdToEdit);
                if (subject) {
                    subject.name = newName;
                }

                // Save the entire updated subjects object back to localStorage
                setStorageItem(SUBJECTS_KEY, allSubjectsData);

                // --- FIX: Reload the subject data for the entire page ---
                allSubjectsData = getSubjectsData();

                // Re-render the current view to show the change
                renderSubjectsForDate(attendanceDateInput.value);
                // Dispatch event to update other parts of the UI (like the dashboard summary)
                window.dispatchEvent(new CustomEvent('attendanceUpdated'));
                editSubjectModal.classList.remove('active');
            }
        });
    }

    // --- Statistics Modal Logic ---
    function calculateAndShowStats(startDateFilter = null, endDateFilter = null) {
        const attendanceData = getAttendanceData(); // Always get the latest data
        const dates = Object.keys(attendanceData).sort();

        if (dates.length === 0) {
            statsModalBody.innerHTML = '<p>No attendance data has been logged yet.</p>';
            if (statsStartDateInput) statsStartDateInput.value = '';
            if (statsEndDateInput) statsEndDateInput.value = '';
            return;
        }

        // Set default filter dates if not provided
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        if (statsStartDateInput && !statsStartDateInput.value) statsStartDateInput.value = firstDate;
        if (statsEndDateInput && !statsEndDateInput.value) statsEndDateInput.value = lastDate;

        const finalStartDate = startDateFilter || firstDate;
        const finalEndDate = endDateFilter || lastDate;

        let content = `<div class="stats-summary">Showing data from <strong>${new Date(finalStartDate + 'T00:00:00').toLocaleDateString()}</strong> to <strong>${new Date(finalEndDate + 'T00:00:00').toLocaleDateString()}</strong></div>`;

        // --- FIX: Get the latest subject data directly from storage every time ---
        const latestSubjects = getSubjectsData()[studentProfile.year]?.[studentProfile.branch] || [];

        latestSubjects.forEach(subject => {
            let attended = 0;
            let missed = 0;
            let cancelled = 0;

            // Filter dates based on the selected range
            const filteredDates = dates.filter(d => {
                if (d < finalStartDate || d > finalEndDate) return false;
                // --- FIX: Explicitly ignore weekends from the calculation ---
                const dateObj = new Date(d + 'T00:00:00');
                const day = dateObj.getDay();
                return day !== 0 && day !== 6; // Exclude Sunday (0) and Saturday (6)
            });

            for (const date of filteredDates) {
                const status = attendanceData[date][subject.id];
                if (status === 'attended') attended++;
                if (status === 'missed') missed++;
                if (status === 'cancelled') cancelled++;
            }

            const totalClassesRun = attended + missed + cancelled;

            content += `
                <div class="subject-stat-item">
                    <h4>${subject.name}</h4>
                    <div class="stat-numbers">
                        <div>
                            <span>${totalClassesRun}</span>
                            <span>Classes Run</span>
                        </div>
                        <div>
                            <span>${attended}</span>
                            <span>Attended</span>
                        </div>
                        <div>
                            <span>${missed}</span>
                            <span>Missed</span>
                        </div>
                    </div>
                </div>
            `;
        });

        statsModalBody.innerHTML = content;
    }

    if (showStatsBtn && statsModal && closeStatsModalBtn && recalculateStatsBtn) {
        showStatsBtn.addEventListener('click', () => {
            calculateAndShowStats();
            statsModal.classList.add('active');
        });

        closeStatsModalBtn.addEventListener('click', () => {
            statsModal.classList.remove('active');
        });

        recalculateStatsBtn.addEventListener('click', () => {
            // Recalculate with the new date range from the inputs
            calculateAndShowStats(statsStartDateInput.value, statsEndDateInput.value);
        });

        statsModal.addEventListener('click', (e) => {
            if (e.target === statsModal) {
                statsModal.classList.remove('active');
            }
        });
    }

    // --- INITIALIZATION ---
    function initialize() {
        // Set date input to today by default
        const today = new Date().toISOString().split('T')[0];
        attendanceDateInput.value = today;
        selectedDateDisplay.textContent = 'Today';
        renderSubjectsForDate(today);
    }

    initialize();
});

/**
 * Calculates and returns attendance percentages.
 * This function is exported to be used by other modules (like script.js for the dashboard).
 * @param {string} username The student's username.
 * @param {Array} subjects The list of subjects for the student.
 * @returns {Object} An object containing subject-wise percentages.
 */
export function calculateAttendance(username) {
    // --- START OF REFINED VERSION ---
    // console.log("--- Starting Attendance Calculation ---");

    const studentProfile = getStorageItem(STORAGE_KEYS.STUDENT_PROFILES, []).find(p => p.username === username);
    // console.log("1. Found Student Profile:", studentProfile);

    if (!studentProfile) {
        console.error("Calculation stopped: No student profile found.");
        return {};
    }

    const allSubjects = getStorageItem('subjectsData');
    // console.log("2. Found 'subjectsData' in storage:", allSubjects);

    if (!allSubjects) {
        console.error("Calculation stopped: 'subjectsData' not found in localStorage. Please visit the main attendance page once to initialize it.");
        return {};
    }

    const currentSubjects = allSubjects[studentProfile.year]?.[studentProfile.branch] || [];
    // console.log("3. Filtered Subjects for this student:", currentSubjects);

    if (currentSubjects.length === 0) {
        console.warn("No subjects found for this student's year and branch.");
    }

    const attendanceData = getStorageItem(`attendance_${username}`, {});
    // console.log("4. Found Attendance Log:", attendanceData);

    const stats = {};
    // console.log("--- 5. Calculating percentage for each subject... ---");

    currentSubjects.forEach(subject => {
        let attended = 0;
        let totalClasses = 0;
        for (const date in attendanceData) {
            const dailyLog = attendanceData[date];
            if (dailyLog && dailyLog[subject.id]) {
                const status = dailyLog[subject.id];
                if (status === 'attended') {
                    attended++;
                    totalClasses++;
                } else if (status === 'missed') {
                    totalClasses++;
                } else if (status === 'cancelled') {
                    // Correct logic: Cancelled classes should not be counted in the total.
                    // The bug was that 'cancelled' was being added to totalClasses.
                }
            }
        }
        const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 100;
        stats[subject.id] = { name: subject.name, percentage: Math.round(percentage) };
        
        // console.log(`- Subject: ${subject.name}, Attended: ${attended}, Total: ${totalClasses}, Percentage: ${percentage.toFixed(2)}%`);
    });

    // console.log("6. Final Calculated Stats Object:", stats);
    // console.log("--- Finished Attendance Calculation ---");
    
    return stats;
}