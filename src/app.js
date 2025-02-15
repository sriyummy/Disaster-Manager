import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

import disasterRoutes from './routes/disasterRoutes.js';
import Disaster from './models/disaster.js';
import { faker } from '@faker-js/faker';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/disasters', disasterRoutes);

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

const cityBounds = {
  minLat: 21.20,
  maxLat: 21.30,
  minLng: 81.55,
  maxLng: 81.70,
};

const low = 1000;
const high = 3000;

const generateFakeReport = () => {
  const latitude = faker.number.float({ 
    min: cityBounds.minLat, 
    max: cityBounds.maxLat, 
    precision: 0.0001 
  });
  
  const longitude = faker.number.float({ 
    min: cityBounds.minLng, 
    max: cityBounds.maxLng, 
    precision: 0.0001 
  });
  
  return {
    id: faker.string.uuid(),
    victimName: faker.person.fullName(),
    contact: faker.phone.number(),
    location: { latitude, longitude },
    severity: faker.helpers.weightedArrayElement([
      { weight: 7, value: "Low" },
      { weight: 5, value: "Moderate" },
      { weight: 3, value: "High" },
      { weight: 1, value: "Critical" },
    ]),
    reportTime: new Date().toLocaleTimeString(),
    needs: faker.helpers.arrayElements(["Food", "Water", "Shelter", "Medical Aid"], 2),
  };
};

const saveFakeReportToMongo = async (newReport) => {
  try {
    const disaster = new Disaster({
      name: newReport.victimName,
      type: 'Disaster',
      location: {
        type: 'Point',
        coordinates: [newReport.location.longitude, newReport.location.latitude],
      },
      severity: mapSeverityToNumber(newReport.severity),
      startDate: new Date(),
      description: `Needs: ${newReport.needs.join(', ')}`,
      affectedAreas: [],
    });

    await disaster.save();
    console.log('Disaster saved to MongoDB:', disaster);
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
  }
};


io.on('connection', (socket) => {
  console.log('New client connected');

  (function loop() {
    const randomDelay = Math.round(Math.random() * (high - low)) + low;
    setTimeout(async function () {
      const newReport = generateFakeReport();
      io.emit('new-disaster', newReport);
      console.log('Sent:', newReport);

      try {
        const disaster = new Disaster({
          name: newReport.victimName,
          type: 'Disaster',
          location: {
            type: 'Point',
            coordinates: [newReport.location.longitude, newReport.location.latitude]
          },
          severity: mapSeverityToNumber(newReport.severity),
          startDate: new Date(),
          description: `Needs: ${newReport.needs.join(', ')}`,
          affectedAreas: []
        });
        await disaster.save();
        console.log('Disaster saved to MongoDB:', disaster);
      } catch (error) {
        console.error('Error saving to MongoDB:', error);
      }

      loop();
    }, randomDelay);
  })();
});

function mapSeverityToNumber(severity) {
  switch (severity) {
    case 'Low': return 1;
    case 'Moderate': return 2;
    case 'High': return 3;
    case 'Critical': return 4;
    default: return 0;
  }
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
