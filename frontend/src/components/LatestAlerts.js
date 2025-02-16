// src/components/LatestAlerts.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LatestAlerts.css';

const LatestAlerts = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/disasters'); // Adjust backend route if needed
        setDisasters(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchDisasters();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="alerts-container">
      <h2>Latest Alerts and Requests</h2>
      {disasters.length === 0 ? (
        <div>No live reports yet</div>
      ) : (
        <ul>
          {disasters.map((disaster) => (
            <li key={disaster._id}>
              <h3>{disaster.name}</h3>
              <p>{disaster.description}</p>
              <p>Location: {disaster.location.coordinates.join(', ')}</p>
              <p>Severity: {disaster.severity}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LatestAlerts;
