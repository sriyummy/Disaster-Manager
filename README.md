Steps to Run this:

1. Go into the root directory and "npm run dev" on the terminal to initialize faker inputs to simulate crowdsourced data.
2.In the same terminal, run "python importer.py"
3. Change directory to "frontend" and "npm start" in the terminal to start the React Application. If a prompt comes to change server port, press 'y'.

Following these steps will launch the react application, where you can navigate to either of the three options avaialble: view dashboard for real time data analytics,
view real time map integration of details of the emergency service call, and the most recent inquiries for emergency services. 

Code-Phoenix-25

Code for the hackathon "Code of the Phoenix" 2025.

Disaster Management Platform

Overview

This project is a real-time disaster relief coordination platform designed to streamline aid distribution using crowdsourced data, geolocation tracking, and AI-driven demand prediction.

Features

Live Disaster Reporting: Real-time submission of disaster reports.

Geolocation Tracking: Visualization of affected areas using Leaflet.js.

AI Demand Prediction: Predicts where aid is needed most.

Volunteer & NGO Coordination: Enables efficient communication between responders.

Data Analytics via Python & Tableau: Insights from stored disaster data using Python-based Tableau integration.

Tech Stack

Frontend: HTML, CSS, JavaScript, Leaflet.js

Backend: Node.js, Express.js, Faker

Database: MongoDB (Atlas)

Real-time Communication: Socket.io

Data Analysis: Python, Pandas, Tableau (Python-based)

Installation

Clone the repository:

git clone https://github.com/your-repo/disaster-management.git

Install dependencies:

cd disaster-management
npm install express mongoose socket.io cors @faker-js/faker leaflet.animatedmarker
npm install -y

Add "type": "module" in package.json.

Install Nodemon for development:

npm install nodemon -D

Set up environment variables in .env:

MONGODB_URI=your_mongo_connection_string
PORT=3000

Run the project:

Start the server in development mode:

npm run dev

Serve frontend via Python:

python -m http.server 8000

Open index.html in the browser.

API Endpoints

GET /api/disasters - Retrieve all disaster reports.

POST /api/disasters - Submit a new disaster report.

{
  "name": "John Doe",
  "type": "Disaster",
  "location": { "type": "Point", "coordinates": [81.6000, 21.2100] },
  "severity": 3,
  "description": "Severe flooding reported in the area",
  "affectedAreas": ["Naya Raipur", "Pandri"]
}

GET /api/disasters/:id - Get details of a specific disaster report.

Python-Based Tableau Integration

Extract data from MongoDB:

from pymongo import MongoClient
import pandas as pd

client = MongoClient("your_mongo_connection_string")
db = client["disasterDB"]
collection = db["disasters"]

data = pd.DataFrame(list(collection.find()))
data.to_csv("disaster_data.csv", index=False)

Load data into Tableau (Python-based) for visualization.

Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

License

MIT
