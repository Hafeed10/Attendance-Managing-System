const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // Allows the API to read data
app.use(cors()); // Allows your frontend team to connect

const SECRET_KEY = "super_secret_attendance_key"; // In production, hide this!

// ----------------------------------------------------
// IN-MEMORY DATABASE & SEED DATA GENERATOR
// ----------------------------------------------------

const facultyProfile = {
  id: "FAC001",
  name: "Prof. Sarah Jenkins",
  email: "sarah.jenkins@school.com",
  phone: "+1 (555) 019-2834",
  assignedClasses: [
    { classId: "CS-112", className: "CS-112", subjectId: "WEB_ENG", subjectName: "Web Engineering", room: "Room 112", time: "11:30 AM" },
    { classId: "CS-113", className: "CS-113", subjectId: "DSA", subjectName: "Data Structures", room: "Lab 204", time: "09:00 AM" },
    { classId: "CS-114", className: "CS-114", subjectId: "DBMS", subjectName: "Database Systems", room: "Room 305", time: "02:00 PM" }
  ]
};

const subjects = [
  { id: "WEB_ENG", name: "Web Engineering" },
  { id: "DSA", name: "Data Structures" },
  { id: "DBMS", name: "Database Systems" }
];

const classes = [
  { id: "CS-112", name: "CS-112" },
  { id: "CS-113", name: "CS-113" },
  { id: "CS-114", name: "CS-114" }
];

const students = [
  { id: "ST001", name: "Ryan Kade", classId: "CS-112", email: "ryan.kade@school.com" },
  { id: "ST002", name: "Alice Smith", classId: "CS-112", email: "alice.smith@school.com" },
  { id: "ST003", name: "Bob Johnson", classId: "CS-112", email: "bob.johnson@school.com" },
  { id: "ST004", name: "Charlie Brown", classId: "CS-112", email: "charlie.brown@school.com" },
  { id: "ST005", name: "Diana Prince", classId: "CS-112", email: "diana.prince@school.com" },
  
  { id: "ST006", name: "Evan Wright", classId: "CS-113", email: "evan.wright@school.com" },
  { id: "ST007", name: "Fiona Gallagher", classId: "CS-113", email: "fiona.g@school.com" },
  { id: "ST008", name: "George Green", classId: "CS-113", email: "george.g@school.com" },
  { id: "ST009", name: "Hannah Abbott", classId: "CS-113", email: "hannah.a@school.com" },
  { id: "ST010", name: "Ian Malcolm", classId: "CS-113", email: "ian.m@school.com" },

  { id: "ST011", name: "Julia Roberts", classId: "CS-114", email: "julia.r@school.com" },
  { id: "ST012", name: "Kevin Bacon", classId: "CS-114", email: "kevin.b@school.com" },
  { id: "ST013", name: "Laura Croft", classId: "CS-114", email: "laura.c@school.com" },
  { id: "ST014", name: "Michael Scott", classId: "CS-114", email: "michael.s@school.com" },
  { id: "ST015", name: "Nina Simone", classId: "CS-114", email: "nina.s@school.com" }
];

// Helper: Deterministic hash function for consistent mock data
const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

// Deterministic attendance seed:
// Ryane Kade (ST001), Charlie Brown (ST004), Fiona Gallagher (ST007), Kevin Bacon (ST012) will have lower attendance (<80%)
const isPresentDeterministic = (studentId, dateStr) => {
  const score = hashString(studentId + dateStr) % 100;
  if (["ST001", "ST004", "ST007", "ST012"].includes(studentId)) {
    return score < 72; // ~72% attendance rate (defaulters)
  }
  return score < 92; // ~92% attendance rate (regular students)
};

// Seed 30 days of attendance sessions (May 1st, 2026 to May 30th, 2026)
let attendanceSessions = [];

const seedMockData = () => {
  const startDate = new Date("2026-05-01");
  const endDate = new Date("2026-05-30");
  let sessionIdCounter = 1;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0: Sunday, 1: Monday, ... 6: Saturday
    // Let's take classes on Mon (1), Wed (3), Fri (5)
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      const dateStr = d.toISOString().split('T')[0];

      facultyProfile.assignedClasses.forEach(c => {
        const classStudents = students.filter(s => s.classId === c.classId);
        const attendance = {};
        let presentCount = 0;

        classStudents.forEach(s => {
          const present = isPresentDeterministic(s.id, dateStr);
          attendance[s.id] = present ? "present" : "absent";
          if (present) presentCount++;
        });

        attendanceSessions.push({
          id: `SESS-${String(sessionIdCounter++).padStart(3, '0')}`,
          date: dateStr,
          classId: c.classId,
          className: c.className,
          subjectId: c.subjectId,
          subjectName: c.subjectName,
          attendance: attendance,
          presentCount: presentCount,
          totalCount: classStudents.length
        });
      });
    }
  }
  // Sort sessions descending by date
  attendanceSessions.sort((a, b) => b.date.localeCompare(a.date));
};

seedMockData();

// Mock Temporary Access details
let tempAccessData = [
  { id: "TEMP001", classId: "CS-115", className: "CS-115", subjectId: "SWE", subjectName: "Software Engineering", status: "active", timeRemaining: "45 mins" },
  { id: "TEMP002", classId: "CS-116", className: "CS-116", subjectId: "AI", subjectName: "Artificial Intelligence", status: "expired", timeRemaining: "Expired 2 days ago" }
];

