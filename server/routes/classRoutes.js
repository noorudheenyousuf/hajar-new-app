import express from 'express';
import Class from '../models/Class.js';

const router = express.Router();

// GET all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create class
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    const existing = await Class.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Class already exists' });
    }

    const newClass = new Class({ name: name.trim() });
    const saved = await newClass.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update class
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE class
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
