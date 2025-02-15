import React, { useState, useEffect } from "react";
import axios from "axios";

const ResourceMatcher = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    // Fetch matched resources from the backend
    axios.get("http://localhost:3000/api/resource-matcher")
      .then(response => {
        setResources(response.data);
      })
      .catch(error => {
        console.error("Error fetching resources:", error);
      });
  }, []);

  return (
    <div>
      <h2>Matched Resources</h2>
      <ul>
        {resources.map((resource, index) => (
          <li key={index}>
            Type: {resource.type}, Quantity: {resource.quantity}, Location: {resource.lat}, {resource.lon}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceMatcher;
