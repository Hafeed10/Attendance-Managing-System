const bcrypt = require('bcrypt');
const { User, Faculty, Student } = require('../models');

// Logic to add a new faculty member
const addFaculty = async (req, res) => {
    try {
        const { name, email, phone, assignedSubjects, password } = req.body;
        
        // 1. Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields (name, email, password)' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 3. Save to database using Sequelize
        // First create the User login
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'faculty'
        });

        // Then create the Faculty profile linked to the User
        const newFaculty = await Faculty.create({
            phone: phone || null,
            assignedSubjects: assignedSubjects || [],
            userId: newUser.id
        });
        
        res.status(201).json({ message: "Admin Endpoint: Faculty added successfully!", faculty: newFaculty });
    } catch (error) {
        console.error("Error adding faculty:", error);
        res.status(500).json({ error: "Server error while adding faculty", details: error.message });
    }
};

// Logic to add a new student
const addStudent = async (req, res) => {
    try {
        const { name, classAssigned, division, rollNumber, parentContact } = req.body;
        
        // 1. Validation
        if (!name || !classAssigned || !division || !rollNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // 2. Save to database using Sequelize
        const newStudent = await Student.create({
            name,
            classAssigned,
            division,
            rollNumber,
            parentContact: parentContact || null
        });
        
        res.status(201).json({ message: "Admin Endpoint: Student added successfully!", student: newStudent });
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({ error: "Server error while adding student", details: error.message });
    }
};

module.exports = {
    addFaculty,
    addStudent
};