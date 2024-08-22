import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Overview from './pages/Overview';
import Team from './pages/Team';
import Patient from './pages/Patients';

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path='/overview' element={<Overview />} />
        <Route path="/patients/:patientId" element={<Patient />} />
        <Route path='/team' element={<Team />} />
      </Routes>
    </Router>
  );
}

export default App;
