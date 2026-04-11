const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'employee',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    await User.deleteMany({});
    console.log('Users Cleared...');

    await User.create(users);
    console.log('Seed Data Added!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
