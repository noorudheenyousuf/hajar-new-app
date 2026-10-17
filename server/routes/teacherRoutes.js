import express from 'express';
import Teacher from '../models/Teacher.js';

const router = express.Router();

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ name: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create teacher
router.post('/', async (req, res) => {
  try {
    const { name, incharge } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Teacher name is required' });
    }

    const teacher = new Teacher({
      name: name.trim(),
      incharge: (incharge || '').trim()
    });

    const saved = await teacher.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update teacher
router.put('/:id', async (req, res) => {
  try {
    const { name, incharge } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Teacher name is required' });
    }

    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        incharge: (incharge || '').trim()
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
