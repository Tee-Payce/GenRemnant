import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { usePostRefresh } from '../context/PostRefreshContext';
import '../styles/CreatePostPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function CreatePostPage({ user, onPostCreate }) {
  const { triggerRefresh } = usePostRefresh();
  const [formData, setFormData] = useState({
    type: 'daily_motivation',
    title: '',
    content: '',
    summary: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPosts, setSubmittedPosts] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters';
    }

    if (formData.summary && formData.summary.length > 200) {
      newErrors.summary = 'Summary must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getToken = () => localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    const token = getToken();

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.message || 'Failed to submit post');
        setIsSubmitting(false);
        return;
      }

      const newPost = {
        id: data.post?.id || Date.now(),
        ...formData,
        status: 'pending',
        submittedAt: new Date().toLocaleString(),
      };

      setSubmittedPosts((prev) => [newPost, ...prev]);
      onPostCreate?.(newPost);
      
      // Trigger refresh to update the post list
      triggerRefresh();

      // Reset form
      setFormData({
        type: 'daily_motivation',
        title: '',
        content: '',
        summary: '',
      });

      setIsSubmitting(false);
    } catch (err) {
      setSubmitError(`Error: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  if (!user || !['contributor', 'admin'].includes(user.role)) {
    return (
      <motion.div
        className="create-post-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>Only contributors and admins can create posts.</p>
          <p>Request to become a contributor to unlock this feature.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="create-post-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="create-post-container">
        {/* Left Column - Form */}
        <div className="create-form-section">
          <h1>Create New Post</h1>
          <p className="subtitle">Share your thoughts and inspire the community</p>

          {submitError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '6px',
              marginBottom: '20px',
            }}>
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            {/* Post Type */}
            <div className="form-group">
              <label htmlFor="type">Post Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="daily_motivation">Daily Motivation</option>
                <option value="sermon">Sermon</option>
              </select>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Content */}
            <div className="form-group">
              <label htmlFor="content">
                Content <span className="required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your post content here..."
                rows="10"
                className={errors.content ? 'input-error' : ''}
              />
              <div className="char-count">
                {formData.content.length} characters
              </div>
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>

            {/* Summary */}
            <div className="form-group">
              <label htmlFor="summary">Summary (Optional)</label>
              <input
                id="summary"
                type="text"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Brief summary or key highlight"
              />
              <div className="char-count">
                {formData.summary.length} / 200 characters
              </div>
              {errors.summary && <span className="error-message">{errors.summary}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>

            <p className="form-note">
              Your post will be reviewed by an admin before being published.
            </p>
          </form>
        </div>

        {/* Right Column - Submitted Posts */}
        <div className="submitted-posts-section">
          <h2>Your Submitted Posts</h2>

          {submittedPosts.length === 0 ? (
            <div className="no-posts-message">
              <p>No posts submitted yet. Create your first post!</p>
            </div>
          ) : (
            <div className="submitted-posts-list">
              {submittedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  className={`submitted-post-item status-${post.status}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="post-status">
                    {post.status === 'pending' && (
                      <>
                        <Clock size={18} />
                        <span>Pending Review</span>
                      </>
                    )}
                    {post.status === 'approved' && (
                      <>
                        <CheckCircle size={18} />
                        <span>Approved</span>
                      </>
                    )}
                    {post.status === 'rejected' && (
                      <>
                        <AlertCircle size={18} />
                        <span>Rejected</span>
                      </>
                    )}
                  </div>

                  <h3>{post.title}</h3>
                  <p className="post-type">
                    {post.type === 'sermon' ? '📖 Sermon' : '✨ Daily Motivation'}
                  </p>
                  <p className="submitted-date">
                    Submitted: {post.submittedAt}
                  </p>

                  {post.status === 'rejected' && (
                    <div className="rejection-feedback">
                      <strong>Feedback:</strong>
                      <p>Please revise based on admin comments.</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
