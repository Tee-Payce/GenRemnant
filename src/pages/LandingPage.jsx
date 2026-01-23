import React, { useState } from 'react';
import { Search, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostModal } from '../components/PostModal';
import '../styles/LandingPage.css';

export function LandingPage({ posts, user, onNavigateLibrary = () => {}, onComment, onReaction }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Get latest sermon and daily motivation
  const latestSermon = posts.find((p) => p.type === 'sermon' || p.category === 'sermon');
  const latestMotivation = posts.find((p) => p.type === 'daily_motivation' || p.category === 'devotional');

  const handleSearchNavigate = () => {
    if (searchQuery.trim() && typeof onNavigateLibrary === 'function') {
      onNavigateLibrary(searchQuery);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>The Generation Remnant</h1>
        <p><span className='text-yellow-300'>Romans 11:5</span> "Even so then at this present time there is a remnant, according to the election of grace."</p>

        {/* Search Bar */}
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search sermons, motivations, and comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => {
              if (e.key === 'Enter') {
                handleSearchNavigate();
              }
            }}
            className="search-input text-slate-900 dark:text-gray-100"
          />
          <button
            onClick={handleSearchNavigate}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Search
          </button>
        </div>
      </motion.div>

      {/* Latest Posts Section */}
      <div className="posts-feed">
        <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Latest Sermon */}
          {latestSermon ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="post-card"
            >
              {/* Post Header */}
              <div className="post-header">
                <div className="author-info">
                  <div className="avatar">{latestSermon.authorName?.charAt(0) || 'A'}</div>
                  <div>
                    <h3>{latestSermon.authorName || 'Anonymous'}</h3>
                    <span className="post-date">
                      {new Date(latestSermon.publishedAt || latestSermon.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="post-type-badge sermon">
                  📖 Sermon
                </span>
              </div>

              {/* Post Title */}
              <h2 className="post-title">{latestSermon.title}</h2>

              {/* Post Content Preview */}
              <div className="post-content">
                <p>{(latestSermon.content || '').substring(0, 200)}...</p>
              </div>

              {/* Post Summary */}
              {latestSermon.summary && (
                <div className="post-summary">
                  <strong>Summary:</strong> {latestSermon.summary}
                </div>
              )}

              {/* Read Full Button */}
              <button
                onClick={() => setSelectedPost(latestSermon)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Read Full Sermon
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="post-card no-posts"
            >
              <p>No sermons yet. Check back soon!</p>
            </motion.div>
          )}

          {/* Latest Daily Motivation */}
          {latestMotivation ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="post-card"
            >
              {/* Post Header */}
              <div className="post-header">
                <div className="author-info">
                  <div className="avatar">{latestMotivation.authorName?.charAt(0) || 'A'}</div>
                  <div>
                    <h3>{latestMotivation.authorName || 'Anonymous'}</h3>
                    <span className="post-date">
                      {new Date(latestMotivation.publishedAt || latestMotivation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="post-type-badge daily_motivation">
                  ✨ Daily Motivation
                </span>
              </div>

              {/* Post Title */}
              <h2 className="post-title">{latestMotivation.title}</h2>

              {/* Post Content Preview */}
              <div className="post-content">
                <p>{(latestMotivation.content || '').substring(0, 200)}...</p>
              </div>

              {/* Post Summary */}
              {latestMotivation.summary && (
                <div className="post-summary">
                  <strong>Summary:</strong> {latestMotivation.summary}
                </div>
              )}

              {/* Read Full Button */}
              <button
                onClick={() => setSelectedPost(latestMotivation)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Read Full Motivation
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="post-card no-posts"
            >
              <p>No daily motivations yet. Check back soon!</p>
            </motion.div>
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => {
              if (typeof onNavigateLibrary === 'function') {
                onNavigateLibrary();
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <LinkIcon size={18} />
            View All in Library
          </button>
        </motion.div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostModal
            post={selectedPost}
            user={user}
            onClose={() => setSelectedPost(null)}
            onComment={onComment}
            onReact={onReaction}
            className="mt-50"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
