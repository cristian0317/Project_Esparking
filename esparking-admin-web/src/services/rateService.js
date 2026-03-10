import axios from 'axios';

// La URL base de tu API para las rutas de tarifas
const API_URL = 'http://localhost:5000/api/rates/';

// Función auxiliar para obtener el token de autenticación del almacenamiento local
const getToken = () => localStorage.getItem('userToken');

/**
 * Obtiene todas las tarifas.
 * @returns {Promise} Una promesa de Axios con la lista de tarifas.
 */
const getRates = () => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/**
 * Crea una nueva tarifa.
 * @param {object} rateData - Los datos de la nueva tarifa.
 * @returns {Promise} Una promesa de Axios.
 */
const createRate = (rateData) => {
  return axios.post(API_URL, rateData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/**
 * Actualiza una tarifa existente por su ID.
 * @param {string} id - El ID de la tarifa a actualizar.
 * @param {object} rateData - Los nuevos datos para la tarifa.
 * @returns {Promise} Una promesa de Axios.
 */
const updateRate = (id, rateData) => {
  return axios.put(API_URL + id, rateData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/**
 * Elimina una tarifa por su ID.
 * @param {string} id - El ID de la tarifa a eliminar.
 * @returns {Promise} Una promesa de Axios.
 */
const deleteRate = (id) => {
  return axios.delete(API_URL + id, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// Se exportan todas las funciones para que puedan ser usadas en otros archivos,
// como en tu página TarifasPage.js
const rateService = {
  getRates,
  createRate,
  updateRate,
  deleteRate,
};

export default rateService;