const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cosmosService = require('../services/cosmosService');
const openaiService = require('../services/openaiService');

router.post('/symptom-check', auth, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const doctorData = await cosmosService.getAvailableDoctorsAndSlots();
    const recommendation = await openaiService.analyzeSymptoms(symptoms, doctorData);
    res.json(recommendation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
