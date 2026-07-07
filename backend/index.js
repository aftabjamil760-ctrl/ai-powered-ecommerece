const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cors = require('cors');
const compression = require('compression');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

const connectDB = require('./config/database');

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

const startServer = async () => {
  try {
    await connectDB();

    require('./config/passport');
    require('./cron/analyticsCron');

    const analyticsRoutes = require('./routes/analyticsRoutes');
    const feedbackRoutes = require('./routes/feedbackeRoute');
    const notificationRoutes = require('./routes/notificationRoutes');
    const paymentRoutes = require('./routes/paymentRoutes');
    const ordersRoutes = require('./routes/ordersRoute');
    const authRoutes = require('./routes/authRoutes');
    const productRoutes = require('./routes/productRoutes');
    const chatbotRoutes = require('./chatbot/routes/chatbotRoutes');
    const vectorStore = require('./chatbot/utils/vectorStore');

    app.use('/api/auth', authRoutes);
    app.use('/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', ordersRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/chatbot', chatbotRoutes);

    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });

    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    await vectorStore.initialize();
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

