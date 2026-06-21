const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cosmosService = require('../services/cosmosService');
const openaiService = require('../services/openaiService');

router.post('/prescription-summary', auth, async (req, res) => {
  try {
    const { prescriptionId } = req.body;
    const prescription = await cosmosService.getPrescriptionById(prescriptionId);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    
    const summary = await openaiService.summarizePrescription(prescription);
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
