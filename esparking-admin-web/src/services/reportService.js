import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports/';
const getToken = () => localStorage.getItem('userToken');

const getFinancialSummary = () => {
  return axios.get(API_URL + 'financial-summary', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// --- FUNCIÓN CORREGIDA ---
const getDailyRevenue = () => {
  return axios.get(API_URL + 'daily-revenue', {
    // El header que faltaba
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};
const getAdvancedReport = (filters) => {
  return axios.get(API_URL + 'advanced', {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: filters // Pasamos el objeto de filtros directamente
  });
};

const reportService = {
  getFinancialSummary,
  getDailyRevenue,
  getAdvancedReport,
};

export default reportService;