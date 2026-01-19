const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Authentication
export const authAPI = {
  register: async (email, displayName, password, confirmPassword, requestToContribute = false) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, displayName, password, confirmPassword, requestToContribute }),
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getMe: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

// Comments
export const commentsAPI = {
  getComments: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`);
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Failed to fetch comments');
    return json;
  },

  createComment: async (postId, text, token) => {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, text }),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  },

  deleteComment: async (commentId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
  },

  updateComment: async (commentId, text, token) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },
};

// Reactions
export const reactionsAPI = {
  getReactions: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/reactions/post/${postId}`);
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Failed to fetch reactions');
    return json;
  },

  getUserReaction: async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/reactions/user/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Failed to fetch user reaction');
    return json;
  },

  addReaction: async (postId, reactionType, token) => {
    const response = await fetch(`${API_BASE_URL}/api/reactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, reactionType }),
    });
    if (!response.ok) throw new Error('Failed to add reaction');
    return response.json();
  },

  removeReaction: async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/reactions/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to remove reaction');
    return response.json();
  },
};

// Admin
export const adminAPI = {
  getStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getUsers: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getComments: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getReactions: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  deleteUser: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  deleteComment: async (commentId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
  },
  approveUser: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to approve user');
    return response.json();
  },
};
