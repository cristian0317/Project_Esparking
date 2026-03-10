const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParkingSchema = new Schema({
  name: {
    type: String,
    required: true, // El nombre es obligatorio
  },
  address: {
    type: String,
    required: true,
  },
  // Guardaremos la ubicación para poder usar mapas en el futuro
  location: {
    type: {
      type: String,
      enum: ['Point'], // Solo puede ser 'Point'
      default: 'Point',
    },
    coordinates: {
      type: [Number], // Un array de números [longitud, latitud]
      required: true,
    },
  },
  totalSpots: {
    type: Number,
    required: true,
  },
  availableSpots: {
    type: Number,
    default: function() {
        // Por defecto, todos los lugares están disponibles al crear
        return this.totalSpots;
    }
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true, // Todo estacionamiento pertenece a una organización
  },
  folioPrefix: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxLength: 7, // Forzamos a que sean 3 letras, ej. "CEN"
  },
  folioCounter: {
    type: Number,
    default: 0 // El contador para este estacionamiento específico
  },
}, { timestamps: true }); // timestamps añade automáticamente la fecha de creación y actualización

// Creamos un índice geoespacial para búsquedas por ubicación
ParkingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Parking', ParkingSchema);