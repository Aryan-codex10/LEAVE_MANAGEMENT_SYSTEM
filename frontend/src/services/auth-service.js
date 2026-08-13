import api from './api.js';

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const registerUser = async (userDetails) => {
  const { data } = await api.post('/auth/register', userDetails);
  return data;
};
