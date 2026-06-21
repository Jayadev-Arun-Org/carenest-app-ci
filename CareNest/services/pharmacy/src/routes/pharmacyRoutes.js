const express = require('express');
const { body } = require('express-validator');
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
} = require('../controllers/pharmacyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('doctor'),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('medications')
      .isArray({ min: 1 })
      .withMessage('At least one medication is required'),
    body('medications.*.name')
      .notEmpty()
      .withMessage('Medication name is required'),
    body('medications.*.dosage')
      .notEmpty()
      .withMessage('Dosage is required'),
    body('medications.*.frequency')
      .notEmpty()
      .withMessage('Frequency is required'),
    body('medications.*.duration')
      .notEmpty()
      .withMessage('Duration is required'),
  ],
  createPrescription
);

router.get('/', authenticate, getPrescriptions);
router.get('/:id', authenticate, getPrescriptionById);
router.put(
  '/:id/status',
  authenticate,
  [
    body('status')
      .isIn(['pending', 'dispensed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  updatePrescriptionStatus
);

module.exports = router;
