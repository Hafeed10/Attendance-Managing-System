import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Faculty.css';

const API_BASE = 'http://localhost:5001/api';

function Faculty() {
  // Navigation and Core Data State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tempAccess, setTempAccess] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  
  // App Loading & Error States
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Tab 2: Mark Attendance State
  const [markClassId, setMarkClassId] = useState('');
  const [markSubjectId, setMarkSubjectId] = useState('');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStudents, setMarkStudents] = useState([]);
  const [markAttendance, setMarkAttendance] = useState({});
  const [submittingMark, setSubmittingMark] = useState(false);
  const [markSuccess, setMarkSuccess] = useState(null);
  const [markError, setMarkError] = useState(null);

  // Tab 3: Past Logs & Editing State
  const [logFilterClass, setLogFilterClass] = useState('');
  const [logFilterDate, setLogFilterDate] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState({});
  const [updatingSession, setUpdatingSession] = useState(false);
  const [editSuccess, setEditSuccess] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Tab 4: Student Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentStats, setStudentStats] = useState(null);
  const [loadingStudentStats, setLoadingStudentStats] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Tab 5: Reports State
  const [reportFilterClass, setReportFilterClass] = useState('');
  const [simulatedWarningId, setSimulatedWarningId] = useState(null);
  const [simulatedExporting, setSimulatedExporting] = useState(false);

  // ----------------------------------------------------
  // DATA FETCHING & INITIALIZATION
  // ----------------------------------------------------

  const loadInitialData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // 1. Fetch Faculty Profile
      const profileRes = await axios.get(`${API_BASE}/faculty/profile`);
      setProfile(profileRes.data);

      if (profileRes.data.assignedClasses && profileRes.data.assignedClasses.length > 0) {
        const firstClass = profileRes.data.assignedClasses[0];
        setMarkClassId(firstClass.classId);
        setMarkSubjectId(firstClass.subjectId);
      }

      // 2. Fetch Classes and Subjects
      const classesRes = await axios.get(`${API_BASE}/classes`);
      setClasses(classesRes.data);
      const subjectsRes = await axios.get(`${API_BASE}/subjects`);
      setSubjects(subjectsRes.data);

      // 3. Fetch Sessions
      const sessionsRes = await axios.get(`${API_BASE}/attendance/sessions`);
      setSessions(sessionsRes.data);

      // 4. Fetch Temp Access
      const tempRes = await axios.get(`${API_BASE}/temp-access/active`);
      setTempAccess(tempRes.data);

      // 5. Fetch Defaulters
      const defaultersRes = await axios.get(`${API_BASE}/reports/defaulters`);
      setDefaulters(defaultersRes.data);

      // 6. Fetch all students across all assigned classes
      if (profileRes.data.assignedClasses) {
        const studentsList = [];
        for (const c of profileRes.data.assignedClasses) {
          const res = await axios.get(`${API_BASE}/students/class/${c.classId}`);
          studentsList.push(...res.data);
        }
        // De-duplicate if any student belongs to multiple classes
        const uniqueStudents = Array.from(new Map(studentsList.map(s => [s.id, s])).values());
        setAllStudents(uniqueStudents);
      }
    } catch (err) {
      console.error("Error fetching data from API:", err);
      setApiError("Failed to connect to the backend server. Please verify the Express backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync Subject selection with Class selection in Mark Attendance Tab
  useEffect(() => {
    if (profile && markClassId) {
      const assigned = profile.assignedClasses.find(c => c.classId === markClassId);
      if (assigned) {
        setMarkSubjectId(assigned.subjectId);
      }
    }
  }, [markClassId, profile]);

  // Load students when Mark Class changes
  useEffect(() => {
    if (markClassId) {
      const fetchClassStudents = async () => {
        try {
          const res = await axios.get(`${API_BASE}/students/class/${markClassId}`);
          setMarkStudents(res.data);
          // Initialize attendance to all "present"
          const initialAtt = {};
          res.data.forEach(s => {
            initialAtt[s.id] = 'present';
          });
          setMarkAttendance(initialAtt);
          setMarkSuccess(null);
          setMarkError(null);
        } catch (err) {
          console.error(err);
        }
      };
      fetchClassStudents();
    }
  }, [markClassId]);

  // Load stats when student is selected
  useEffect(() => {
    if (selectedStudentId) {
      const fetchStudentStats = async () => {
        setLoadingStudentStats(true);
        try {
          const res = await axios.get(`${API_BASE}/students/dashboard/${selectedStudentId}`);
          setStudentStats(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingStudentStats(false);
        }
      };
      fetchStudentStats();
    } else {
      setStudentStats(null);
    }
  }, [selectedStudentId]);

  // Refresh data functions
  const refreshSessionsAndDefaulters = async () => {
    try {
      const sRes = await axios.get(`${API_BASE}/attendance/sessions`);
      setSessions(sRes.data);
      const dRes = await axios.get(`${API_BASE}/reports/defaulters`);
      setDefaulters(dRes.data);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  // ----------------------------------------------------
  // INTERACTIVE ACTIONS & EVENTS
  // ----------------------------------------------------

  // Mark Attendance toggling
  const handleToggleMark = (studentId, status) => {
    setMarkAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Bulk selectors
  const handleMarkAll = (status) => {
    const updated = {};
    markStudents.forEach(s => {
      updated[s.id] = status;
    });
    setMarkAttendance(updated);
  };

  // Submit new attendance session
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setSubmittingMark(true);
    setMarkSuccess(null);
    setMarkError(null);

    try {
      await axios.post(`${API_BASE}/attendance/submit`, {
        date: markDate,
        classId: markClassId,
        subjectId: markSubjectId,
        attendance: markAttendance
      });

      setMarkSuccess("Attendance saved successfully!");
      refreshSessionsAndDefaulters();
      
      // Auto-dismiss success notification
      setTimeout(() => {
        setMarkSuccess(null);
      }, 5000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setMarkError(err.response.data.error);
      } else {
        setMarkError("Failed to submit attendance sheet. Please make sure data is correct.");
      }
    } finally {
      setSubmittingMark(false);
    }
  };

  // Setup edit mode for past session
  const handleStartEdit = (session) => {
    setEditingSession(session);
    setEditingAttendance({ ...session.attendance });
    setEditSuccess(null);
  };

  const handleToggleEdit = (studentId, status) => {
    setEditingAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveEdit = async () => {
    setUpdatingSession(true);
    setEditSuccess(null);
    try {
      await axios.put(`${API_BASE}/attendance/update/${editingSession.id}`, {
        attendance: editingAttendance
      });
      setEditSuccess("Changes saved successfully!");
      setEditingSession(null);
      refreshSessionsAndDefaulters();

      setTimeout(() => setEditSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSession(false);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to delete this attendance session? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/attendance/delete/${sessionId}`);
        setDeleteSuccess("Session deleted successfully.");
        refreshSessionsAndDefaulters();
        setTimeout(() => setDeleteSuccess(null), 4000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Simulated reports and warnings
  const handleSimulateWarning = (studentId) => {
    setSimulatedWarningId(studentId);
    setTimeout(() => {
      setSimulatedWarningId(null);
      alert(`Warning email and SMS alert sent to Ryan Kade's parents regarding attendance!`);
    }, 1000);
  };

  const handleSimulateExport = () => {
    setSimulatedExporting(true);
    setTimeout(() => {
      setSimulatedExporting(false);
      alert("Attendance Report (PDF format) exported successfully! Downloading file...");
    }, 1200);
  };

  // Helper: Overall Average Attendance calculation
  const calculateOverallAverage = () => {
    if (sessions.length === 0) return 0;
    const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);
    const totalCount = sessions.reduce((sum, s) => sum + s.totalCount, 0);
    return totalCount > 0 ? Math.round((totalPresent / totalCount) * 100) : 0;
  };

  // Filters for session history logs
  const filteredSessions = sessions.filter(s => {
    const matchesClass = logFilterClass ? s.classId === logFilterClass : true;
    const matchesDate = logFilterDate ? s.date === logFilterDate : true;
    return matchesClass && matchesDate;
  });

  // Filters for defaulters list
  const filteredDefaulters = defaulters.filter(d => {
    return reportFilterClass ? d.classId === reportFilterClass : true;
  });

  // Student Search filter
  const filteredStudentsSearch = allStudents.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-slate-700">Loading EduTrack Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-page min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* ----------------------------------------------------
          GLOBAL HEADER & PROFILE INFO
          ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">school</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                EduTrack <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Faculty</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Attendance & Student Analytics Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0">
            {profile && (
              <div className="flex items-center gap-3 text-right">
                <div className="hidden sm:block">
                  <h4 className="text-sm font-bold text-slate-800">{profile.name}</h4>
                  <p className="text-xs text-slate-500">{profile.email} · {profile.id}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-white">
                  {profile.name.charAt(6) || 'SJ'}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* API Connection Error Banner */}
      {apiError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-rose-600 text-2xl">error</span>
            <div>
              <h4 className="font-bold text-sm">Server Connection Issue</h4>
              <p className="text-xs text-rose-700 mt-0.5">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        
        {/* Active Temporary Access Banner */}
        {tempAccess && tempAccess.some(t => t.status === 'active') && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-400">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="bg-white/20 p-2 rounded-xl flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-2xl text-white">lock_open</span>
              </div>
              <div>
                <span className="inline-block bg-amber-400 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mb-1">
                  Active Temp Access
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  Assigned Subject: {tempAccess.find(t => t.status === 'active').subjectName} ({tempAccess.find(t => t.status === 'active').className})
                </h3>
                <p className="text-xs text-amber-100">
                  You have temporary permission to record attendance for this external class.
                </p>
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center justify-center border border-white/10 self-start md:self-auto gap-2">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-bold text-xs">Expires in: {tempAccess.find(t => t.status === 'active').timeRemaining}</span>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            PORTAL SUMMARY METRICS BAR
            ---------------------------------------------------- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Metrics 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Classes</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{profile?.assignedClasses?.length || 0}</h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <span>{classes.length} mapped subjects</span>
              </p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl">
              <span className="material-symbols-outlined text-3xl font-bold">calendar_today</span>
            </div>
          </div>

          {/* Metrics 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Attendance Rate</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{calculateOverallAverage()}%</h3>
              <div className="mt-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${calculateOverallAverage() >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${calculateOverallAverage()}%` }}
                />
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${calculateOverallAverage() >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <span className="material-symbols-outlined text-3xl font-bold">trending_up</span>
            </div>
          </div>

          {/* Metrics 3 - Defaulters Warning Card */}
          <div 
            onClick={() => { setActiveTab('reports'); setReportFilterClass(''); }}
            className={`cursor-pointer bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md ${
              defaulters.length > 0 ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200/80'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Defaulters</p>
              <h3 className={`text-3xl font-extrabold mt-2 ${defaulters.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {defaulters.length}
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-pulse">
                {defaulters.length > 0 ? '⚠️ Action Required: <80%' : 'All students safe'}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${defaulters.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <span className="material-symbols-outlined text-3xl font-bold">warning</span>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            PORTAL TABS NAVIGATION
            ---------------------------------------------------- */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Overview
          </button>
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'mark'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">history</span>
            Attendance Logs
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'search'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">person_search</span>
            Student Dashboards
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">analytics</span>
            Defaulters & Reports
          </button>
        </div>

        {/* ----------------------------------------------------
            TAB CONTENT 1: DASHBOARD
            ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Defaulter Notification Banner */}
            {defaulters.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600 flex items-center justify-center self-start">
                    <span className="material-symbols-outlined text-2xl font-bold">notifications_active</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Attendance Defaulter Warning Alert</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                      There are currently <strong>{defaulters.length} students</strong> with overall attendance below the <strong>80% threshold</strong>. Take instant action to review logs or send caution notices.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveTab('reports'); setReportFilterClass(''); }}
                  className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md shadow-rose-100 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                  View Defaulters
                </button>
              </div>
            )}

            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Faculty Hub Quick Operations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <button
                  onClick={() => setActiveTab('mark')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50 hover:bg-indigo-50/30 text-left transition-all duration-300 group"
                >
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Mark Attendance</h4>
                    <p className="text-xs text-slate-500">Record a new class sheet</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-violet-200 bg-slate-50 hover:bg-violet-50/30 text-left transition-all duration-300 group"
                >
                  <div className="bg-violet-100 text-violet-700 p-2 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Modify Logs</h4>
                    <p className="text-xs text-slate-500">Edit or delete past session sheets</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-cyan-200 bg-slate-50 hover:bg-cyan-50/30 text-left transition-all duration-300 group"
                >
                  <div className="bg-cyan-100 text-cyan-700 p-2 rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">donut_large</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Search Students</h4>
                    <p className="text-xs text-slate-500">Check analytics and monthly grids</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Welcoming Details & Class Schedules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Your Scheduled Subjects</h3>
                  <p className="text-xs text-slate-500 mt-1">Active class slots assigned for {profile?.name}</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {profile?.assignedClasses?.map(c => {
                    const classSess = sessions.filter(s => s.classId === c.classId);
                    const avg = classSess.length > 0 
                      ? Math.round((classSess.reduce((acc, s) => acc + s.presentCount, 0) / classSess.reduce((acc, s) => acc + s.totalCount, 0)) * 100) 
                      : 0;

                    return (
                      <div key={c.classId} className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 first:pt-0 last:pb-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
                              {c.classId}
                            </span>
                            <span className="text-slate-500 text-xs font-semibold">{c.time} · {c.room}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-800 mt-1">{c.subjectName}</h4>
                        </div>
                        
                        <div className="flex items-center gap-5">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-medium block">Avg Attendance</span>
                            <span className={`text-sm font-bold ${avg >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>{avg}%</span>
                          </div>
                          <button
                            onClick={() => { setMarkClassId(c.classId); setActiveTab('mark'); }}
                            className="px-4 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs transition"
                          >
                            Mark Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Recent Log Activity Feed */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recent Logs Feed</h3>
                  <p className="text-xs text-slate-500 mt-1">Last 4 sheets successfully logged</p>
                </div>

                <div className="space-y-4">
                  {sessions.slice(0, 4).map(s => {
                    const percentage = Math.round((s.presentCount / s.totalCount) * 100);
                    return (
                      <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition flex justify-between items-center gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 truncate">{s.subjectName}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full font-bold">{s.classId}</span>
                            <span>{s.date}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-extrabold block ${percentage >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {s.presentCount}/{s.totalCount} Present
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}

                  {sessions.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No logs taken yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB CONTENT 2: MARK ATTENDANCE
            ---------------------------------------------------- */}
        {activeTab === 'mark' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Date-Wise Attendance Checklist</h3>
                <p className="text-xs text-slate-500 mt-1">Select class, date, and toggle students present status.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitAttendance} className="p-5 sm:p-6 space-y-6">
              {/* Selectors grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Slot</label>
                  <select
                    value={markClassId}
                    onChange={(e) => setMarkClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {profile?.assignedClasses?.map(c => (
                      <option key={c.classId} value={c.classId}>{c.classId} - {c.subjectName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject (Locked)</label>
                  <input
                    type="text"
                    disabled
                    value={subjects.find(s => s.id === markSubjectId)?.name || 'Loading...'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attendance Date</label>
                  <input
                    type="date"
                    required
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Status Messages */}
              {markSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-3.5 flex gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span className="font-semibold">{markSuccess}</span>
                </div>
              )}

              {markError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5 flex gap-2">
                  <span className="material-symbols-outlined text-rose-600">error</span>
                  <span className="font-semibold">{markError}</span>
                </div>
              )}

              {/* Students Checkbox Table */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="p-4">Student ID</th>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Contact Email</th>
                        <th className="p-4 text-center">Status Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                      {markStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-semibold text-xs tracking-wider text-slate-400">{s.id}</td>
                          <td className="p-4 font-bold text-slate-900">{s.name}</td>
                          <td className="p-4 text-slate-500">{s.email}</td>
                          <td className="p-4 flex justify-center">
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => handleToggleMark(s.id, 'present')}
                                className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                  markAttendance[s.id] === 'present'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleMark(s.id, 'absent')}
                                className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                  markAttendance[s.id] === 'absent'
                                    ? 'bg-rose-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {markStudents.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-slate-400">Loading class student checklist...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submittingMark || markStudents.length === 0}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition"
                >
                  {submittingMark ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Attendance...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm font-bold">save</span>
                      Submit Attendance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB CONTENT 3: PAST ATTENDANCE LOGS
            ---------------------------------------------------- */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Logs Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-700 flex items-center justify-center">
                  <span className="material-symbols-outlined font-bold">filter_alt</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 font-sans">Filter Attendance History</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Browse and modify previous class sessions</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={logFilterClass}
                  onChange={(e) => setLogFilterClass(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.id}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={logFilterDate}
                  onChange={(e) => setLogFilterDate(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
                {(logFilterClass || logFilterDate) && (
                  <button
                    onClick={() => { setLogFilterClass(''); setLogFilterDate(''); }}
                    className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Notification triggers */}
            {editSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-3.5 flex gap-2">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span className="font-semibold">{editSuccess}</span>
              </div>
            )}
            {deleteSuccess && (
              <div className="bg-slate-100 border border-slate-300 text-slate-800 text-sm rounded-xl p-3.5 flex gap-2">
                <span className="material-symbols-outlined text-slate-600">info</span>
                <span className="font-semibold">{deleteSuccess}</span>
              </div>
            )}

            {/* Main Logs listing / Session details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Logs List Pane (Left 2 columns) */}
              <div className="lg:col-span-2 space-y-4">
                {filteredSessions.map(s => {
                  const percentage = Math.round((s.presentCount / s.totalCount) * 100);
                  const isCurrentEditing = editingSession?.id === s.id;

                  return (
                    <div 
                      key={s.id} 
                      className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col sm:flex-row justify-between gap-4 ${
                        isCurrentEditing ? 'border-indigo-500 ring-2 ring-indigo-50/50' : 'border-slate-200/80'
                      }`}
                    >
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                            {s.classId}
                          </span>
                          <span className="text-xs font-extrabold text-slate-400">{s.date}</span>
                          <span className="text-xs text-slate-400 font-medium">Session ID: {s.id}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-800">{s.subjectName}</h4>
                        
                        {/* Interactive mini progress bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                            <span>Attendance Ratio</span>
                            <span>{s.presentCount}/{s.totalCount} present ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full max-w-sm">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentage >= 80 ? 'bg-emerald-500' : percentage >= 70 ? 'bg-amber-400' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="px-4 py-2.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">edit</span>
                          Edit Session
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          className="px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredSessions.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">history_toggle_off</span>
                    <p className="font-bold text-sm">No attendance logs found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting class slot or calendar date filter.</p>
                  </div>
                )}
              </div>

              {/* Editing Panel (Right Sidebar) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm self-start space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Modify Sheet Records</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Edit individual student presence status</p>
                </div>

                {editingSession ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 text-xs">
                      <p className="font-bold text-indigo-950">Editing Log: {editingSession.id}</p>
                      <p className="text-indigo-800 mt-0.5">{editingSession.subjectName} ({editingSession.classId})</p>
                      <p className="text-indigo-500 mt-0.5">Date: {editingSession.date}</p>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                      {students.filter(s => s.classId === editingSession.classId).map(s => (
                        <div key={s.id} className="py-2.5 flex justify-between items-center gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{s.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{s.id}</p>
                          </div>
                          
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border">
                            <button
                              type="button"
                              onClick={() => handleToggleEdit(s.id, 'present')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                editingAttendance[s.id] === 'present'
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleEdit(s.id, 'absent')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                editingAttendance[s.id] === 'absent'
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={handleSaveEdit}
                        disabled={updatingSession}
                        className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex justify-center items-center gap-1"
                      >
                        {updatingSession ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingSession(null)}
                        className="px-3 py-2 border hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Select "Edit Session" from history list to load student checklist here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB CONTENT 4: STUDENT DASHBOARD & ANALYTICS
            ---------------------------------------------------- */}
        {activeTab === 'search' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Elegant Search Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative">
              <div className="max-w-xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Search Assigned Students
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-xl">search</span>
                  <input
                    type="text"
                    placeholder="Type Student ID or Name (e.g. Ryan Kade, ST001)..."
                    value={searchQuery}
                    onFocus={() => setShowSearchDropdown(true)}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                    className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  
                  {/* Clear Button */}
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedStudentId(''); }}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </button>
                  )}
                </div>

                {/* Dropdown with filtered lists */}
                {showSearchDropdown && searchQuery && (
                  <div className="absolute left-5 right-5 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y">
                    {filteredStudentsSearch.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSearchQuery(s.name);
                          setShowSearchDropdown(false);
                        }}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Class: {s.classId} · Email: {s.email}</p>
                        </div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                          {s.id}
                        </span>
                      </div>
                    ))}
                    {filteredStudentsSearch.length === 0 && (
                      <p className="p-4 text-xs text-slate-400 text-center">No student matches</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Student Analytics Dashboard details */}
            {loadingStudentStats ? (
              <div className="bg-white border rounded-2xl p-12 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500">Calculating dashboard statistics...</p>
              </div>
            ) : studentStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Dial Column (Left Column) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between text-center gap-6">
                  <div className="space-y-1">
                    <span className="inline-block bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                      {studentStats.classId}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{studentStats.studentName}</h3>
                    <p className="text-xs text-slate-500">{studentStats.email} · ID: {studentStats.studentId}</p>
                  </div>

                  {/* Circular Dial Indicator */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Grey background circle */}
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="64" 
                        className="stroke-slate-100" 
                        strokeWidth="10" 
                        fill="transparent" 
                      />
                      {/* Dynamic presence circle */}
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="64" 
                        className={studentStats.isDefaulter ? "stroke-rose-500" : "stroke-emerald-500"} 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 64}
                        strokeDashoffset={2 * Math.PI * 64 - (studentStats.overallPercentage / 100) * 2 * Math.PI * 64}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-slate-900">{studentStats.overallPercentage}%</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ATTENDANCE</span>
                    </div>
                  </div>

                  {/* Warning / OK status banner */}
                  <div className="w-full">
                    {studentStats.isDefaulter ? (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs font-bold flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-rose-600 text-sm">warning</span>
                        DEFAULTER: WARNING (&lt;80%)
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-bold flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
                        ATTENDANCE STATUS: EXCELLENT
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject-Wise breakdown & Details (Right 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Subject details card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-base font-bold text-slate-900">Assigned Subject Attendance Ratio</h4>
                    
                    <div className="space-y-4">
                      {studentStats.subjectBreakdown.map(sub => (
                        <div key={sub.subjectId} className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-slate-800">{sub.subjectName} ({sub.subjectId})</span>
                            <span className={sub.percentage < 80 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                              {sub.percentage}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Total Classes Held: {sub.total} sessions</span>
                            <span>Attended: {sub.present} · Missed: {sub.total - sub.present}</span>
                          </div>

                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                sub.percentage < 80 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${sub.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar monthly grid for May 2026 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Attendance Month-wise Calendar View</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Day-by-day mapping for 30 days of May 2026</p>
                    </div>

                    {/* Commit-style calendar grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 pt-2">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `2026-05-${String(dayNum).padStart(2, '0')}`;
                        
                        // Find date record
                        const record = studentStats.history.find(h => h.date === dateStr);
                        const hasClass = !!record;
                        const present = record?.status === 'present';

                        return (
                          <div 
                            key={dayNum}
                            className={`p-2.5 rounded-xl flex flex-col items-center justify-between h-14 border transition relative group cursor-default ${
                              hasClass 
                                ? present 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                  : 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-[9px] font-bold tracking-tight opacity-70">May {dayNum}</span>
                            {hasClass ? (
                              present ? (
                                <span className="material-symbols-outlined text-base font-bold text-emerald-600">check</span>
                              ) : (
                                <span className="material-symbols-outlined text-base font-bold text-rose-600">close</span>
                              )
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400">-</span>
                            )}
                            
                            {/* Visual tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] px-2 py-0.8 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 font-bold">
                              {hasClass ? `${record.subjectName}: ${present ? 'Present' : 'Absent'}` : 'No class scheduled'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">donut_large</span>
                <p className="font-bold text-sm">Select Student to View Analytics</p>
                <p className="text-xs text-slate-500 mt-1">Use the search box above to type a student's name or code.</p>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            TAB CONTENT 5: REPORTS & EXPORTS
            ---------------------------------------------------- */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Defaulter report list card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Attendance Defaulters List (&lt;80%)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Students currently failing to meet academic attendance quotas.</p>
                  </div>
                </div>

                <div className="flex gap-2 self-start sm:self-auto">
                  <select
                    value={reportFilterClass}
                    onChange={(e) => setReportFilterClass(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">All Assigned Slots</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.id}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleSimulateExport}
                    disabled={simulatedExporting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition whitespace-nowrap"
                  >
                    {simulatedExporting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm font-bold">download</span>
                        Export Report
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Class Room</th>
                      <th className="p-4">Contact Email</th>
                      <th className="p-4">Overall %</th>
                      <th className="p-4 text-center">Caution Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {filteredDefaulters.map(d => (
                      <tr key={d.studentId} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-semibold text-xs tracking-wider text-slate-400">{d.studentId}</td>
                        <td className="p-4 font-bold text-slate-900">{d.studentName}</td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            {d.classId}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{d.email}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs">
                            {d.overallPercentage}%
                          </span>
                        </td>
                        <td className="p-4 flex justify-center">
                          <button
                            onClick={() => handleSimulateWarning(d.studentId)}
                            disabled={simulatedWarningId === d.studentId}
                            className="px-3.5 py-1.8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                          >
                            <span className="material-symbols-outlined text-[10px] font-bold">mail</span>
                            {simulatedWarningId === d.studentId ? 'Sending...' : 'Alert Parent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredDefaulters.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">verified</span>
                          <p className="font-bold text-sm">Perfect Attendance! No defaulters found.</p>
                          <p className="text-xs text-slate-500">Every student is meeting or exceeding the 80% quota.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Faculty;
