import axios from 'axios'; // <-- Importamos axios directamente

const API_URL = 'http://localhost:5000/api/organizations/';
const getToken = () => localStorage.getItem('userToken');

const getOrganizationById = (id) => {
  return axios.get(API_URL + id, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

const organizationService = {
  getOrganizationById,
};

export default organizationService;