const { validationResult } = require('express-validator');
const axios = require('axios');
const pharmacyService = require('../services/pharmacyService');
const blobStorageService = require('../services/blobStorageService');
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
      console.log(`[Pharmacy] Notification sent successfully: ${data.title} for userId=${data.userId}`);
    })
    .catch((err) => {
      console.error(`[Pharmacy] Failed to send notification: ${err.message}`);
    });
};

const createPrescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const data = {
      ...req.body,
      doctorId: req.user.id,
      doctorName: req.user.name,
      appointmentId: req.body.appointmentId || `standalone-${Date.now()}`
    };
    const prescription = await pharmacyService.create(data);

    // Non-blocking notification to notify service
    // userId = patientId so the PATIENT receives the notification (not the doctor)
    const medNames = (req.body.medications || []).map((m) => m.name).join(', ');
    sendNotification(
      {
        userId: req.body.patientId,
        title: 'Prescription Created',
        message: `Prescription for ${req.body.patientName}: ${medNames}`,
        type: 'prescription',
      },
      req.headers.authorization
    );

    let pdfUrl = null;
    if (req.file && req.file.buffer) {
      pdfUrl = await blobStorageService.uploadPrescriptionPDF(prescription._id || prescription.id, req.file.buffer);
    } else if (req.body.pdf) {
      const buffer = Buffer.from(req.body.pdf, 'base64');
      pdfUrl = await blobStorageService.uploadPrescriptionPDF(prescription._id || prescription.id, buffer);
    }

    if (pdfUrl) {
      prescription.pdfUrl = pdfUrl; // Return the url in the response optionally
    }

    await serviceBusPublisher.publishAppointmentEvent('prescription-created', {
      prescriptionId: prescription._id || prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      medications: req.body.medications,
      timestamp: new Date()
    });

    res.status(201).json({ message: 'Prescription created', prescription, pdfUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await pharmacyService.getAll(
      req.user.id,
      req.user.role
    );
    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await pharmacyService.getById(req.params.id);
    res.json({ prescription });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const prescription = await pharmacyService.updateStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role
    );
    res.json({ message: 'Prescription updated', prescription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
};
