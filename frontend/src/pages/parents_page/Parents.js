import React from 'react';
import './Parents.css';

const attendance = [
  { course: 'Mathematics', value: 94 },
  { course: 'Computer Science', value: 88 },
  { course: 'Physics', value: 76 }
];

function Parents() {
  return (
    <div className="parents-page min-h-screen bg-slate-50 text-on-surface">
      <header className="bg-white border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">family_restroom</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">EduTrack</h1>
              <p className="text-sm text-on-surface-variant">Parent Portal</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-white font-semibold">
            Contact Faculty
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
          <div className="bg-white rounded-xl border border-outline-variant p-5 sm:p-8">
            <p className="text-sm text-on-surface-variant">Student</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Ryan Kade</h2>
            <p className="mt-2 text-on-surface-variant">Year 3 · Business Administration</p>
            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="font-semibold text-amber-800">Attendance needs attention</p>
              <p className="mt-1 text-sm text-amber-700">Physics is currently below the 80% requirement.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold">Subject Attendance</h2>
            <div className="mt-6 space-y-5">
              {attendance.map((item) => (
                <div key={item.course}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold">{item.course}</span>
                    <span className={item.value < 80 ? 'font-bold text-error' : 'font-bold text-emerald-600'}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={item.value < 80 ? 'h-full bg-error' : 'h-full bg-emerald-500'}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-outline-variant p-5">
            <p className="text-sm text-on-surface-variant">Overall</p>
            <p className="mt-2 text-3xl font-bold">86%</p>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant p-5">
            <p className="text-sm text-on-surface-variant">Classes Missed</p>
            <p className="mt-2 text-3xl font-bold">7</p>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant p-5">
            <p className="text-sm text-on-surface-variant">Messages</p>
            <p className="mt-2 text-3xl font-bold">2</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Parents;
