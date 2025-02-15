import express from 'express';
import Disaster from '../models/disaster.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const disasters = await Disaster.find();
    res.json(disasters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const disaster = new Disaster(req.body);
  try {
    const newDisaster = await disaster.save();
    res.status(201).json(newDisaster);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
