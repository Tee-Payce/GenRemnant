import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, Share2, ThumbsUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/LibraryPage.css';

export function LibraryPage({ posts, user, initialSearchQuery = '', onComment, onReaction }) {
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedType, setSelectedType] = useState('all');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState(null);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedType, searchQuery]);

  const filterPosts = () => {
    let result = posts;

    if (selectedType !== 'all') {
      result = result.filter((p) => p.type === selectedType || p.category === selectedType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          (p.authorName && p.authorName.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(result);
  };

  const reactionTypes = [
    { key: 'like', icon: ThumbsUp, label: 'Like' },
    { key: 'heart', icon: Heart, label: 'Heart' },
    { key: 'amen', icon: Zap, label: 'Amen' },
    { key: 'inspire', icon: MessageCircle, label: 'Inspire' },
  ];

  return (
    <div className="library-page">
      {/* Header Section */}
      <motion.div
        className="library-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Library</h1>
        <p>Explore all sermons and daily motivations</p>

        {/* Search Bar */}
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search sermons, motivations, and comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input text-slate-900 dark:text-gray-100"
          />
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All Posts
          </button>
          <button
            className={`filter-btn ${selectedType === 'sermon' ? 'active' : ''}`}
            onClick={() => setSelectedType('sermon')}
          >
            Sermons
          </button>
          <button
            className={`filter-btn ${selectedType === 'daily_motivation' ? 'active' : ''}`}
            onClick={() => setSelectedType('daily_motivation')}
          >
            Daily Motivations
          </button>
        </div>
      </motion.div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            </p>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="post-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
              >
                {/* Post Header */}
                <div className="post-header">
                  <div className="author-info">
                    <div className="avatar">{post.authorName?.charAt(0) || 'A'}</div>
                    <div>
                      <h3>{post.authorName || 'Anonymous'}</h3>
                      <span className="post-date">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`post-type-badge ${post.type || post.category}`}>
                    {(post.type === 'sermon' || post.category === 'sermon') ? '📖 Sermon' : '✨ Daily Motivation'}
                  </span>
                </div>

                {/* Post Title */}
                <h2 className="post-title">{post.title}</h2>

                {/* Post Content */}
                <div className="post-content">
                  {expandedPostId === post.id ? (
                    <p>{post.content || 'No content'}</p>
                  ) : (
                    <p>{(post.content || '').substring(0, 200)}...</p>
                  )}
                </div>

                {/* Post Summary */}
                {post.summary && (
                  <div className="post-summary">
                    <strong>Summary:</strong> {post.summary}
                  </div>
                )}

                {/* Reactions Section */}
                <div className="reactions-section">
                  <div className="reaction-counts">
                    {Object.entries(post.reactions || {}).map(([type, count]) => (
                      <span key={type} className="reaction-count">
                        {type} {count}
                      </span>
                    ))}
                  </div>

                  {user && (
                    <div className="reaction-buttons">
                      {reactionTypes.map(({ key, icon: Icon, label }) => (
                        <button
                          key={key}
                          className="reaction-btn"
                          title={label}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReaction(post.id, key);
                          }}
                        >
                          <Icon size={18} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="comments-section">
                  <h4>Comments ({post.comments?.length || 0})</h4>
                  {post.comments?.length > 0 && (
                    <div className="comments-preview max-h-48 overflow-y-auto">
                      {(expandedCommentsId === post.id ? post.comments : post.comments.slice(0, 3)).map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <strong>{comment.userName || 'User'}</strong>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                      {post.comments.length > 3 && expandedCommentsId !== post.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCommentsId(post.id);
                          }}
                          className="text-sm text-blue-500 hover:text-blue-700 text-center pt-2 w-full cursor-pointer"
                        >
                          +{post.comments.length - 3} more comments
                        </button>
                      )}
                    </div>
                  )}

                  {user && (
                    <div className="comment-input-box">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        onClick={(e) => e.stopPropagation()}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            onComment(post.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="post-actions">
                  <button className="action-btn">
                    <MessageCircle size={18} /> Comment
                  </button>
                  <button className="action-btn">
                    <Share2 size={18} /> Share
                  </button>
                  {user?.role === 'regular' && (
                    <button className="action-btn btn-upgrade">
                      Request to be a Contributor
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
