// src/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/', 
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export default apiClient;
