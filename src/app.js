import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import disasterRoutes from './routes/disasterRoutes.js';
//import resourceRoutes from './routes/resourceRoutes.js';
//import volunteerRoutes from './routes/volunteerRoutes.js';
//import predictionRoutes from './routes/predictionRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/disasters', disasterRoutes);
//app.use('/api/resources', resourceRoutes);
//app.use('/api/volunteers', volunteerRoutes);
//app.use('/api/predictions', predictionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
