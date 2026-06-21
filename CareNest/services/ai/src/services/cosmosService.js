const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

exports.getAvailableDoctorsAndSlots = async () => {
  const doctors = await User.find({ role: 'doctor' }, 'specialization name _id').lean();
  const availableSlots = await Appointment.find({ status: 'available' }).lean();
  return { doctors, availableSlots };
};

exports.getPrescriptionById = async (prescriptionId) => {
  return await Prescription.findById(prescriptionId).lean();
};

exports.getPatientContext = async (patientId) => {
  const appointments = await Appointment.find({ patientId }).lean();
  const prescriptions = await Prescription.find({ patientId }).lean();
  return { appointments, prescriptions };
};

exports.saveHealthProfile = async (patientId, healthProfileData) => {
  await User.findByIdAndUpdate(patientId, { $set: { healthProfile: healthProfileData } });
};