// Helper: Calculate attendance stats for a student
const calculateStudentStats = (studentId) => {
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const studentSessions = attendanceSessions.filter(s => s.classId === student.classId);
  const total = studentSessions.length;
  let present = 0;
  const history = [];

  studentSessions.forEach(s => {
    const status = s.attendance[studentId] || "absent";
    if (status === "present") present++;
    history.push({
      date: s.date,
      status: status,
      subjectName: s.subjectName
    });
  });

  const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
  
  // Create subject breakdowns
  const subjectBreakdown = [
    {
      subjectId: facultyProfile.assignedClasses.find(c => c.classId === student.classId)?.subjectId || "SUBJ",
      subjectName: facultyProfile.assignedClasses.find(c => c.classId === student.classId)?.subjectName || "Subject",
      present: present,
      total: total,
      percentage: percentage
    }
  ];

  return {
    studentId: student.id,
    studentName: student.name,
    classId: student.classId,
    email: student.email,
    overallPercentage: percentage,
    totalSessions: total,
    presentSessions: present,
    absentSessions: total - present,
    isDefaulter: percentage < 80,
    subjectBreakdown: subjectBreakdown,
    history: history.sort((a, b) => b.date.localeCompare(a.date))
  };
};


// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Get Faculty Profile
app.get('/api/faculty/profile', (req, res) => {
  res.json(facultyProfile);
});

// 2. Get Available Subjects
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

// 3. Get Available Classes
app.get('/api/classes', (req, res) => {
  res.json(classes);
});

// 4. Get Students by Class
app.get('/api/students/class/:classId', (req, res) => {
  const { classId } = req.params;
  const filtered = students.filter(s => s.classId === classId);
  res.json(filtered);
});

// 5. Get Attendance History
app.get('/api/attendance/sessions', (req, res) => {
  res.json(attendanceSessions);
});

// 6. Submit New Attendance Sheet
app.post('/api/attendance/submit', (req, res) => {
  const { date, classId, subjectId, attendance } = req.body;

  if (!date || !classId || !subjectId || !attendance) {
    return res.status(400).json({ error: "Missing required fields: date, classId, subjectId, attendance" });
  }

  // Find class details
  const cls = facultyProfile.assignedClasses.find(c => c.classId === classId);
  if (!cls) {
    return res.status(404).json({ error: "Class not assigned to this faculty member" });
  }

  // Double check if session for this date, class, and subject already exists
  const existingSession = attendanceSessions.find(s => s.date === date && s.classId === classId && s.subjectId === subjectId);
  if (existingSession) {
    return res.status(409).json({ error: "Attendance sheet already exists for this date, class, and subject" });
  }

  const classStudents = students.filter(s => s.classId === classId);
  let presentCount = 0;

  // Set default absent for students not specified, and sanitize inputs
  const finalAttendance = {};
  classStudents.forEach(s => {
    const status = attendance[s.id] || "absent";
    finalAttendance[s.id] = status;
    if (status === "present") presentCount++;
  });

  const newSession = {
    id: `SESS-${Date.now()}`,
    date: date,
    classId: classId,
    className: cls.className,
    subjectId: subjectId,
    subjectName: cls.subjectName,
    attendance: finalAttendance,
    presentCount: presentCount,
    totalCount: classStudents.length
  };

  attendanceSessions.unshift(newSession); // Add to beginning
  res.status(201).json({ message: "Attendance submitted successfully", session: newSession });
});

// 7. Update Attendance Session
app.put('/api/attendance/update/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { attendance } = req.body;

  if (!attendance) {
    return res.status(400).json({ error: "Missing required field: attendance" });
  }

  const session = attendanceSessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: "Attendance session not found" });
  }

  const classStudents = students.filter(s => s.classId === session.classId);
  let presentCount = 0;

  classStudents.forEach(s => {
    if (attendance[s.id] !== undefined) {
      session.attendance[s.id] = attendance[s.id];
    }
    if (session.attendance[s.id] === "present") {
      presentCount++;
    }
  });

  session.presentCount = presentCount;

  res.json({ message: "Attendance session updated successfully", session });
});

// 8. Delete Attendance Session
app.delete('/api/attendance/delete/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const index = attendanceSessions.findIndex(s => s.id === sessionId);

  if (index === -1) {
    return res.status(404).json({ error: "Attendance session not found" });
  }

  attendanceSessions.splice(index, 1);
  res.json({ message: "Attendance session deleted successfully" });
});

// 9. Single Student Dashboard
app.get('/api/students/dashboard/:studentId', (req, res) => {
  const { studentId } = req.params;
  const stats = calculateStudentStats(studentId);

  if (!stats) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(stats);
});

// 10. Temporary Access active / expired
app.get('/api/temp-access/active', (req, res) => {
  res.json(tempAccessData);
});

// 11. Defaulters Report
app.get('/api/reports/defaulters', (req, res) => {
  const defaulters = [];
  
  students.forEach(s => {
    const stats = calculateStudentStats(s.id);
    if (stats && stats.isDefaulter) {
      defaulters.push({
        studentId: s.id,
        studentName: s.name,
        classId: s.classId,
        email: s.email,
        overallPercentage: stats.overallPercentage
      });
    }
  });

  res.json(defaulters);
});


// Legacy Login API Route (kept for backwards compatibility)
const usersDatabase = [
    { email: "admin@school.com", password: "password123", role: "admin" },
    { email: "teacher@school.com", password: "password123", role: "faculty" },
    { email: "parent@home.com", password: "password123", role: "parent" }
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersDatabase.find(u => u.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
        { email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '8h' }
    );
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