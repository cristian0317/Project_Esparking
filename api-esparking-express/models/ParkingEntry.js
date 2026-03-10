const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParkingEntrySchema = new Schema({
  folio: { // <-- NUEVO CAMPO
    type: String,
    unique: true
  },
  plate: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxLength: [7, 'La placa no puede tener más de 7 caracteres.'],
    match: [/^[A-Z0-9]+$/, 'La placa solo puede contener letras y números (sin espacios ni símbolos).']
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
  },
  totalMinutes: {
    type: Number,
  },
  totalCost: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  // --- EL CAMPO QUE FALTABA ---
  pin: {
    type: String,
    required: true,
  },
 parking: {
    type: Schema.Types.ObjectId, // <-- FALTABA ESTO
    ref: 'Parking',              // <-- FALTABA ESTO
    required: true
  },
  spot: {
    type: Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true,
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
}, { timestamps: true });

module.exports = mongoose.model('ParkingEntry', ParkingEntrySchema);