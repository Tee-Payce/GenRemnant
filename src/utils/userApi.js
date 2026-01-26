const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const userAPI = {
  updateProfile: async (profileData, token) => {
    console.log('userAPI.updateProfile called with:', profileData, 'token:', !!token);
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API error response:', error);
      throw new Error(error.message || 'Failed to update profile');
    }

    const result = await response.json();
    console.log('API success response:', result);
    return result;
  }
};