const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['wholesaler', 'retailer'], 
    required: true 
  },
  company_name: { type: String },
  password_hash: { type: String, required: true },
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
