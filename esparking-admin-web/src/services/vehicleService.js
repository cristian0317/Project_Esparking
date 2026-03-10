import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicles/';
const getToken = () => localStorage.getItem('userToken');

const getVehicles = (search = '') => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { search },
  });
};

const createVehicle = (vehicleData) => {
  return axios.post(API_URL, vehicleData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// --- FUNCIÓN CORREGIDA ---
const updateVehicle = (id, vehicleData) => {
  return axios.put(API_URL + id, vehicleData, {
    // El header que faltaba
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// --- FUNCIÓN CORREGIDA ---
const deleteVehicle = (id) => {
  return axios.delete(API_URL + id, {
    // El header que faltaba
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const vehicleService = {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};

export default vehicleService;