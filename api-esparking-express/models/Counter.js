const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchema = new Schema({
  _id: { type: String, required: true }, // Nombre del contador (ej. "folioTicket")
  seq: { type: Number, default: 0 }    // El número actual
});

module.exports = mongoose.model('Counter', CounterSchema);