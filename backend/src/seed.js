import dotenv from 'dotenv';
import connectDB from './config/db-connection.js';
import User from './models/user-model.js';
import Leave from './models/leave-model.js';

// Load environment variables before database connection
dotenv.config();

const seed = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: ['admin@penthara.dev', 'employee@penthara.dev'] } });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@penthara.dev',
    password: 'admin123',
    role: 'admin',
    leaveBalance: 18,
  });

  const employee = await User.create({
    name: 'Aryan Employee',
    email: 'employee@penthara.dev',
    password: 'employee123',
    role: 'employee',
    leaveBalance: 18,
  });

  await Leave.deleteMany({ user: employee._id });

  await Leave.create([
    {
      user: employee._id,
      leaveType: 'Casual',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-08-16'),
      reason: 'Family function',
      status: 'Approved',
      reviewedBy: admin._id,
    },
    {
      user: employee._id,
      leaveType: 'Sick',
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-08-20'),
      reason: 'Fever, resting at home',
      status: 'Pending',
    },
  ]);

  console.log('Seed complete. Demo accounts:');
  console.log('  Admin:    admin@penthara.dev / admin123');
  console.log('  Employee: employee@penthara.dev / employee123');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
