import axios from 'axios';

const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export function setToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
export default api;
