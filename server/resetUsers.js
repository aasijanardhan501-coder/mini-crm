/**
 * Reset Users Script
 * Clears all users from the database so you can register fresh.
 * Run with: node resetUsers.js
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const resetUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB:', mongoose.connection.host);

    const count = await User.countDocuments();
    console.log(`Found ${count} user(s) in the database.`);

    await User.deleteMany({});
    console.log('✅ All users deleted successfully.');
    console.log('');
    console.log('You can now register a fresh account at http://localhost:5173');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

resetUsers();
