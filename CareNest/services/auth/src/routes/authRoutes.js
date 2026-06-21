const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  getDoctors,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['patient', 'doctor'])
      .withMessage('Role must be patient or doctor'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/profile', authenticate, getProfile);
router.get('/doctors', authenticate, getDoctors);

module.exports = router;
