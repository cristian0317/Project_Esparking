const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  // --- CAMPOS NECESARIOS ---
  logoUrl: { // URL o base64 del logo (opcional si es solo texto)
    type: String,
    default: '' // Por si no hay logo
  },
  // -----------------------
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);