const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// --- Middleware Setup ---
app.use(cors()); // Allows your frontend to connect
app.use(express.json()); // Tells the server to read incoming data as JSON

// ------------------------------------------------------------------
// FILE HANDLING HELPERS (The server's librarian)
// ------------------------------------------------------------------

// Reads the entire db.json file and returns its content as a JavaScript object.
function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error.message);
        // Return a default structure if the file is missing/corrupt
        return {};
    }
}

// Overwrites the db.json file with the current JavaScript object data.
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}


// ------------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS (Login & Signup)
// ------------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
    const { username, password, role } = req.body;
    const db = readDB(); // Get all data
    // Find the user in the database
    const user = db.users.find(u => u.username === username && u.password === password && u.role === role);

    if (user) {
        // Success: send the user object back
        res.json({ success: true, user: user });
    } else {
        // Failure: send an error message
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
});

app.post('/api/auth/signup', (req, res) => {
    const { username, password, role } = req.body;
    const db = readDB();
    if (db.users.some(u => u.username === username)) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
    }
    const newUser = { username, password, role, profileImage: null };
    db.users.push(newUser); // Add the new user to the list
    writeDB(db); // Save the updated list to db.json
    res.json({ success: true, message: 'User registered successfully!' });
});


// ------------------------------------------------------------------
// 2. DATA ENDPOINTS (Fetch/Save any list)
// ------------------------------------------------------------------

// GET: Fetch the data (read the list)
app.get('/api/data/:collection', (req, res) => {
    const collection = req.params.collection; // e.g., 'userProfiles_students'
    const db = readDB();

    // Check if the data key exists and return it, otherwise return an empty array
    if (db[collection] !== undefined) {
        return res.json({ success: true, data: db[collection] });
    }

    return res.status(404).json({ success: false, message: 'Collection not found' });
});

// POST: Save the data (overwrite the list)
app.post('/api/data/:collection', (req, res) => {
    const collection = req.params.collection;
    const newData = req.body.data; // This is the entire updated list/object from the frontend

    if (!newData) {
        return res.status(400).json({ success: false, message: 'Missing data payload.' });
    }

    const db = readDB();

    // Replace the old list with the new, updated list
    db[collection] = newData;

    writeDB(db); // Save the full change to db.json
    res.json({ success: true, message: `${collection} updated.` });
});


// ------------------------------------------------------------------
// Server Start
// ------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});