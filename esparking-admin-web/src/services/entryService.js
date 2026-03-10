import axios from 'axios';

const API_URL = 'http://localhost:5000/api/entries/';
const getToken = () => localStorage.getItem('userToken');

// Obtiene solo las entradas que están activas (vehículos dentro)
const getActiveEntries = () => {
  return axios.get(API_URL + 'active', { // Asumiremos que crearemos esta ruta en el backend
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// Registra una nueva entrada
const checkIn = (plate, spotId) => {
  return axios.post(API_URL + 'check-in', { plate, spotId }, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// Registra la salida de un vehículo por su placa
const checkOut = (plate, pin) => {
  return axios.patch(API_URL + `check-out/${plate}`, { pin }, {
     headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const getCompletedEntries = (search = '') => {
  return axios.get(API_URL + 'completed', {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { search },
  });
};

const entryService = {
  getActiveEntries,
  checkIn,
  checkOut,
  getCompletedEntries,
};



export default entryService;