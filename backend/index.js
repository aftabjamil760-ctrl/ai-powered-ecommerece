const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cors = require('cors');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackeRoute');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ordersRoutes = require('./routes/ordersRoute');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
// NEW: Import chatbot routes
const chatbotRoutes = require('./chatbot/routes/chatbotRoutes');


// After connectDB() - ADD these lines
// Initialize vector store
const vectorStore = require('./chatbot/utils/vectorStore');
vectorStore.initialize().catch(console.error);



const connectDB = require('./config/database');
require('./config/passport'); // Import passport config
require('./cron/analyticsCron'); // Start analytics cron jobs
connectDB()
// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Support existing Google Callback URL schema
app.use('/api/products', productRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
// NEW: Chatbot routes
app.use('/api/chatbot', chatbotRoutes);
// After other app.use() routes - ADD this line
app.use('/api/chatbot', chatbotRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

