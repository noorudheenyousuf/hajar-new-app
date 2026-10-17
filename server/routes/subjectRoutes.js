import express from 'express';
import Subject from '../models/Subject.js';

const router = express.Router();

// GET all subjects (optional ?class= query)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) {
      filter.class = req.query.class;
    }
    const subjects = await Subject.find(filter).sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  try {
    const { name, class: className } = req.body;
    if (!name || !name.trim() || !className || !className.trim()) {
      return res.status(400).json({ message: 'Subject name and class are required' });
    }

    const subject = new Subject({
      name: name.trim(),
      class: className.trim()
    });

    const saved = await subject.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const { name, class: className } = req.body;
    if (!name || !name.trim() || !className || !className.trim()) {
      return res.status(400).json({ message: 'Subject name and class are required' });
    }

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        class: className.trim()
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
