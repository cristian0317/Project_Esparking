const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParkingSpotSchema = new Schema({
  spotIdentifier: {
    type: String,
    required: true, 
  },
  spotType: {
    type: String,
    required: true,
    enum: ['carro', 'moto'], 
  },
  status: {
    type: String,
    required: true,
    enum: ['disponible', 'ocupado', 'mantenimiento', 'deshabilitado', 'reservado'],
    default: 'disponible',
  },

  parking: {
    type: Schema.Types.ObjectId, 
    ref: 'Parking',
    required: true,
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: false, // A spot might not have a device assigned
    unique: true, // A spot can only be controlled by one device
    sparse: true // Allows null values to be unique
  }
}, { timestamps: true });


module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);