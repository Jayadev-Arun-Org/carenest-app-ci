require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const symptomRoutes = require('./routes/symptom');
const prescriptionRoutes = require('./routes/prescription');
const chatbotRoutes = require('./routes/chatbot');
const entitiesRoutes = require('./routes/entities');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

mongoose.connect(process.env.MONGO_URI.includes('?') ? process.env.MONGO_URI + '&retryWrites=false' : process.env.MONGO_URI + '?retryWrites=false')
  .then(() => console.log('Connected to Cosmos DB MongoDB API'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/ai', symptomRoutes);
app.use('/api/ai', prescriptionRoutes);
app.use('/api/ai', chatbotRoutes);
app.use('/api/ai', entitiesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`AI Service listening on port ${port}`);
});


