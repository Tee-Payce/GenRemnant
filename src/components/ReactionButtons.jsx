import React, { useState, useEffect, useRef, useCallback } from "react";
import { getToken } from "../utils/auth";
import { reactionsAPI } from "../utils/api";

export function ReactionButtons({ post, user }) {
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  const reactionTypes = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'haha', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' },
  ];

  const fetchReactions = useCallback(async () => {
    try {
      const data = await reactionsAPI.getReactions(post.id);
      setReactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
      setReactions([]);
    }
  }, [post.id]);

  const fetchUserReaction = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        const reaction = await reactionsAPI.getUserReaction(post.id, token);
        setUserReaction(reaction || null);
      }
    } catch (error) {
      console.error('Failed to fetch user reaction:', error);
    }
  }, [post.id]);

  useEffect(() => {
    fetchReactions();
    if (user) {
      fetchUserReaction();
    }
  }, [post.id, user, fetchReactions, fetchUserReaction]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const handleReaction = async (reactionType) => {
    if (!user) {
      alert('Please sign in to react');
      return;
    }
    try {
      setLoading(true);
      const token = getToken();
      if (userReaction?.reactionType === reactionType) {
        await reactionsAPI.removeReaction(post.id, token);
        setUserReaction(null);
      } else {
        if (userReaction) {
          await reactionsAPI.removeReaction(post.id, token);
        }
        const newReaction = await reactionsAPI.addReaction(post.id, reactionType, token);
        setUserReaction(newReaction);
      }
      await fetchReactions();
      setShowPicker(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      alert('Failed to react');
    } finally {
      setLoading(false);
    }
  };

  const getTotalCount = () => reactions.length;
  const getUserEmoji = () => {
    const found = reactionTypes.find(r => r.type === userReaction?.reactionType);
    return found ? found.emoji : '👍';
  };

  return (
    <div className="relative inline-block">
      <style>{`
        @keyframes popIn {
          from {
            transform: translate(-50%, 8px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes emojiPop {
          from {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <button
        ref={buttonRef}
        className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
          userReaction 
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
        onClick={() => setShowPicker(!showPicker)}
        disabled={loading}
        title={user ? 'React' : 'Sign in to react'}
      >
        <span className="text-lg">{getUserEmoji()}</span>
        {getTotalCount() > 0 && <span className="text-xs font-semibold">{getTotalCount()}</span>}
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="fixed bg-white rounded-full shadow-2xl flex gap-2 p-3 border border-gray-200"
          style={{
            animation: 'popIn 0.2s ease-out',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            bottom: 'auto',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            marginTop: '-12px',
            marginBottom: '12px',
          }}
        >
          {reactionTypes.map(({ type, emoji, label }, idx) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={`text-3xl p-2 rounded-full transition-all hover:scale-125 active:scale-95 ${
                userReaction?.reactionType === type ? 'scale-125 bg-gray-100' : 'hover:bg-gray-50'
              }`}
              title={label}
              style={{
                animation: `emojiPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${idx * 0.05}s both`,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
