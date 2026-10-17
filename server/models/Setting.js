import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'app_settings',
    unique: true
  },
  displayName: {
    type: String,
    default: 'NOORUDHEEN SAQAFI'
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('Setting', settingSchema);
