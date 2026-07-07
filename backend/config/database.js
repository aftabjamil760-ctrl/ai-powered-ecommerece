const mongoose = require('mongoose');
const logger = require('../utils/logger');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const error = new Error('MongoDB connection error: no URI found in MONGODB_URI');
    logger.error(error.message);
    throw error;
  }

  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    connectionPromise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
    }).then(() => {
      logger.info('Connected to MongoDB');
      return mongoose.connection;
    });

    return await connectionPromise;
  } catch (err) {
    connectionPromise = null;
    logger.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;
