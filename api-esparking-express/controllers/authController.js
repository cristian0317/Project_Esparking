const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- Función para registrar un nuevo usuario (CORREGIDA) ---
exports.register = async (req, res) => {
  try {
    // 1. Obtenemos todos los datos del body, incluyendo 'organization'
    const { name, email, password, role, organization } = req.body;

    // 2. Verificamos que nos hayan enviado un ID de organización
    if (!organization) {
        return res.status(400).json({ message: 'El ID de la organización es requerido.' });
    }

    const newUser = new User({ 
        name, 
        email, 
        password, 
        role, 
        organization // 3. Se lo pasamos al nuevo usuario
    });
    
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }
    res.status(400).json({ message: 'Error al registrar usuario.', error });
  }
};

// --- Función para iniciar sesión (ACTUALIZADA) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    
    // 4. AÑADIMOS 'organization' AL TOKEN
    // Esto es CRUCIAL para que el resto de la API sepa a qué empresa pertenece el usuario
    const payload = {
      id: user._id,
      role: user.role,
      organization: user.organization 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(200).json({ 
        token, 
        user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            organization: user.organization 
        } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor.', error });
  }
};

// --- Función para obtener datos del usuario (sin cambios) ---
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};