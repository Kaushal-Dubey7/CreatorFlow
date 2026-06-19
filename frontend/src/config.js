// API base URL — uses environment variable in production, localhost in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_URL;
