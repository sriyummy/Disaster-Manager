// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import LatestAlerts from "./components/LatestAlerts";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/latest-alerts" element={<LatestAlerts />} />
      </Routes>
    </Router>
  );
}

export default App;
