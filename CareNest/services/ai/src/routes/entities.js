const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cosmosService = require('../services/cosmosService');
const languageService = require('../services/languageService');

router.post('/extract-entities', auth, async (req, res) => {
  try {
    const { notes, appointmentId, patientId } = req.body;
    const entities = await languageService.extractHealthEntities(notes);
    await cosmosService.saveHealthProfile(patientId, entities);
    res.json(entities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
