const jwt = require('jsonwebtoken');

const SECRET_KEY = "super_secret_attendance_key"; // Must match the one in server.js

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
    // 1. Get the token from the headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        // 3. Attach the decoded user information to the request object
        req.user = decoded;
        next(); // Move to the next middleware or controller
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Requires admin privileges.' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin
};