require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const parkingRoutes = require('./routes/parkingRoutes');
const spotRoutes = require('./routes/spotRoutes');
const entryRoutes = require('./routes/entryRoutes');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const rateRoutes = require('./routes/rateRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const deviceRoutes = require('./routes/deviceRoutes'); // Import device routes
const logger = (req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.originalUrl}`);
  next();
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(logger);

const MONGO_URI = process.env.MONGO_URI;

// --- Vercel-optimized MongoDB Connection ---
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log("Reusing cached MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    console.log("Creating new MongoDB connection...");
    cached.promise = mongoose.connect(MONGO_URI, opts).then(mongoose => {
      console.log("✅ ¡Conectado a MongoDB exitosamente!");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error al conectar a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

// Connect to DB on startup
connectDB();


app.use('/api/parkings', parkingRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/devices', deviceRoutes); // Use device routes

// For local development, we can still use app.listen.
// Vercel will ignore this and just use the exported module.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto http://localhost:${PORT}`);
  });
}

module.exports = app;