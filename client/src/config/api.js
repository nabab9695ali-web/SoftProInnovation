const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = rawApiUrl && rawApiUrl.trim() !== ''
  ? (rawApiUrl.startsWith('http') ? rawApiUrl.replace(/\/$/, '') : `https://${rawApiUrl}`.replace(/\/$/, ''))
  : (import.meta.env.PROD ? '' : 'http://localhost:5000');
