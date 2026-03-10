const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');          // For generating API keys

const DeviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    default: () => `espk_${crypto.randomBytes(24).toString('hex')}` // Generate a unique API key
  },
  // Reference to the ParkingSpot this device controls
  parkingSpot: {
    type: Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: false, // A device might not be assigned to a spot immediately
    unique: true, // A spot can only have one device
    sparse: true // Allow null values to be unique
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true // Every device belongs to an organization
  }
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);