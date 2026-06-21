const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
  specialization: { type: String },
  healthProfile: { type: mongoose.Schema.Types.Mixed }
}, { collection: 'users', strict: false });

module.exports = mongoose.model('User', userSchema);
