import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  rollNo: {
    type: Number,
    default: null
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  place: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  fatherMobile: {
    type: String,
    default: ''
  },
  admissonDate: {
    type: String,
    default: ''
  },
  rank: {
    type: String,
    default: ''
  },
  previousCollege: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('Student', studentSchema);
