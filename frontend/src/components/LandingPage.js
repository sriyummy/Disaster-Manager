import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      <h1>Disaster Management System</h1>
      <p>Select an option below:</p>
      <ul>
        <li>
          <Link to="/live-disasters">Live Disaster Reports</Link>
        </li>
        <li>
          <Link to="/new-disaster">Report a New Disaster</Link>
        </li>
      </ul>
    </div>
  );
};

export default LandingPage;
