const express = require('express');
const { body } = require('express-validator');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
} = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('doctorName').notEmpty().withMessage('Doctor name is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
  ],
  createAppointment
);

router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.put('/:id', authenticate, updateAppointment);

module.exports = router;
