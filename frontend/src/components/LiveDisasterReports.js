import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LiveDisasterReports = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the disasters from your backend
    const fetchDisasters = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/disasters');
        setDisasters(response.data);  // Update the state with the fetched data
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
    <div>
      {disasters.length === 0 ? (
        <div>No live reports yet</div>
      ) : (
        <ul>
          {disasters.map(disaster => (
            <li key={disaster._id}>
              <h3>{disaster.name}</h3>
              <p>{disaster.description}</p>

              {/* Add conditional check for location and coordinates */}
              {disaster.location && disaster.location.coordinates ? (
                <p>Location: {disaster.location.coordinates.join(', ')}</p>
              ) : (
                <p>Location: Not available</p>
              )}

              <p>Severity: {disaster.severity}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveDisasterReports;
