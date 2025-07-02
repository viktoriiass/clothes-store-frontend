import axios from 'axios';
export async function login(username, password) {
  const res = await axios.post('http://localhost:3000/api/auth/login', { username, password });
  return res.data.token;
}

export async function register(username, email, password) {
  const res = await axios.post('http://localhost:3000/api/auth/register', { username, email, password });
  return res.data;
}

export async function forgotPassword(email) {
  const res = await axios.post('http://localhost:3000/api/auth/request-password-reset', { email });
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await axios.post(`http://localhost:3000/api/auth/reset-password/${token}`, { newPassword });
  return res.data;
}
