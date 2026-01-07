// src/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/', // ให้ MSW จับเส้นทาง "/users-items" ได้ตรง ๆ
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export default apiClient;
