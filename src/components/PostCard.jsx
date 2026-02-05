import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ReactionButtons } from "./ReactionButtons";
import { reactionsAPI } from "../utils/api";
import { getToken } from "../utils/auth";
import { realtimeUpdates } from "../utils/realtimeUpdates";

export function PostCard({ post, user, onOpen, _onReact }) {
  const [_reactionCount, _setReactionCount] = useState(0);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const reactions = await reactionsAPI.getReactions(post.id);
        const likeCount = reactions.filter(r => r.reactionType === 'like').length;
        _setReactionCount(likeCount);

        const token = getToken();
        if (token) {
          const userReact = await reactionsAPI.getUserReaction(post.id, token);
          setUserReaction(userReact);
        }
      } catch (err) {
        console.error('Failed to load reactions', err);
      }
    };
    load();

    // Subscribe to real-time updates
    const handleReactionUpdate = (data) => {
      if (data.reaction) {
        const reactions = Array.isArray(data.reaction) ? data.reaction : [data.reaction];
        const likeCount = reactions.filter(r => r.reactionType === 'like').length;
        _setReactionCount(likeCount);
      }
    };

    realtimeUpdates.subscribe('reactions', post.id, handleReactionUpdate);

    return () => {
      realtimeUpdates.unsubscribe('reactions', post.id, handleReactionUpdate);
    };
  }, [post.id]);

  const _handleReact = async () => {
    const token = getToken();
    if (!token) {
      console.log('Please log in to react');
      return;
    }
    try {
      if (userReaction) {
        await reactionsAPI.removeReaction(post.id, token);
        setUserReaction(null);
        _setReactionCount(c => c - 1);
      } else {
        await reactionsAPI.addReaction(post.id, 'like', token);
        setUserReaction({ reactionType: 'like' });
        _setReactionCount(c => c + 1);
      }
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const authorName = post.author?.displayName || 'Unknown';
  const createdDate = new Date(post.createdAt).toLocaleDateString();

  return (
    <motion.article whileHover={{ y: -6 }} className="rounded-xl overflow-hidden bg-white shadow-md ring-1 ring-slate-100">
      <img src={post.image} alt="cover" className="w-full h-44 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{post.title}</h3>
        <p className="text-sm text-slate-500 mt-1">{post.excerpt}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">{authorName}</div>
            <div className="text-xs text-slate-300">•</div>
            <div className="text-xs text-slate-400">{createdDate}</div>
          </div>
          <div className="flex items-center gap-2">
            <ReactionButtons post={post} user={user} />
            <button onClick={() => onOpen(post)} className="text-xs px-2 py-1 rounded bg-amber-50">
              Read
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
