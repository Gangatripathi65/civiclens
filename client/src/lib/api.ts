import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrfToken = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith('csrfToken='))
      ?.split('=')[1];
    if (csrfToken) {
      const token = decodeURIComponent(csrfToken);
      if (config.headers && typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('x-csrf-token', token);
      } else {
        config.headers = { ...(config.headers as Record<string, string>), 'x-csrf-token': token } as any;
      }
    }
  }
  return config;
});
