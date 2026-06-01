const bcrypt = require('bcrypt');
const { User, Faculty, Student } = require('../models');
const auditService = require('../services/auditService');

// Create a new faculty member (creates both User and Faculty rows)
const addFaculty = async (req, res) => {
    try {
        const { name, email, phone, assignedSubjects, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields (name, email, password)' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, role: 'faculty' });

        const newFaculty = await Faculty.create({ phone: phone || null, assignedSubjects: assignedSubjects || [], userId: newUser.id });

        await auditService.logAction({
          userId: req.user?.id || null,
          action: 'CREATE_FACULTY',
          entity: 'Faculty',
          entityId: newFaculty.id,
          changes: newFaculty.toJSON(),
          ipAddress: req.ip,
        });

        res.status(201).json({ message: 'Faculty added successfully', faculty: newFaculty });
    } catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).json({ error: 'Server error while adding faculty', details: error.message });
    }
};

// Get list of faculties (with optional pagination)
const listFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.findAll({ include: [{ model: User }] });
        res.json({ faculties });
    } catch (error) {
        console.error('Error fetching faculties:', error);
        res.status(500).json({ error: 'Server error while fetching faculties' });
    }
};

// Get single faculty by id
const getFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id, { include: [{ model: User }] });
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
        res.json({ faculty });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ error: 'Server error while fetching faculty' });
    }
};

// Update faculty
const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const faculty = await Faculty.findByPk(id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

        const before = faculty.toJSON();
        await faculty.update(updates);
        const after = faculty.toJSON();

        await auditService.logAction({
          userId: req.user?.id || null,
          action: 'UPDATE_FACULTY',
          entity: 'Faculty',
          entityId: faculty.id,
          changes: auditService.buildChanges(before, after),
          ipAddress: req.ip,
        });

        res.json({ message: 'Faculty updated', faculty });
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ error: 'Server error while updating faculty' });
    }
};

// Delete faculty (soft delete User by isActive=false and remove Faculty row)
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

        // Soft-disable user
        const user = await User.findByPk(faculty.userId);
        if (user) await user.update({ isActive: false });

        const facultyId = faculty.id;
        await faculty.destroy();

        await auditService.logAction({
          userId: req.user?.id || null,
          action: 'DELETE_FACULTY',
          entity: 'Faculty',
          entityId: facultyId,
          changes: { deleted: true },
          ipAddress: req.ip,
        });

        res.json({ message: 'Faculty removed' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ error: 'Server error while deleting faculty' });
    }
};

// Create a new student
const addStudent = async (req, res) => {
    try {
        const { name, classId, division, rollNumber, parentContact, password } = req.body;

        if (!name || !classId || !division || !rollNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newStudent = await Student.create({ name, classId, division, rollNumber, parentContact: parentContact || null });

        // Optionally create a User account for the student if password supplied
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({ name, email: `${newStudent.id}@students.local`, password: hashedPassword, role: 'student' });
        }

        await auditService.logAction({
          userId: req.user?.id || null,
          action: 'CREATE_STUDENT',
          entity: 'Student',
          entityId: newStudent.id,
          changes: newStudent.toJSON(),
          ipAddress: req.ip,
        });

        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Server error while adding student', details: error.message });
    }
};

// List students
const listStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Server error while fetching students' });
    }
};

// Get student by id
const getStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Server error while fetching student' });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const student = await Student.findByPk(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const before = student.toJSON();
        await student.update(updates);
        const after = student.toJSON();

        await auditService.logAction({
          userId: req.user?.id || null,
          action: 'UPDATE_STUDENT',
          entity: 'Student',
          entityId: student.id,
          changes: auditService.buildChanges(before, after),
          ipAddress: req.ip,
        });

        res.json({ message: 'Student updated', student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Server error while updating student' });
    }
};

// Delete student (soft-delete by removing row)
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const studentId = student.id;
        await student.destroy();

        await auditService.logAction({
          userId: req.user?.id || null,
          action: 'DELETE_STUDENT',
          entity: 'Student',
          entityId: studentId,
          changes: { deleted: true },
          ipAddress: req.ip,
        });

        res.json({ message: 'Student removed' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Server error while deleting student' });
    }
};

module.exports = {
    addFaculty,
    listFaculties,
    getFaculty,
    updateFaculty,
    deleteFaculty,
    addStudent,
    listStudents,
    getStudent,
    updateStudent,
    deleteStudent,
};