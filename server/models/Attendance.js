import mongoose from 'mongoose';

const attendanceRecordItemSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required (YYYY-MM-DD)'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  records: [attendanceRecordItemSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

attendanceSchema.index({ date: 1, class: 1, subject: 1 });

export default mongoose.model('Attendance', attendanceSchema);
