import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [facultyName, setFacultyName] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyDept, setFacultyDept] = useState('Computer Science');
  const [isRegistering, setIsRegistering] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  // Set the target heights for the weekly bar chart
  const barHeights = {
    mon: 'h-48',  // ~192px
    tue: 'h-56',  // ~224px
    wed: 'h-52',  // ~208px
    thu: 'h-60',  // ~240px
    fri: 'h-64'   // ~256px
  };

  useEffect(() => {
    // Add specific body styling classes on mount
    const bodyClasses = ['pb-24'];
    bodyClasses.forEach((cls) => document.body.classList.add(cls));

    // Trigger chart loading animation shortly after mount
    const timer = setTimeout(() => {
      setChartLoaded(true);
    }, 150);

    return () => {
      bodyClasses.forEach((cls) => document.body.classList.remove(cls));
      clearTimeout(timer);
    };
  }, []);

  const handleRegisterFacultySubmit = (e) => {
    e.preventDefault();
    setIsRegistering(true);

    setTimeout(() => {
      setIsRegistering(false);
      alert(`Faculty member "${facultyName}" successfully registered to ${facultyDept} department!`);
      // Reset form & close modal
      setFacultyName('');
      setFacultyEmail('');
      setFacultyDept('Computer Science');
      setShowRegisterModal(false);
    }, 1200);
  };

  const handleQuickAction = (actionName) => {
    alert(`Success: "${actionName}" trigger activated successfully.`);
  };

  return (
    <>
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 w-full glass-card border-b-0">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 active:scale-95 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined text-primary font-headline-md text-headline-md" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">EduTrack</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-6">
              <span className="font-label-md text-label-md text-primary cursor-pointer transition-colors">Dashboard</span>
              <span className="font-label-md text-label-md text-on-surface-variant hover:text-primary cursor-pointer transition-colors" onClick={() => handleQuickAction('Academic Logs View')}>Academic Logs</span>
              <span className="font-label-md text-label-md text-on-surface-variant hover:text-primary cursor-pointer transition-colors" onClick={() => handleQuickAction('Configuration Panel')}>Configuration</span>
            </div>

            <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors active:scale-90 relative" onClick={() => alert('No new notifications')}>
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>

            {/* Profile Dropdown Container */}
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant relative">
              <div className="text-right hidden sm:block">
                <p className="font-label-md text-label-md text-on-surface">Admin Portal</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Principal View</p>
              </div>

              <button 
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container hover:scale-105 active:scale-95 transition-all outline-none"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img 
                  alt="Admin Profile" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlPZor56Fw6G_Z0n0XCzIg_aRBUctqy4Xf42z1dtwyGChatxChIOEJo222O3ohU15lu1iFIcQJyhmV_pfa0UEUkVxOe3iJMkoJc3Eq8xDfDIB-C8KSWFhY3sm_CtY9oxBZiVrcE7FX0kcmeCcCTYiPDL6q5mGL-_VXeLr-V2WOhv4A7WGpxJ_GDVbrPEiLMLtvT8Kk34UrdtBlt-CwGhjGmRQ7sdyF9WaGanTfjB3NFy5Q4j6MotJeUWJ3esTPi1YhWTQ16Ew9x3Y"
                />
              </button>

              {/* Profile Context Popover Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-outline-variant/10">
                    <p className="font-label-md text-label-md text-on-surface">Dr. Sarah Stone</p>
                    <p className="text-[11px] text-on-surface-variant">Principal</p>
                  </div>
                  <button 
                    className="w-full text-left px-3 py-2 rounded-xl text-[14px] text-on-surface hover:bg-primary-container/10 hover:text-primary transition-colors flex items-center gap-2 mt-1"
                    onClick={() => handleQuickAction('Settings Panel')}
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    <span>Account Settings</span>
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 rounded-xl text-[14px] text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/login');
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop mt-8 space-y-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Main Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Real-time academic performance and attendance oversight.</p>
          </div>
          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
              onClick={() => setShowRegisterModal(true)}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Register Faculty</span>
            </button>
          </div>
        </section>

        {/* Top KPI Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Students */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-primary-container/10 text-primary">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface-variant">Total Students</p>
                <p className="font-headline-md text-headline-md text-on-surface">1,245</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-[12px] font-bold text-emerald-600">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>+2.4% vs last month</span>
            </div>
          </div>

          {/* Card 2: Total Faculty */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-secondary-container/10 text-secondary">
                <span className="material-symbols-outlined">record_voice_over</span>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface-variant">Total Faculty</p>
                <p className="font-headline-md text-headline-md text-on-surface">84</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-[12px] font-bold text-on-surface-variant">
              <span>Full capacity</span>
            </div>
          </div>

          {/* Card 3: Today's Overall Attendance */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-tertiary-container/10 text-tertiary">
                <span className="material-symbols-outlined">how_to_reg</span>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface-variant">Today's Attendance</p>
                <p className="font-headline-md text-headline-md text-on-surface">92%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-[12px] font-bold text-emerald-600">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>Above avg (88%)</span>
            </div>
          </div>

          {/* Card 4: Total Defaulters */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-error-container/20 text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface-variant">Total Defaulters</p>
                <p className="font-headline-md text-headline-md text-error">45</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-[12px] font-bold text-on-surface-variant">
              <span>Students below 80%</span>
            </div>
          </div>
        </section>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Daily Attendance Summary Chart */}
          <section className="space-y-4">
            <div className="glass-card rounded-xl p-8 h-full">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Daily Attendance Summary</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Weekly trend analysis (Mon - Fri)</p>
                </div>
              </div>

              {/* Responsive Simulated Bar Chart with load animation */}
              <div className="relative h-[300px] w-full flex items-end justify-between px-6 pb-10 border-b border-outline-variant/30">
                <div className="flex flex-col items-center gap-3 group cursor-pointer w-1/5">
                  <div 
                    className={`w-full max-w-[40px] bg-primary/20 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-primary/45 ${chartLoaded ? barHeights.mon : 'h-0 opacity-0'}`}
                  ></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Mon</span>
                </div>

                <div className="flex flex-col items-center gap-3 group cursor-pointer w-1/5">
                  <div 
                    className={`w-full max-w-[40px] bg-primary/20 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-primary/45 ${chartLoaded ? barHeights.tue : 'h-0 opacity-0'}`}
                    style={{ transitionDelay: '75ms' }}
                  ></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Tue</span>
                </div>

                <div className="flex flex-col items-center gap-3 group cursor-pointer w-1/5">
                  <div 
                    className={`w-full max-w-[40px] bg-primary/20 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-primary/45 ${chartLoaded ? barHeights.wed : 'h-0 opacity-0'}`}
                    style={{ transitionDelay: '150ms' }}
                  ></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Wed</span>
                </div>

                <div className="flex flex-col items-center gap-3 group cursor-pointer w-1/5">
                  <div 
                    className={`w-full max-w-[40px] bg-primary/20 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-primary/45 ${chartLoaded ? barHeights.thu : 'h-0 opacity-0'}`}
                    style={{ transitionDelay: '225ms' }}
                  ></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Thu</span>
                </div>

                <div className="flex flex-col items-center gap-3 group cursor-pointer w-1/5">
                  <div 
                    className={`w-full max-w-[40px] mesh-bg rounded-t-lg shadow-lg shadow-primary/20 transition-all duration-1000 ease-out ${chartLoaded ? barHeights.fri : 'h-0 opacity-0'}`}
                    style={{ transitionDelay: '300ms' }}
                  ></div>
                  <span className="font-label-sm text-label-sm text-primary font-bold">Fri</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Recent Defaulters List */}
          <section className="space-y-4">
            <div className="glass-card rounded-xl p-8 h-full flex flex-col">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Recent Defaulters (&lt;80%)</h2>
              <div className="flex-grow space-y-4">
                {/* Student Entry 1 */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/30 cursor-pointer" onClick={() => alert('View details for Alex Murphy')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">AM</div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Alex Murphy</p>
                      <p className="text-[12px] text-on-surface-variant">Year 2, CS Department</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-error">74%</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Current Avg</p>
                  </div>
                </div>

                {/* Student Entry 2 */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/30 cursor-pointer" onClick={() => alert('View details for Sarah Jenkins')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">SJ</div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Sarah Jenkins</p>
                      <p className="text-[12px] text-on-surface-variant">Year 1, Mechanical Eng.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-error">68%</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Current Avg</p>
                  </div>
                </div>

                {/* Student Entry 3 */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/30 cursor-pointer" onClick={() => alert('View details for Ryan Kade')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">RK</div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Ryan Kade</p>
                      <p className="text-[12px] text-on-surface-variant">Year 3, Business Admin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-error">79%</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Current Avg</p>
                  </div>
                </div>
              </div>

              <button 
                className="w-full mt-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors active:scale-[0.99]"
                onClick={() => handleQuickAction('Load More Defaulters')}
              >
                View All Defaulters
              </button>
            </div>
          </section>
        </div>

        {/* Quick Actions Row */}
        <section className="space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Quick Administrative Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              className="glass-card group p-6 rounded-xl flex items-center justify-start gap-4 hover:bg-primary-container hover:text-on-primary transition-all duration-300"
              onClick={() => handleQuickAction('Generate Daily Attendance Report')}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-white/20 flex items-center justify-center text-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">assignment</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-white transition-colors">Generate Daily Report</span>
            </button>

            <button 
              className="glass-card group p-6 rounded-xl flex items-center justify-start gap-4 hover:bg-secondary-container hover:text-on-secondary transition-all duration-300"
              onClick={() => {
                const holiday = prompt("Enter holiday name (e.g. Memorial Day):");
                if (holiday) alert(`Success: "${holiday}" has been scheduled as an institutional holiday.`);
              }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 group-hover:bg-white/20 flex items-center justify-center text-secondary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">event_busy</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-white transition-colors">Mark Holiday</span>
            </button>

            <button 
              className="glass-card group p-6 rounded-xl flex items-center justify-start gap-4 hover:bg-tertiary-container hover:text-on-tertiary transition-all duration-300"
              onClick={() => handleQuickAction('Broadcast Notifications to Defaulter Parents')}
            >
              <div className="w-12 h-12 rounded-full bg-tertiary/10 group-hover:bg-white/20 flex items-center justify-center text-tertiary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">notifications_active</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-white transition-colors">Notify Defaulters</span>
            </button>
          </div>
        </section>
      </main>

      {/* Register Faculty Modal Dialog */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                Register Faculty Member
              </h3>
              <button 
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setShowRegisterModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleRegisterFacultySubmit}>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 font-semibold" htmlFor="facultyName">Full Name</label>
                <input 
                  type="text" 
                  id="facultyName" 
                  required
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full px-4 py-3 bg-white/70 border border-outline-variant/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 font-semibold" htmlFor="facultyEmail">Email Address</label>
                <input 
                  type="email" 
                  id="facultyEmail" 
                  required
                  placeholder="alan.turing@edutrack.edu"
                  className="w-full px-4 py-3 bg-white/70 border border-outline-variant/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 font-semibold" htmlFor="facultyDept">Department</label>
                <select 
                  id="facultyDept" 
                  className="w-full px-4 py-3 bg-white/70 border border-outline-variant/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer"
                  value={facultyDept}
                  onChange={(e) => setFacultyDept(e.target.value)}
                >
                  <option value="Computer Science">Computer Science & Eng.</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Physics Department">Physics & Sciences</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-6">
                <button 
                  type="button"
                  className="flex-1 py-3 border border-outline-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container transition-colors active:scale-[0.98]"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isRegistering}
                  className="flex-1 py-3 bg-primary text-on-primary font-label-md rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Faculty</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-2 pb-safe bg-surface dark:bg-inverse-surface shadow-[0px_-4px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant">
        <a className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1.5 transition-transform duration-200" href="#dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="font-label-md text-label-md">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-container-high rounded-xl transition-all duration-200" href="#classes" onClick={() => handleQuickAction('Classes View')}>
          <span className="material-symbols-outlined">groups</span>
          <span className="font-label-md text-label-md">Classes</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-container-high rounded-xl transition-all duration-200" href="#reports" onClick={() => handleQuickAction('Reports Panel')}>
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-md text-label-md">Reports</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-container-high rounded-xl transition-all duration-200" href="#profile" onClick={() => setShowProfileMenu(true)}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-md text-label-md">Profile</span>
        </a>
      </nav>
    </>
  );
}

export default Dashboard;
