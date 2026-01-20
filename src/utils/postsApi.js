const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Posts
export const postsAPI = {
  getPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  getPostById: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  createPost: async (postData, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/posts`, { method: 'POST', headers, body: JSON.stringify(postData) });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to create post`);
    }
    return response.json();
  },

  updatePost: async (postId, postData, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { method: 'PUT', headers, body: JSON.stringify(postData) });
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  },

  deletePost: async (postId, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { method: 'DELETE', headers });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },
};
