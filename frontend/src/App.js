import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LiveDisasterReports from './components/LiveDisasterReports';
import NewDisasterForm from './components/NewDisasterForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/live-disasters" element={<LiveDisasterReports />} />
          <Route path="/new-disaster" element={<NewDisasterForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
