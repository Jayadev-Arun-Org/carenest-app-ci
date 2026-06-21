const Appointment = require('../models/Appointment');

class AppointmentService {
  async create(data) {
    return Appointment.create(data);
  }

  async getAll(userId, role) {
    const filter =
      role === 'doctor' ? { doctorId: userId } : { patientId: userId };
    const appointments = await Appointment.find(filter);
    return appointments.sort((a, b) => b.createdAt - a.createdAt);
  }

  async getById(id) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error('Appointment not found');
    return appointment;
  }

  async update(id, data, userId, role) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error('Appointment not found');

    // Patients can only cancel their own appointments
    if (role === 'patient') {
      if (appointment.patientId !== userId)
        throw new Error('Not authorized');
      if (data.status && data.status !== 'cancelled')
        throw new Error('Patients can only cancel appointments');
    }

    // Doctors can confirm, complete, or add notes to their appointments
    if (role === 'doctor' && appointment.doctorId !== userId) {
      throw new Error('Not authorized');
    }

    Object.assign(appointment, data);
    return appointment.save();
  }
}

module.exports = new AppointmentService();
