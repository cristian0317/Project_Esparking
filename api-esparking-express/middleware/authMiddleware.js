const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      // --- ESTA ES LA VERIFICACIÓN CLAVE ---
      // Si el token es válido pero el usuario ya no existe, detenemos la petición.
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, el usuario de este token ya no existe.' });
      }

      next(); // El usuario es válido y sí existe, continuamos.
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, el token falló.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Esta función ahora recibirá un req.user que siempre existe
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};