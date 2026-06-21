const Prescription = require('../models/Prescription');

class PharmacyService {
  async create(data) {
    return Prescription.create(data);
  }

  async getAll(userId, role) {
    const filter =
      role === 'doctor' ? { doctorId: userId } : { patientId: userId };
    const prescriptions = await Prescription.find(filter);
    return prescriptions.sort((a, b) => b.createdAt - a.createdAt);
  }

  async getById(id) {
    const prescription = await Prescription.findById(id);
    if (!prescription) throw new Error('Prescription not found');
    return prescription;
  }

  async updateStatus(id, status, userId, role) {
    const prescription = await Prescription.findById(id);
    if (!prescription) throw new Error('Prescription not found');

    if (role === 'doctor' && prescription.doctorId !== userId) {
      throw new Error('Not authorized');
    }

    prescription.status = status;
    return prescription.save();
  }
}

module.exports = new PharmacyService();
