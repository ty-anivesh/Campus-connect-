import { getStorageItem, setStorageItem } from './storage.js';
import { STORAGE_KEYS } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = getStorageItem(STORAGE_KEYS.LOGGED_IN_USER);
  if (!loggedInUser) return;

  // --- ELEMENTS ---
  const eventsContainer = document.getElementById("events-container");
  const addEventContainer = document.getElementById("add-event-container");
  const modal = document.getElementById("event-modal");
  const modalTitle = document.getElementById("modal-title");
  const eventForm = document.getElementById("event-form");
  const cancelBtn = document.getElementById("cancel-event-btn");
  const eventIdInput = document.getElementById("event-id");

  // --- DATA MANAGEMENT ---
  // --- DATA MANAGEMENT ---
  function getEvents() {
    const storedEvents = getStorageItem(STORAGE_KEYS.CAMPUS_EVENTS);
    if (storedEvents) {
      return storedEvents;
    }
    // If no events are in storage, initialize with default data
    setStorageItem(STORAGE_KEYS.CAMPUS_EVENTS, eventsData);
    return eventsData;
  }
  function saveEvents(events) {
    setStorageItem(STORAGE_KEYS.CAMPUS_EVENTS, events);
  }

  // --- RENDER EVENTS ---
  function renderEvents() {
    if (!eventsContainer) return;
    eventsContainer.innerHTML = "";
    const events = getEvents();

    if (events.length === 0) {
      eventsContainer.innerHTML =
        "<p>There are no upcoming events scheduled.</p>";
      return;
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    events.forEach((event) => {
      const card = document.createElement("div");
      card.className = "profile-card event-card"; // Reusing profile-card style

      // Show edit/delete buttons only if the logged-in user is the one who created it
      const isOwner = loggedInUser.username === event.createdBy;
      const actionButtons = isOwner
        ? `
            <div class="event-actions">
                <button class="edit-event-btn" data-id="${event.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-event-btn" data-id="${event.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>`
        : "";

     card.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(
          event.date
        ).toLocaleDateString()} at ${event.time}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Organizer:</strong> ${event.organizer}</p>
        <p>${event.description}</p>
        <p class="event-creator">Posted by: ${event.createdBy}</p>
        ${actionButtons}
      `;
      eventsContainer.appendChild(card);
    });
  }

  // --- UI SETUP ---
  function setupUI() {
    // Show the "Add Event" button if any user is logged in
    if (loggedInUser && addEventContainer) {
      const addEventBtn = document.createElement("button");
      addEventBtn.className = "profile-action-btn";
      addEventBtn.textContent = "Add New Event";
      addEventBtn.addEventListener("click", () => openModal());
      addEventContainer.appendChild(addEventBtn);
    }
  }
  // --- MODAL HANDLING ---
  function openModal(event = null) {
    eventForm.reset();
    if (event) {
      // Editing mode
      modalTitle.textContent = "Edit Event";
      eventIdInput.value = event.id;
      document.getElementById("event-title").value = event.title;
      document.getElementById("event-description").value = event.description;
      document.getElementById("event-date").value = event.date;
      document.getElementById("event-time").value = event.time;
      document.getElementById("event-venue").value = event.venue;
      document.getElementById("event-organizer").value = event.organizer;
    } else {
      // Adding mode
      modalTitle.textContent = "Add New Event";
      eventIdInput.value = "";
    }
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // --- FORM SUBMISSION ---
  if (eventForm) {
    eventForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const eventData = {
        id: eventIdInput.value
          ? Number(eventIdInput.value)
          : Date.now(),
        title: document.getElementById("event-title").value,
        description: document.getElementById("event-description").value,
        date: document.getElementById("event-date").value,
        time: document.getElementById("event-time").value,
        venue: document.getElementById("event-venue").value,
        organizer: document.getElementById("event-organizer").value,
        createdBy: loggedInUser.username, // Track who created the event
      };

      let events = getEvents();
      if (eventIdInput.value) {
        // Update existing event
        const index = events.findIndex((e) => e.id === eventData.id);
        if (index > -1) {
          events[index] = eventData;
        }
      } else {
        // Add new event
        events.push(eventData);
      }

      saveEvents(events);
      renderEvents();
      closeModal();
    });
  }

  // --- EVENT DELEGATION FOR EDIT/DELETE ---
  if (eventsContainer) {
    eventsContainer.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-event-btn");
      const deleteBtn = e.target.closest(".delete-event-btn");

      if (editBtn) {
        const eventId = Number(editBtn.dataset.id);
        const events = getEvents();
        const eventToEdit = events.find((event) => event.id === eventId);
        if (eventToEdit) {
          openModal(eventToEdit);
        }
      }

      if (deleteBtn) {
        if (confirm("Are you sure you want to delete this event?")) {
          const eventId = Number(deleteBtn.dataset.id);
          let events = getEvents();
          events = events.filter((event) => event.id !== eventId);
          saveEvents(events);
          renderEvents();
        }
      }
    });
  }

  // --- INITIALIZATION ---
  setupUI();
  renderEvents();
});