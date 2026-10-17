import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// GET settings
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'app_settings' });
    if (!setting) {
      setting = await Setting.create({
        key: 'app_settings',
        displayName: 'NOORUDHEEN SAQAFI',
        theme: 'light'
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const { displayName, theme } = req.body;
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName.trim();
    if (theme !== undefined) updateData.theme = theme;

    const updated = await Setting.findOneAndUpdate(
      { key: 'app_settings' },
      { $set: updateData },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
