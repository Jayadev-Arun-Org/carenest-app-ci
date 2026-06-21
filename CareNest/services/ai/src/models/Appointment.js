const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  status: { type: String, enum: ['available', 'created', 'confirmed', 'cancelled', 'completed'], required: true },
  date: { type: Date, required: true },
  notes: { type: String }
}, { collection: 'appointments', strict: false });

module.exports = mongoose.model('Appointment', appointmentSchema);
