// Get token from URL query params or localStorage
export const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (token) {
    localStorage.setItem('token', token);
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return token;
  }
  
  return localStorage.getItem('token');
};

// Clear token
export const clearToken = () => {
  localStorage.removeItem('token');
};

// Get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
