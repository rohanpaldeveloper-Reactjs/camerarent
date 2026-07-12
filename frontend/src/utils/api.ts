export const API_BASE = 'http://localhost:5001/api';

/**
 * Custom fetch wrapper that automatically appends the Authorization header
 * if a token exists in localStorage.
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cinerent_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
}
