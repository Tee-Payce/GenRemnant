import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, ThumbsUp, Zap, X } from "lucide-react";
import { ShareControls } from "./ShareControls";

export function PostModal({ post, user, onClose, onComment, onReact }) {
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const reactionTypes = [
    { key: 'like', icon: ThumbsUp, label: 'Like' },
    { key: 'heart', icon: Heart, label: 'Heart' },
    { key: 'amen', icon: Zap, label: 'Amen' },
    { key: 'inspire', icon: MessageCircle, label: 'Inspire' },
  ];

  const handleCommentSubmit = (e) => {
    if (e.key === 'Enter' && commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 mt-50 bg-black/50"
        onClick={onClose}
      />

      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-[100] max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
        >
          <X size={24} />
        </button>

        {/* Post Image Header */}
        {post.image && (
          <img
            src={post.image}
            className="w-full h-64 object-cover"
            alt={post.title}
          />
        )}

        <div className="p-8 space-y-6">
          {/* Post Header */}
          <div className="post-header">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {post.authorName?.charAt(0) || post.author?.displayName?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{post.authorName || post.author?.displayName || 'Anonymous'}</h3>
                  <span className="text-sm text-slate-500">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                (post.type === 'sermon' || post.category === 'sermon')
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {(post.type === 'sermon' || post.category === 'sermon') ? '📖 Sermon' : '✨ Daily Motivation'}
              </span>
            </div>
          </div>

          {/* Post Title */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h2>
          </div>

          {/* Post Summary */}
          {post.summary && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                <strong>Summary:</strong> {post.summary}
              </p>
            </div>
          )}

          {/* Post Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.body || post.content || 'No content available'}
            </p>
          </div>

          <hr className="dark:border-gray-700" />

          {/* Reactions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Reaction Counts */}
              <div className="flex gap-3 flex-wrap">
                {post.reactions && Object.entries(post.reactions).map(([type, count]) => (
                  count > 0 && (
                    <span key={type} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-slate-700 dark:text-slate-300">
                      {type} {count}
                    </span>
                  )
                ))}
              </div>

              {/* Reaction Buttons */}
              {user && (
                <div className="flex gap-2">
                  {reactionTypes.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => onReact(post.id, key)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      title={label}
                    >
                      <Icon size={20} className="text-slate-600 dark:text-slate-400 hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="dark:border-gray-700" />

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Comments ({post.comments?.length || 0})
            </h3>

            {/* Existing Comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {(showAllComments ? post.comments : post.comments.slice(0, 3)).map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-400 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-slate-900 dark:text-white">
                        {comment.userName || comment.user?.displayName || 'User'}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {comment.date ? new Date(comment.date).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{comment.content || comment.body}</p>
                  </div>
                ))}
                {post.comments.length > 3 && !showAllComments && (
                  <button 
                    onClick={() => setShowAllComments(true)}
                    className="text-sm text-blue-500 hover:text-blue-700 text-center pt-2 w-full cursor-pointer"
                  >
                    +{post.comments.length - 3} more comments
                  </button>
                )}
              </div>
            )}

            {/* Comment Input */}
            {user && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={handleCommentSubmit}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {!user && (
              <p className="text-center text-slate-500 text-sm py-4">
                Sign in to comment and react
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium">
              <MessageCircle size={18} />
              Comment
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>

        {/* Share Modal */}
        <ShareControls 
          post={post}
          user={user}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </motion.article>
    </div>
  );
}
