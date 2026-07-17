// make-admin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const ADMIN_EMAIL = 'aftabjamil760@gmail.com';
const ADMIN_PASSWORD = 'aftab@760?';

async function makeAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.role = 'admin';
    user.password = ADMIN_PASSWORD;
    user.isVerified = true;
    await user.save();
    console.log(`✅ Updated existing user: ${ADMIN_EMAIL} as ADMIN.`);
  } else {
    const name = ADMIN_EMAIL.split('@')[0];
    user = new User({
      name,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });
    await user.save();
    console.log(`✅ Created new ADMIN user: ${ADMIN_EMAIL}.`);
  }

  await mongoose.connection.close();
}

makeAdmin().catch((err) => {
  console.error('❌ Error creating admin user:', err);
  mongoose.connection.close();
  process.exit(1);
});
