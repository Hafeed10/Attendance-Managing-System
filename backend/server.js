const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Import database models and connection
const { sequelize, User } = require('./models');

// Import your new Admin Routes
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(express.json()); 
app.use(cors()); 

const SECRET_KEY = "super_secret_attendance_key";

// Basic test route so the browser doesn't show "Cannot GET /"
app.get('/', (req, res) => {
    res.send("Welcome to the Attendance System Admin Backend!");
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find the user in the MySQL database
        const user = await User.findOne({ where: { email } });

        // 2. Check if user exists AND password matches
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 3. Create the Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '8h' }
        );

        res.json({
            message: "Login successful!",
            token: token,
            role: user.role
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Mount the Admin routes
app.use('/api/admin', adminRoutes);

// Sync database and start server
const PORT = 5001;
sequelize.sync({ alter: true }).then(async () => {
    console.log("✅ MySQL Database connected and synced!");
    
    // Seed an initial admin user if none exists
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Super Admin",
            email: "admin@school.com",
            password: hashedPassword,
            role: "admin"
        });
        console.log("✅ Initial Admin created (admin@school.com / admin123)");
    }

    app.listen(PORT, () => {
        console.log(`✅ API Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Database connection failed:", error.message);
});