import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Dashboard from './pages/admin_page/Dashboard';
import Faculty from './pages/faculty/Faculty';
import Parents from './pages/parents_page/Parents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
