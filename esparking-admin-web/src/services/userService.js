import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';
const getToken = () => localStorage.getItem('userToken');

const getUsers = () => {
    return axios.get(API_URL, { headers: { Authorization: `Bearer ${getToken()}` } });
};

const createUser = (userData) => {
    return axios.post(API_URL, userData, { headers: { Authorization: `Bearer ${getToken()}` } });
};

const updateUser = (id, userData) => {
    return axios.put(API_URL + id, userData, { headers: { Authorization: `Bearer ${getToken()}` } });
};

const deleteUser = (id) => {
    return axios.delete(API_URL + id, { headers: { Authorization: `Bearer ${getToken()}` } });
};

const userService = { getUsers, createUser, updateUser, deleteUser };
export default userService;