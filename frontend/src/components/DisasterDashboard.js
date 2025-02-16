import React from 'react';

const DisasterDashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Real-Time Disaster Data Dashboard</h2>
      <iframe
        src="http://127.0.0.1:8050/"
        title="Disaster Dashboard"
        style={{ width: '100%', height: '600px', border: 'none' }}
      ></iframe>
    </div>
  );
};

export default DisasterDashboard;
