const rawApiUrl = import.meta.env.VITE_API_URL;
let apiUrl = rawApiUrl ? rawApiUrl.trim() : '';

// If Render blueprint provides internal hostname like 'softpro-backend' without domain
if (apiUrl && !apiUrl.includes('.')) {
    apiUrl = `${apiUrl}.onrender.com`;
}

export const API_BASE_URL = apiUrl !== ''
  ? (apiUrl.startsWith('http') ? apiUrl.replace(/\/$/, '') : `https://${apiUrl}`.replace(/\/$/, ''))
  : (import.meta.env.PROD ? '' : 'https://softpro-backend.onrender.com');

