const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema; // Asegúrate de tener esta línea

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['cajero', 'administracion', 'admin'],
    default: 'cajero',
  },
  // --- AÑADE ESTE CAMPO ---
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true // Todo usuario debe pertenecer a una organización
  },
});

// Hook para encriptar la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);