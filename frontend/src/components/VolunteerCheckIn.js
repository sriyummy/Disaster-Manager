import React, { useState } from "react";
import axios from "axios";

const VolunteerCheckIn = () => {
  const [formData, setFormData] = useState({ name: "", availability: "", lat: "", lon: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:3000/api/volunteer-checkin", formData)
      .then(() => {
        setSubmitted(true);
      })
      .catch(error => {
        console.error("Error submitting check-in:", error);
      });
  };

  return (
    <div>
      <h2>Volunteer Check-In</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>
        <label>
          Availability:
          <input type="text" name="availability" value={formData.availability} onChange={handleChange} />
        </label>
        <label>
          Latitude:
          <input type="text" name="lat" value={formData.lat} onChange={handleChange} />
        </label>
        <label>
          Longitude:
          <input type="text" name="lon" value={formData.lon} onChange={handleChange} />
        </label>
        <button type="submit">Check In</button>
      </form>
      {submitted && <p>Volunteer check-in submitted successfully!</p>}
    </div>
  );
};

export default VolunteerCheckIn;
