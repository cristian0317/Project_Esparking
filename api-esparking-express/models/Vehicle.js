const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleSchema = new Schema({
  plate: {
    type: String,
    required: [true, 'La placa es obligatoria.'],
    uppercase: true,
    trim: true,
    maxLength: [7, 'La placa no puede tener más de 7 caracteres.'],
    match: [/^[A-Z0-9]+$/, 'La placa solo puede contener letras y números (sin espacios ni símbolos).']
  },
  type: {
    type: String,
    required: true,
    enum: ['carro', 'moto'],
  },
  color: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ['regular', 'vip', 'residente'],
    default: 'regular',
  },
  status: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo',
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, { timestamps: true });

// --- ESTA ES LA LÓGICA CORRECTA ---
// La combinación de "placa + organización" debe ser única.
VehicleSchema.index({ plate: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);