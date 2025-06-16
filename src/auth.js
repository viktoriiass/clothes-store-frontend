import axios from 'axios';
export const API = process.env.VUE_APP_API_URL || 'http://localhost:3000';

export function register(u, e, p) {
  return axios.post(`${API}/api/users/register`, { username:u, email:e, password:p });
}
export function login(e, p) {
  return axios.post(`${API}/api/users/login`, { email:e, password:p });
}
export function setToken(token) {
  localStorage.setItem('jwt', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
export function loadToken() {
  const t = localStorage.getItem('jwt');
  if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
}
