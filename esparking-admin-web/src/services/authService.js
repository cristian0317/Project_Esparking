import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const login = (email, password) => {
  return axios.post(API_URL + 'login', {
    email,
    password,
  });
};

// --- NUEVA FUNCIÓN ---
const getMe = (token) => {
  return axios.get(API_URL + 'me', {
    headers: {
      Authorization: `Bearer ${token}` // Enviamos el token para la verificación
    }
  });
};

const authService = {
  login,
  getMe, // <-- Exportamos la nueva función
};

export default authService;