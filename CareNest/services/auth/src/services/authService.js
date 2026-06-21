const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    const user = await User.create(userData);
    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    const token = this.generateToken(user);
    return { user, token };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getDoctors() {
    return User.find({ role: 'doctor' }).select('-password');
  }
}

module.exports = new AuthService();
