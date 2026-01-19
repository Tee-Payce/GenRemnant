import React from "react";
import { motion } from "framer-motion";
import { ShareControls } from "./ShareControls";
import { ReactionButtons } from "./ReactionButtons";
import { CommentSection } from "./CommentSection";
import { EmailFeedback } from "./EmailFeedback";

export function PostModal({ post, user, onClose, onComment, onReact }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <motion.article
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-50 max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-auto max-h-[85vh]"
      >
        <img src={post.image} className="w-full h-52 object-cover rounded-t-2xl" alt="cover" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{post.title}</h2>
              <div className="text-sm text-slate-400">
                {post.author?.displayName || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-2">
              <ShareControls post={post} />
              <button onClick={onClose} className="px-3 py-2 bg-slate-50 rounded">
                Close
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            <p>{post.body}</p>
          </div>

          <hr />

          <ReactionButtons post={post} user={user} onReact={onReact} />

          <CommentSection post={post} user={user} onComment={onComment} />

          <EmailFeedback post={post} />
        </div>
      </motion.article>
    </div>
  );
}
