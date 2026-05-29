const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Faculty = require('./Faculty');
const Student = require('./Student');
const Class = require('./Class');
const Subject = require('./Subject');
const Attendance = require('./Attendance');
const AttendanceReport = require('./AttendanceReport');
const TemporaryAccess = require('./TemporaryAccess');
const AuditLog = require('./AuditLog');

// ─── Relationships ───────────────────────────────────────────────

// User <-> Faculty (1:1)
User.hasOne(Faculty, { foreignKey: 'userId', onDelete: 'CASCADE' });
Faculty.belongsTo(User, { foreignKey: 'userId' });

// User <-> Student (1:1) — enables student login (PRD 6.1)
User.hasOne(Student, { foreignKey: 'userId', onDelete: 'SET NULL' });
Student.belongsTo(User, { foreignKey: 'userId' });

// Class <-> Subject (1:Many)
Class.hasMany(Subject, { foreignKey: 'classId', onDelete: 'CASCADE' });
Subject.belongsTo(Class, { foreignKey: 'classId' });

// Class <-> Student (1:Many)
Class.hasMany(Student, { foreignKey: 'classId', onDelete: 'SET NULL' });
Student.belongsTo(Class, { foreignKey: 'classId' });

// Student <-> Attendance (1:Many)
Student.hasMany(Attendance, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

// Subject <-> Attendance (1:Many)
Subject.hasMany(Attendance, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
Attendance.belongsTo(Subject, { foreignKey: 'subjectId' });

// Faculty <-> Attendance (1:Many) — who marked it
Faculty.hasMany(Attendance, { foreignKey: 'facultyId', onDelete: 'CASCADE' });
Attendance.belongsTo(Faculty, { foreignKey: 'facultyId' });

// Class <-> Attendance (1:Many)
Class.hasMany(Attendance, { foreignKey: 'classId', onDelete: 'CASCADE' });
Attendance.belongsTo(Class, { foreignKey: 'classId' });

// User <-> AttendanceReport (1:Many) — who generated it
User.hasMany(AttendanceReport, { foreignKey: 'generatedBy', onDelete: 'CASCADE' });
AttendanceReport.belongsTo(User, { foreignKey: 'generatedBy' });

// TemporaryAccess relationships
Faculty.hasMany(TemporaryAccess, { as: 'OriginalAccess', foreignKey: 'originalFacultyId' });
Faculty.hasMany(TemporaryAccess, { as: 'ReplacementAccess', foreignKey: 'replacementFacultyId' });
TemporaryAccess.belongsTo(Faculty, { as: 'OriginalFaculty', foreignKey: 'originalFacultyId' });
TemporaryAccess.belongsTo(Faculty, { as: 'ReplacementFaculty', foreignKey: 'replacementFacultyId' });
TemporaryAccess.belongsTo(Class, { foreignKey: 'classId' });
TemporaryAccess.belongsTo(Subject, { foreignKey: 'subjectId' });

// User <-> AuditLog (1:Many)
User.hasMany(AuditLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Faculty,
  Student,
  Class,
  Subject,
  Attendance,
  AttendanceReport,
  TemporaryAccess,
  AuditLog,
};
