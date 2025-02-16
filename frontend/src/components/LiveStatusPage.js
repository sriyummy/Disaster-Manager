import React, { useEffect } from 'react';
import './LiveStatusPage.css';  // Add styles as needed for the map container

const LiveStatusPage = () => {
  useEffect(() => {
    // Load map.js script dynamically when component mounts
    const script = document.createElement('script');
    script.src = '../../../public/map.js';  // Ensure the path is correct, it should point to public/map.js
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="live-status-container">
      <h2>Live Disaster Map Status</h2>
      {/* Map div for leaflet to render map */}
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
};

export default LiveStatusPage;
