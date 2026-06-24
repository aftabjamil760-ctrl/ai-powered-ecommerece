require('dotenv').config();
const mongoose = require('mongoose');

async function dropIndex() {
  try {
    // Connect to the actual database used by the app (hardcoded in config/database.js)
    const mongoUrl = 'mongodb+srv://aftabjamil793:bYrNwTqtJ7xiVnW0@cluster0.5ooaiii.mongodb.net/user-crud';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB (user-crud)');

    const collection = mongoose.connection.collection('users');
    
    // Check if index exists
    const indexes = await collection.indexes();
    const indexExists = indexes.some(index => index.name === 'username_1');

    if (indexExists) {
      await collection.dropIndex('username_1');
      console.log('Successfully dropped index: username_1');
    } else {
      console.log('Index username_1 does not exist.');
    }
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndex();

