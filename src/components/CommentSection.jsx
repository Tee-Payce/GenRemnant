import React, { useState, useEffect } from "react";
import { getToken } from "../utils/auth";
import { commentsAPI } from "../utils/api";

export function CommentSection({ post, user, onComment }) {
  const [commentBody, setCommentBody] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentsAPI.getComments(post.id);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!commentBody.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const newComment = await commentsAPI.createComment(post.id, commentBody, token);
      setComments([newComment, ...comments]);
      setCommentBody("");
      if (onComment) {
        onComment(post.id, newComment);
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const token = getToken();
      await commentsAPI.deleteComment(commentId, token);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canDeleteComment = (commentUserId) => {
    return user && (user.id === commentUserId || user.isAdmin);
  };

  return (
    <div>
      <h4 className="font-semibold mt-4">Comments</h4>
      
      <div className="space-y-3 mt-3">
        {loading ? (
          <div className="text-sm text-slate-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-slate-400">No comments yet — be the first to encourage someone.</div>
        ) : (
          comments.map((c) => {
            const authorName = c.user?.displayName || c.User?.displayName || c.displayName || c.email || 'Anonymous';
            const commentUserId = c.userId || c.user?.id || c.User?.id;

            return (
              <div key={c.id} className="p-3 bg-slate-50 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {authorName} <span className="text-xs text-slate-400">• {formatDate(c.createdAt)}</span>
                      </div>
                      <div className="text-sm">{c.text}</div>
                    </div>
                  </div>
                  {canDeleteComment(commentUserId) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4">
        {!user ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <p className="text-amber-800">Please <span className="font-medium">sign in</span> to leave a comment.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Leave a short encouraging comment"
              className="w-full p-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              rows="3"
              disabled={submitting}
            />
            <div className="text-right">
              <button 
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
