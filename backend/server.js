const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // Allows the API to read data
app.use(cors()); // Allows your frontend team to connect

const SECRET_KEY = "super_secret_attendance_key"; // In production, hide this!

// A mock database of your 3 user types
const usersDatabase = [
    { email: "admin@school.com", password: "password123", role: "admin" },
    { email: "teacher@school.com", password: "password123", role: "faculty" },
    { email: "parent@home.com", password: "password123", role: "parent" }
];

// The Login API Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Find the user
    const user = usersDatabase.find(u => u.email === email);

    // 2. Check if user exists AND password matches
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Create the Token (The VIP Pass) with their specific role
    const token = jwt.sign(
        { email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '8h' }
    );

    // 4. Send the token and role back to the frontend
    res.json({
        message: "Login successful!",
        token: token,
        role: user.role
    });
});

// Turn the server on
app.listen(5001, () => {
    console.log("✅ API Server is running on http://localhost:5001");
});