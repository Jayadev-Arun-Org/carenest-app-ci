require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const notifyRoutes = require('./routes/notifyRoutes');
const { startConsumer } = require('./services/serviceBusConsumer');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notify',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/notifications', notifyRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Notify service running on port ${PORT}`);
    startConsumer().catch(err => console.error("Error starting consumer:", err));
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
