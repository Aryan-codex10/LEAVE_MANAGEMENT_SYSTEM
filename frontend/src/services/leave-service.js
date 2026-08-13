import api from './api.js';

export const submitLeaveForm = async (formData) => {
  const { data } = await api.post('/leaves', formData);
  return data;
};

export const getMyLeaveHistory = async () => {
  const { data } = await api.get('/leaves/my');
  return data;
};

export const getLeaveBalance = async () => {
  const { data } = await api.get('/leaves/balance');
  return data;
};

export const getAllLeaveRequests = async () => {
  const { data } = await api.get('/leaves');
  return data;
};

export const reviewLeaveRequest = async (leaveId, status, reviewNote = '') => {
  const { data } = await api.patch(`/leaves/${leaveId}/status`, { status, reviewNote });
  return data;
};
