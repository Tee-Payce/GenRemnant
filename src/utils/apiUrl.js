// Utility to ensure proper API URL formatting
export const getApiUrl = () => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};