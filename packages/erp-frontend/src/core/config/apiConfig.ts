/**
 * Centralized API Configuration for Clorymetal ERP
 * Handles dynamic API URLs based on environment (Development vs Production)
 */

const getApiBaseUrl = () => {
  // Use VITE_API_URL environment variable if provided (standard for Vite)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback for local development
  return 'http://localhost:4000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug log to confirm current backend connection during startup (Frontend Console)
console.log(`🔌 Conectando a ERP Backend en: ${API_BASE_URL}`);

export default API_BASE_URL;
