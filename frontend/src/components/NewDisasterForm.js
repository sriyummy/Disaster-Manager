import React, { useState } from 'react';
import axios from 'axios';

const NewDisasterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    severity: 1,
    description: '',
    location: { lat: '', lng: '' }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/disasters', {
        name: formData.name,
        severity: formData.severity,
        description: formData.description,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
        }
      });
      alert('Disaster reported successfully');
    } catch (error) {
      console.error('Error reporting disaster:', error);
      alert('Failed to report disaster');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label>Severity (1-4):</label>
        <input type="number" name="severity" value={formData.severity} onChange={handleChange} min="1" max="4" />
      </div>
      <div>
        <label>Description:</label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} />
      </div>
      <div>
        <label>Latitude:</label>
        <input type="text" name="lat" value={formData.lat} onChange={handleChange} />
      </div>
      <div>
        <label>Longitude:</label>
        <input type="text" name="lng" value={formData.lng} onChange={handleChange} />
      </div>
      <button type="submit">Report Disaster</button>
    </form>
  );
};

export default NewDisasterForm;
