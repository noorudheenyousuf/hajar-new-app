import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET all students (supports optional ?class= query)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) {
      filter.class = req.query.class;
    }
    const students = await Student.find(filter).sort({ rollNo: 1, name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create student
router.post('/', async (req, res) => {
  try {
    const {
      name,
      rollNo,
      class: className,
      photo,
      address,
      place,
      district,
      state,
      fatherName,
      motherName,
      fatherMobile,
      admissonDate,
      rank,
      previousCollege
    } = req.body;

    if (!name || !className) {
      return res.status(400).json({ message: 'Name and class are required' });
    }

    const student = new Student({
      name: name.trim(),
      rollNo: rollNo ? Number(rollNo) : null,
      class: className.trim(),
      photo: photo || '',
      address: address || '',
      place: place || '',
      district: district || '',
      state: state || '',
      fatherName: fatherName || '',
      motherName: motherName || '',
      fatherMobile: fatherMobile || '',
      admissonDate: admissonDate || '',
      rank: rank || '',
      previousCollege: previousCollege || ''
    });

    const saved = await student.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.class) {
      updateData.class = updateData.class.trim();
    }
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    if (updateData.rollNo !== undefined) {
      updateData.rollNo = updateData.rollNo ? Number(updateData.rollNo) : null;
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
