const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RateSchema = new Schema({
  vehicleType: {
    type: String,
    required: true,
    enum: ['carro', 'moto'],
    // unique: true, <-- ¡¡¡ELIMINAMOS ESTA LÍNEA!!!
  },
  rateType: {
    type: String,
    required: true,
    enum: ['por_hora', 'por_minuto', 'tarifa_fija'],
    default: 'por_hora',
  },
  amount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, { timestamps: true });

// --- ESTA ES LA NUEVA REGLA ---
// Creamos un índice compuesto que asegura que la combinación de 
// vehicleType + organization sea única.
RateSchema.index({ vehicleType: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Rate', RateSchema);