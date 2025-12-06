import axios from 'axios';


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';


const api = axios.create({
baseURL: API_BASE,
withCredentials: true,
headers: { 'Content-Type': 'application/json' },
});


// Optional: attach auth token automatically
export function setAuthToken(token) {
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
else delete api.defaults.headers.common.Authorization;
}


export default api;