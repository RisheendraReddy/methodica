const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('firebase_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default API_BASE;


