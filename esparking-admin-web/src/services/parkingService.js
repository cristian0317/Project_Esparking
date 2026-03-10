import axios from 'axios';

const API_URL = 'http://localhost:5000/api/parkings/';

// Función para obtener el token del localStorage
const getToken = () => localStorage.getItem('userToken');

const getAllParkings = () => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const getSpotsForParking = (parkingId) => {
  return axios.get(`${API_URL}${parkingId}/spots`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const updateSpotStatus = (spotId, status) => {
    const SPOT_API_URL = 'http://localhost:5000/api/spots/';
    // Asegúrate de que aquí se usa 'axios.put'
    return axios.put(`${SPOT_API_URL}${spotId}/status`, { status }, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
};

const createSpot = (parkingId, spotData) => {
  return axios.post(`${API_URL}${parkingId}/spots`, spotData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const deleteSpot = (spotId) => {
  // Nota: la ruta de spots es diferente, así que creamos una nueva URL base
  const SPOT_API_URL = 'http://localhost:5000/api/spots/';
  return axios.delete(`${SPOT_API_URL}${spotId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};
const getMyParking = () => {
  return axios.get(API_URL + 'my-parking', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const parkingService = {
  getAllParkings,
  getMyParking,
  getSpotsForParking,
  createSpot,   // <-- Añade
  deleteSpot,   // <-- Añade
  updateSpotStatus,
};

export default parkingService;