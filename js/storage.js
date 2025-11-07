
/**
 * @file Centralized module for handling all API (backend) interactions.
 * Replaces localStorage-only functions with asynchronous fetch calls to the Express server.
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Generic function to call the backend API (The waiter).
 */
async function callAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            console.error(`API Error on ${endpoint}:`, data.message);
            throw new Error(data.message || `API call failed with status ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("Network or API call failed:", error);
        return null;
    }
}


// -----------------------------------------------------------------
// 1. SESSION STORAGE (Only for loggedInUser & key management)
// We keep these simple helper functions to manage the current user's *session*
// in the browser's local storage after a successful login.
// -----------------------------------------------------------------

export function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item "${key}" in localStorage:`, error);
  }
}

export function removeStorageItem(key) {
  localStorage.removeItem(key);
}


// -----------------------------------------------------------------
// 2. AUTH-Specific Exports (for script.js)
// -----------------------------------------------------------------
export async function apiLogin(username, password, role) {
    return callAPI('auth/login', 'POST', { username, password, role });
}

export async function apiSignup(username, password, role) {
    return callAPI('auth/signup', 'POST', { username, password, role });
}


// -----------------------------------------------------------------
// 3. DATA COLLECTION EXPORTS (Async wrappers for all feature files)
// These replace the old synchronous getStorageItem/setStorageItem for data.
// -----------------------------------------------------------------

async function getCollectionData(collectionKey) {
    const result = await callAPI(`data/${collectionKey}`);
    return result && result.success ? (result.data || []) : [];
}

async function setCollectionData(collectionKey, value) {
    const result = await callAPI(`data/${collectionKey}`, 'POST', { data: value });
    return result; 
}

// Student Data (used by script.js, student-profile.js, attendance.js)
export async function getStudentData() { return getCollectionData('userProfiles_students'); }
export async function setStudentData(data) { return setCollectionData('userProfiles_students', data); }

// Faculty Data (used by faculty.js, faculty-profile.js)
export async function getFacultyData() { return getCollectionData('userProfiles_faculty'); }
export async function setFacultyData(data) { return setCollectionData('userProfiles_faculty', data); }

// Alumni Data (used by alumni-profile.js)
export async function getAlumniData() { return getCollectionData('userProfiles_alumni'); }
export async function setAlumniData(data) { return setCollectionData('userProfiles_alumni', data); }

// Event Data (used by events.js)
export async function getEventData() { return getCollectionData('campus_events'); }
export async function setEventData(data) { return setCollectionData('campus_events', data); }

// Generic data for notices/subjects (used by script.js, attendance.js)
export async function getGenericData(key) { return getCollectionData(key); }
export async function setGenericData(key, data) { return setCollectionData(key, data); }

export async function apiGetData(collection) {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}`);
    if (!response.ok) {
      // If not found (404) or server error, return a failed status
      return { success: false, message: `Error ${response.status}` };
    }
    return await response.json(); // Returns { success: true, data: [...] }
  } catch (error) {
    console.error("API GET Error:", error);
    return { success: false, message: error.message };
  }
}
export async function apiSaveData(collection, dataToSave) {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Your backend server.js expects the payload inside a "data" key
      //
      body: JSON.stringify({ data: dataToSave }), 
    });
    return await response.json(); // Returns { success: true, message: '... updated.' }
  } catch (error) {
    console.error("API POST Error:", error);
    return { success: false, message: error.message };
  }
}