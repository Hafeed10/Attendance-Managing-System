import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/admin_page/Dashboard';
import Faculty from './pages/faculty/Faculty';
import Parents from './pages/parents_page/Parents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/faculty" replace />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="*" element={<Navigate to="/faculty" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
