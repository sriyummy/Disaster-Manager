import React, { useState } from "react";
import axios from "axios";

const ResourceRequest = () => {
  const [formData, setFormData] = useState({ type: "food", quantity: "", lat: "", lon: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Post the resource request to the backend
    axios.post("http://localhost:3000/api/request-resource", formData)
      .then(() => {
        setSubmitted(true);
      })
      .catch(error => {
        console.error("Error submitting request:", error);
      });
  };

  return (
    <div>
      <h2>Request Resources</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Type:
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medicine">Medicine</option>
          </select>
        </label>
        <label>
          Quantity:
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
        </label>
        <label>
          Latitude:
          <input type="text" name="lat" value={formData.lat} onChange={handleChange} />
        </label>
        <label>
          Longitude:
          <input type="text" name="lon" value={formData.lon} onChange={handleChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
      {submitted && <p>Resource request submitted successfully!</p>}
    </div>
  );
};

export default ResourceRequest;
