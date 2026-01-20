import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  BarChart3,
  MessageSquare,
  Search,
  ChevronDown,
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function AdminDashboard({ user, onPostApproved }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    regularUsers: 0,
    contributors: 0,
    admins: 0,
    publishedPosts: 0,
    pendingPosts: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const token = getToken();

    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      // Load all users
      const usersRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!usersRes.ok) {
        const errorData = await usersRes.json();
        console.error('Users fetch error:', usersRes.status, errorData);
        setError(`Failed to load users: ${errorData.message || usersRes.statusText}`);
        setLoading(false);
        return;
      }

      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
      
      // Calculate stats from users
      const regularUsers = usersData.users?.filter(u => u.role === 'regular').length || 0;
      const contributors = usersData.users?.filter(u => u.role === 'contributor').length || 0;
      const admins = usersData.users?.filter(u => u.role === 'admin').length || 0;
      
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.users?.length || 0,
        regularUsers,
        contributors,
        admins,
      }));

      // Load pending posts
      const postsRes = await fetch(`${API_URL}/api/admin/posts/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPendingPosts(postsData.posts || []);
        setStats(prev => ({ ...prev, pendingPosts: postsData.posts?.length || 0 }));
      } else {
        console.error('Posts fetch error:', postsRes.status);
      }
    } catch (err) {
      setError(`Error loading admin data: ${err.message}`);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleApprovePost = async (postId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/posts/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
        setStats(prev => ({ ...prev, pendingPosts: prev.pendingPosts - 1 }));
        // Notify parent to refresh published posts
        onPostApproved?.();
      }
    } catch (err) {
      console.error('Error approving post:', err);
    }
  };

  const handleRejectPost = async (postId) => {
    if (!feedbackText.trim()) return;
    
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/posts/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, feedback: feedbackText }),
      });
      if (res.ok) {
        setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
        setFeedbackText('');
        setExpandedPostId(null);
        setStats(prev => ({ ...prev, pendingPosts: prev.pendingPosts - 1 }));
      }
    } catch (err) {
      console.error('Error rejecting post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/posts/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
        setStats(prev => ({ ...prev, pendingPosts: prev.pendingPosts - 1 }));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleSuspendUser = async (userId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/users/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
        );
      }
    } catch (err) {
      console.error('Error suspending user:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/admin/users/change-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <motion.div className="admin-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>Only administrators can access this dashboard.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, posts, and content moderation</p>
        </div>
        <div className="admin-info">
          <span>Admin: {user.displayName}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} /> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> User Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FileText size={18} /> Post Moderation
        </button>
        <button
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={18} /> Comment Moderation
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div className="tab-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>System Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon users-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                  <small>
                    {stats.regularUsers} regular • {stats.contributors} contributors •{' '}
                    {stats.admins} admins
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon posts-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-content">
                  <h3>Published Posts</h3>
                  <p className="stat-number">{stats.publishedPosts}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3>Pending Review</h3>
                  <p className="stat-number">{stats.pendingPosts}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon active-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3>Active Status</h3>
                  <p className="stat-number" style={{ color: '#22c55e' }}>
                    Operational
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <motion.div className="tab-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>User Management</h2>
              <button
                onClick={loadData}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                marginBottom: '20px',
              }}>
                {error}
              </div>
            )}

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No users found</p>
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className={`status-${user.status}`}>
                        <td>
                          <strong>{user.displayName}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="role-select"
                          >
                            <option value="regular">Regular</option>
                            <option value="contributor">Contributor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>{user.status}</span>
                        </td>
                        <td>{user.createdAt}</td>
                        <td className="action-buttons">
                          <button
                            className="action-btn suspend-btn"
                            onClick={() => handleSuspendUser(user.id)}
                            title="Suspend user"
                          >
                            Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Post Moderation Tab */}
        {activeTab === 'posts' && (
          <motion.div className="tab-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>Post Moderation</h2>
            <p className="section-subtitle">
              Review and approve pending posts before publication
            </p>

            {pendingPosts.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} />
                <h3>All Caught Up!</h3>
                <p>No pending posts to review</p>
              </div>
            ) : (
              <div className="pending-posts-list">
                {pendingPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="pending-post-card"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="post-header">
                      <div>
                        <h3>{post.title}</h3>
                        <p className="post-meta">
                          By <strong>{post.authorName}</strong> •{' '}
                          <span className={`post-type ${post.type}`}>
                            {post.type === 'sermon' ? '📖 Sermon' : '✨ Daily Motivation'}
                          </span>
                        </p>
                      </div>
                      <span className="created-date">{post.createdAt}</span>
                    </div>

                    <div className="post-body">
                      <p>{post.content}</p>
                    </div>

                    <div className="post-actions">
                      <button
                        className="action-btn btn-approve"
                        onClick={() => handleApprovePost(post.id)}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>

                      <button
                        className="action-btn btn-reject"
                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                      >
                        <AlertCircle size={16} /> Reject <ChevronDown size={16} />
                      </button>

                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>

                    {expandedPostId === post.id && (
                      <motion.div
                        className="rejection-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <textarea
                          placeholder="Provide feedback for rejection..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows="3"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleRejectPost(post.id)}
                        >
                          Send Rejection
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Comment Moderation Tab */}
        {activeTab === 'comments' && (
          <motion.div className="tab-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>Comment Moderation</h2>
            <p className="section-subtitle">Review and moderate user comments</p>

            <div className="empty-state">
              <MessageSquare size={48} />
              <h3>No Issues Reported</h3>
              <p>All comments are appropriate and visible</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
