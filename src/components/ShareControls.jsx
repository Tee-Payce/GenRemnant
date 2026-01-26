import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Share2, Users, MessageCircle, Instagram, Facebook } from 'lucide-react';

export function ShareControls({ post, user, isOpen, onClose }) {
  const [shareType, setShareType] = useState('full'); // 'full' or 'summary'
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const isContributorOrAdmin = user?.role === 'contributor' || user?.role === 'admin';

  // Load friends when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadFriends();
    }
  }, [isOpen, user]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareToRemnant = () => {
    const content = shareType === 'full' 
      ? (post.body || post.content || 'No content available')
      : (post.summary || post.excerpt || (post.body || post.content || '').substring(0, 200) + '...');
    const message = `📖 ${post.title}\n\n${content}\n\n- Shared from GenRemnant`;
    
    // Create WhatsApp broadcast message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareToFriends = () => {
    const friendsWithWhatsApp = friends.filter(friend => friend.whatsapp);
    
    if (friendsWithWhatsApp.length === 0) {
      alert('No friends with WhatsApp numbers found!');
      return;
    }
    
    const content = shareType === 'full' 
      ? (post.body || post.content || 'No content available')
      : (post.summary || post.excerpt || (post.body || post.content || '').substring(0, 200) + '...');
    const message = `📖 ${post.title}\n\n${content}\n\n- Shared from GenRemnant`;
    
    friendsWithWhatsApp.forEach(friend => {
      const whatsappUrl = `https://wa.me/${friend.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
    
    alert(`Shared with ${friendsWithWhatsApp.length} friends!`);
  };

  const handleShareToSocialMedia = (platform) => {
    const content = shareType === 'full' 
      ? (post.body || post.content || 'No content available')
      : (post.summary || post.excerpt || (post.body || post.content || '').substring(0, 200) + '...');
    const statusTemplate = generateStatusTemplate(post.title, content, platform);
    
    // Copy to clipboard for manual sharing
    navigator.clipboard.writeText(statusTemplate);
    alert(`${platform} status copied to clipboard!`);
  };

  const generateStatusTemplate = (title, content, platform) => {
    const maxLength = platform === 'instagram' ? 2200 : platform === 'facebook' ? 63206 : 150;
    const truncatedContent = content.length > maxLength ? content.substring(0, maxLength - 50) + '...' : content;
    
    return `✨ ${title} ✨\n\n${truncatedContent}\n\n#GenRemnant #Faith #Inspiration`;
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Share2 size={20} />
              Share Post
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Share Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Share Version</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShareType('full')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  shareType === 'full'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Full Post
              </button>
              <button
                onClick={() => setShareType('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  shareType === 'summary'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Summary
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {isContributorOrAdmin && (
              <button
                onClick={handleShareToRemnant}
                className="w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-3 transition-colors"
              >
                <Users size={20} />
                <div className="text-left">
                  <div className="font-medium">Share with the Remnant</div>
                  <div className="text-sm opacity-90">Send to all WhatsApp numbers</div>
                </div>
              </button>
            )}

            <button
              onClick={handleShareToFriends}
              disabled={loading || friends.length === 0}
              className="w-full p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-3 transition-colors"
            >
              <MessageCircle size={20} />
              <div className="text-left">
                <div className="font-medium">
                  {loading ? 'Loading...' : `Share with Friends (${friends.filter(f => f.whatsapp).length})`}
                </div>
                <div className="text-sm opacity-90">
                  {friends.length === 0 ? 'No friends found' : 'Send to all friends with WhatsApp'}
                </div>
              </div>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleShareToSocialMedia('instagram')}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg flex flex-col items-center gap-1 transition-colors"
              >
                <Instagram size={20} />
                <span className="text-xs">Instagram</span>
              </button>
              
              <button
                onClick={() => handleShareToSocialMedia('tiktok')}
                className="p-3 bg-black hover:bg-gray-800 text-white rounded-lg flex flex-col items-center gap-1 transition-colors"
              >
                <span className="text-lg">🎵</span>
                <span className="text-xs">TikTok</span>
              </button>
              
              <button
                onClick={() => handleShareToSocialMedia('facebook')}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-1 transition-colors"
              >
                <Facebook size={20} />
                <span className="text-xs">Facebook</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}