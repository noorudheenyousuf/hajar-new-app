import express from 'express';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// GET attendance records (optional filters: ?date=...&class=...&subject=...)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;

    const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST save or update attendance (upsert)
router.post('/', async (req, res) => {
  try {
    const { date, class: className, subject, records } = req.body;

    if (!date || !className || !subject || !Array.isArray(records)) {
      return res.status(400).json({
        message: 'date, class, subject, and records array are required'
      });
    }

    // Find if an attendance record for this date, class, and subject already exists
    let attendance = await Attendance.findOne({
      date: date.trim(),
      class: className.trim(),
      subject: subject.trim()
    });

    if (attendance) {
      attendance.records = records;
      const updated = await attendance.save();
      return res.json({
        message: 'Attendance updated successfully',
        data: updated
      });
    }

    attendance = new Attendance({
      date: date.trim(),
      class: className.trim(),
      subject: subject.trim(),
      records
    });

    const saved = await attendance.save();
    res.status(201).json({
      message: 'Attendance saved successfully',
      data: saved
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE clear all attendance data
router.delete('/', async (req, res) => {
  try {
    await Attendance.deleteMany({});
    res.json({ message: 'All attendance records cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE single attendance record
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
