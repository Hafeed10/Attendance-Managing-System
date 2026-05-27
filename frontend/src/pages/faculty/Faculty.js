import React from 'react';
import './Faculty.css';

const classRows = [
  { subject: 'Data Structures', room: 'Lab 204', time: '09:00 AM', present: 42, total: 48 },
  { subject: 'Web Engineering', room: 'Room 112', time: '11:30 AM', present: 36, total: 40 },
  { subject: 'Database Systems', room: 'Room 305', time: '02:00 PM', present: 51, total: 56 }
];

function Faculty() {
  return (
    <div className="faculty-page min-h-screen bg-slate-50 text-on-surface">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-outline-variant">
        <div className="max-w-7xl mx-auto h-auto min-h-16 px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">school</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">EduTrack</h1>
              <p className="text-sm text-on-surface-variant">Faculty Portal</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-white font-semibold">
            Mark Attendance
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="bg-white rounded-xl border border-outline-variant p-5 sm:p-8">
            <p className="text-sm font-semibold uppercase text-primary">Today</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Welcome, Faculty</h2>
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              Review your scheduled classes, submit attendance, and follow up with students who need attention.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-outline-variant p-5">
              <p className="text-sm text-on-surface-variant">Classes</p>
              <p className="mt-2 text-3xl font-bold">3</p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant p-5">
              <p className="text-sm text-on-surface-variant">Avg. Attendance</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">89%</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-outline-variant">
            <h2 className="text-xl sm:text-2xl font-bold">Class Schedule</h2>
          </div>
          <div className="divide-y divide-outline-variant">
            {classRows.map((item) => (
              <div key={item.subject} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.subject}</h3>
                  <p className="text-sm text-on-surface-variant">{item.time} · {item.room}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                  <p className="text-sm text-on-surface-variant">
                    <span className="font-bold text-on-surface">{item.present}/{item.total}</span> present
                  </p>
                  <button className="w-full sm:w-auto px-4 py-2 rounded-lg border border-primary text-primary font-semibold">
                    Open Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Faculty;
