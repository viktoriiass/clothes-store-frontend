import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export async function login(username,password) {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  return res.data.token;
}

export async function register(username, email, password) {
  await axios.post(`${API_URL}/register`, { username, email, password });
}
