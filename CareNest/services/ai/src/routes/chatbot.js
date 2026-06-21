const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cosmosService = require('../services/cosmosService');
const openaiService = require('../services/openaiService');

router.post('/chatbot', auth, async (req, res) => {
  try {
    const { question, patientId } = req.body;
    // ensure patientId matches logged in user or admin, simplified for now
    const patientContext = await cosmosService.getPatientContext(patientId);
    const answer = await openaiService.answerPatientQuestion(question, patientContext);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
