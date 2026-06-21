const { validationResult } = require('express-validator');
const axios = require('axios');
const appointmentService = require('../services/appointmentService');
const serviceBusPublisher = require('../services/serviceBusPublisher');

const NOTIFY_URL = process.env.NOTIFY_SERVICE_URL || 'http://notify-service:3004';

// Non-blocking notify helper — logs errors for debugging
const sendNotification = (data, authHeader) => {
  axios
    .post(`${NOTIFY_URL}/api/notifications`, data, {
      headers: { Authorization: authHeader },
      timeout: 3000,
    })
    .then(() => {
      console.log(`[Appointment] Notification sent successfully: ${data.title} for userId=${data.userId}`);
    })
    .catch((err) => {
      console.error(`[Appointment] Failed to send notification: ${err.message}`);
    });
};

const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const data = {
      ...req.body,
      patientId: req.user.id,
      patientName: req.user.name,
    };
    const appointment = await appointmentService.create(data);

    // Non-blocking notification to notify service
    // userId = patient (the logged-in user who booked the appointment)
    sendNotification(
      {
        userId: req.user.id,
        title: 'Appointment Booked',
        message: `Appointment with Dr. ${req.body.doctorName} on ${req.body.date} at ${req.body.time}`,
        type: 'appointment',
      },
      req.headers.authorization
    );

    await serviceBusPublisher.publishAppointmentEvent('appointment-created', {
      appointmentId: appointment._id || appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      status: appointment.status,
      timestamp: new Date()
    });

    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAll(
      req.user.id,
      req.user.role
    );
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentService.getById(req.params.id);
    res.json({ appointment });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.update(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    
    if (req.body.status && ['confirmed', 'cancelled', 'completed'].includes(req.body.status)) {
      await serviceBusPublisher.publishAppointmentEvent(`appointment-${req.body.status}`, {
        appointmentId: appointment._id || appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        status: appointment.status,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Appointment updated', appointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
};
