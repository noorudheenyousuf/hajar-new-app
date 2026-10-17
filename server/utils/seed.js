import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Setting from '../models/Setting.js';

export const seedDatabase = async () => {
  try {
    const classCount = await Class.countDocuments();
    if (classCount === 0) {
      console.log('Seeding initial database data...');

      await Class.insertMany([
        { name: 'Plus One' },
        { name: 'Plus Two' },
        { name: 'Bs1' },
        { name: 'Bs2' }
      ]);

      await Subject.insertMany([
        { name: 'Fiqh', class: 'Plus Two' },
        { name: 'Nahv', class: 'Plus Two' },
        { name: 'Thafseer', class: 'Plus Two' },
        { name: 'Hadeeth', class: 'Plus Two' },
        { name: 'Fiqh', class: 'Plus One' },
        { name: 'Nahv', class: 'Plus One' }
      ]);

      await Teacher.insertMany([
        { name: 'Noorudheen Saqafi', incharge: 'Plus Two' },
        { name: 'Irfan Saqafi', incharge: 'Plus Two' },
        { name: 'Razi Saqafi', incharge: 'Plus Two' },
        { name: 'Abuswalih Saqafi', incharge: 'Plus Two' }
      ]);

      await Student.insertMany([
        { name: 'Badhusha', rollNo: 1, class: 'Plus One' },
        { name: 'subair', rollNo: 7, class: 'Plus One' },
        { name: 'shukoor', rollNo: 6, class: 'Plus One' },
        { name: 'ibrahim', rollNo: 4, class: 'Plus One' },
        { name: 'Swalih', rollNo: 23, class: 'Bs1' }
      ]);

      console.log('Initial sample data seeded successfully!');
    }

    const setting = await Setting.findOne({ key: 'app_settings' });
    if (!setting) {
      await Setting.create({
        key: 'app_settings',
        displayName: 'NOORUDHEEN SAQAFI',
        theme: 'light'
      });
      console.log('Default settings initialized!');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
