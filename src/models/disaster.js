import mongoose from 'mongoose';

const disasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Disaster' },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  severity: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  description: String,
  affectedAreas: [String],
});

disasterSchema.index({ location: '2dsphere' });

const Disaster = mongoose.model('Disaster', disasterSchema);

export default Disaster;
