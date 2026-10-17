import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Setting from '../models/Setting.js';

const router = express.Router();

// GET /api/backup/export - Export all database data
router.get('/export', async (req, res) => {
  try {
    const [classes, students, teachers, subjects, attendance, settings] = await Promise.all([
      Class.find().lean(),
      Student.find().lean(),
      Teacher.find().lean(),
      Subject.find().lean(),
      Attendance.find().lean(),
      Setting.findOne({ key: 'app_settings' }).lean()
    ]);

    const backupData = {
      version: 1,
      appName: 'Wackha Hajar App',
      exportedAt: new Date().toISOString(),
      data: {
        classes,
        students,
        teachers,
        subjects,
        attendance,
        settings: settings || { key: 'app_settings', displayName: 'NOORUDHEEN SAQAFI', theme: 'light' }
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=hajar_app_backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.json(backupData);
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: `Export failed: ${error.message}` });
  }
});

// POST /api/backup/import - Import backup JSON into database
router.post('/import', async (req, res) => {
  try {
    const payload = req.body;
    const data = payload.data || payload;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid backup file format' });
    }

    const counts = {
      classes: 0,
      students: 0,
      teachers: 0,
      subjects: 0,
      attendance: 0
    };

    // 1. Classes
    if (Array.isArray(data.classes) && data.classes.length > 0) {
      await Class.deleteMany({});
      const cleanClasses = data.classes.map(c => ({ name: c.name }));
      const inserted = await Class.insertMany(cleanClasses);
      counts.classes = inserted.length;
    }

    // 2. Students
    if (Array.isArray(data.students) && data.students.length > 0) {
      await Student.deleteMany({});
      const cleanStudents = data.students.map(s => {
        const { _id, __v, createdAt, updatedAt, id, ...rest } = s;
        return rest;
      });
      const inserted = await Student.insertMany(cleanStudents);
      counts.students = inserted.length;
    }

    // 3. Teachers
    if (Array.isArray(data.teachers) && data.teachers.length > 0) {
      await Teacher.deleteMany({});
      const cleanTeachers = data.teachers.map(t => {
        const { _id, __v, createdAt, updatedAt, id, ...rest } = t;
        return rest;
      });
      const inserted = await Teacher.insertMany(cleanTeachers);
      counts.teachers = inserted.length;
    }

    // 4. Subjects
    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      await Subject.deleteMany({});
      const cleanSubjects = data.subjects.map(sub => {
        const { _id, __v, createdAt, updatedAt, id, ...rest } = sub;
        return rest;
      });
      const inserted = await Subject.insertMany(cleanSubjects);
      counts.subjects = inserted.length;
    }

    // 5. Attendance
    if (Array.isArray(data.attendance)) {
      await Attendance.deleteMany({});
      if (data.attendance.length > 0) {
        const cleanAttendance = data.attendance.map(a => {
          const { _id, __v, createdAt, updatedAt, id, ...rest } = a;
          return rest;
        });
        const inserted = await Attendance.insertMany(cleanAttendance);
        counts.attendance = inserted.length;
      }
    }

    // 6. Settings
    if (data.settings && typeof data.settings === 'object') {
      await Setting.findOneAndUpdate(
        { key: 'app_settings' },
        {
          $set: {
            displayName: data.settings.displayName || 'NOORUDHEEN SAQAFI',
            theme: data.settings.theme || 'light'
          }
        },
        { returnDocument: 'after', upsert: true }
      );
    }

    res.json({
      message: 'Data successfully restored from backup!',
      counts
    });
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ message: `Import failed: ${error.message}` });
  }
});

export default router;
