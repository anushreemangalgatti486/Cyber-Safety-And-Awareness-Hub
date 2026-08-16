/**
 * seedAdmin.js - Run this once to create the admin account
 * Usage: node seedAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const ADMIN_EMAIL = 'admin@cybershield.io';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'CyberShield Admin';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Load User model
    const User = require('./models/User');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // If exists but not admin, promote it
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Existing user promoted to admin!');
      } else {
        console.log('✅ Admin account already exists!');
      }
      console.log('\n--- Admin Credentials ---');
      console.log('Email   :', ADMIN_EMAIL);
      console.log('Password: Admin@123');
      console.log('URL     : http://localhost:5173/admin/login');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('--- Admin Credentials ---');
    console.log('Email   :', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('URL     : http://localhost:5173/admin/login');
    console.log('-------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
