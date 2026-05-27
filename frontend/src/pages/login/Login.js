import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Add classes to body to support the mesh gradient and global layout styles
    const bodyClasses = [
      'flex',
      'flex-col',
      'min-h-screen',
      'text-on-surface',
      'mesh-gradient',
      'relative',
      'overflow-x-hidden'
    ];
    bodyClasses.forEach((cls) => document.body.classList.add(cls));

    return () => {
      bodyClasses.forEach((cls) => document.body.classList.remove(cls));
    };
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginStatus('loading');
    setErrorMessage('');

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/login`,
        {
          email: email,
          password: password
        }
      );

      setLoginStatus('success');

      // Determine navigation route based on email
      let navigationPath = '/admin';
      if (email === 'teacher@school.com') {
        navigationPath = '/faculty';
      } else if (email === 'parent@home.com') {
        navigationPath = '/parents';
      } else if (email === 'admin@school.com') {
        navigationPath = '/admin';
      }

      setTimeout(() => {
        setLoginStatus('idle');
        // Clear fields
        setEmail('');
        setPassword('');
        navigate(navigationPath);
      }, 1000);
    } catch (error) {
      setLoginStatus('error');
      setErrorMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
      
      setTimeout(() => {
        setLoginStatus('idle');
      }, 2000);
    }
  };

  return (
    <>
      {/* Decorative mesh elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px] animate-pulse"></div>
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] animate-pulse" 
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <header className="w-full flex flex-col items-center gap-3 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200/50 transform transition-all hover:scale-110 hover:rotate-3">
            <span className="material-symbols-outlined text-white text-4xl" data-icon="school">school</span>
          </div>
          <div className="text-center">
            <h1 className="font-plus-jakarta text-4xl sm:text-5xl font-extrabold text-indigo-900 tracking-tight">EduTrack</h1>
            <p className="font-body-md text-on-surface-variant font-medium tracking-wide opacity-80 uppercase text-[12px]">Attendance Management System</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-[460px] animate-in fade-in zoom-in-95 duration-500">
          <div className="glass-card rounded-2xl shadow-[0px_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12">
              <div className="mb-8 sm:mb-10">
                <h2 className="font-plus-jakarta text-2xl sm:text-3xl font-bold text-on-surface">Welcome Back</h2>
                <p className="font-body-sm text-on-surface-variant mt-2 font-medium opacity-70">
                  Please enter your credentials to continue
                </p>
              </div>

              <form className="space-y-6" id="loginForm" onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant px-1 font-semibold" htmlFor="email">
                    Email / Username
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 group-focus-within:text-indigo-600 transition-colors" data-icon="mail">
                      mail
                    </span>
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/80 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-body-md text-on-surface placeholder:text-outline/40 shadow-sm" 
                      id="email" 
                      name="email" 
                      placeholder="Enter your email or username" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
                    <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="password">
                      Password
                    </label>
                    <a className="font-label-sm text-label-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors" href="#forgot-password">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 group-focus-within:text-indigo-600 transition-colors" data-icon="lock">
                      lock
                    </span>
                    <input 
                      className="w-full pl-12 pr-12 py-4 bg-white/50 border border-white/80 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-body-md text-on-surface placeholder:text-outline/40 shadow-sm" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-indigo-600 transition-colors" 
                      onClick={togglePassword} 
                      type="button"
                    >
                      <span className="material-symbols-outlined text-body-lg" data-icon={showPassword ? 'visibility_off' : 'visibility'} id="passwordIcon">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Keep Me Signed In Checkbox */}
                <div className="flex items-center gap-3 py-1">
                  <input 
                    className="w-5 h-5 rounded-md border-white/80 bg-white/50 text-indigo-600 focus:ring-indigo-500/30 transition-shadow cursor-pointer" 
                    id="remember" 
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label className="font-body-sm text-body-sm text-on-surface-variant font-medium cursor-pointer select-none opacity-80" htmlFor="remember">
                    Keep me signed in
                  </label>
                </div>

                {/* Error Message */}
                {loginStatus === 'error' && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Submit button with dynamic statuses */}
                {loginStatus === 'idle' && (
                  <button 
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-plus-jakarta font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-6" 
                    type="submit"
                  >
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-xl" data-icon="arrow_forward">arrow_forward</span>
                  </button>
                )}

                {loginStatus === 'loading' && (
                  <button 
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-plus-jakarta font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-6 cursor-not-allowed opacity-80" 
                    type="submit"
                    disabled
                  >
                    <span className="material-symbols-outlined animate-spin text-lg" data-icon="progress_activity">
                      progress_activity
                    </span>
                    <span className="ml-2">Authenticating...</span>
                  </button>
                )}

                {loginStatus === 'success' && (
                  <button 
                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-plus-jakarta font-bold rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 mt-6 cursor-default" 
                    type="submit"
                    disabled
                  >
                    <span className="material-symbols-outlined text-lg" data-icon="check_circle">
                      check_circle
                    </span>
                    <span className="ml-2">Success</span>
                  </button>
                )}

                {loginStatus === 'error' && (
                  <button 
                    className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 text-white font-plus-jakarta font-bold rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 mt-6 cursor-not-allowed opacity-80" 
                    type="submit"
                    disabled
                  >
                    <span className="material-symbols-outlined text-lg" data-icon="error">
                      error
                    </span>
                    <span className="ml-2">Login Failed</span>
                  </button>
                )}
              </form>

              {/* Support link/button */}
              <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-indigo-100/50 text-center">
                <p className="font-body-sm text-on-surface-variant font-medium opacity-60 mb-4">Having trouble logging in?</p>
                <button className="w-full h-12 border border-indigo-200/50 text-indigo-700 font-label-md text-label-md rounded-xl hover:bg-white/80 hover:border-indigo-400/30 hover:shadow-sm transition-all active:scale-[0.98]">
                  Contact Admin Office
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 text-center mt-auto px-4 sm:px-6 relative z-10">
        <p className="font-label-sm text-label-sm text-indigo-900/40 font-medium tracking-wide">
          © 2024 EDUTRACK SYSTEMS. ALL RIGHTS RESERVED. <br className="md:hidden" /> POWERED BY INSTITUTIONAL CLOUD.
        </p>
      </footer>
    </>
  );
}

export default Login;
