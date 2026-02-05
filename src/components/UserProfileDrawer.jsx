import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, User, Phone, Instagram, Facebook, Edit, Eye, Users } from 'lucide-react';
import { userAPI } from '../utils/userApi';
import { getToken } from '../utils/auth';

export function UserProfileDrawer({ user, isOpen, onClose, onUpdateProfile, onNavigate }) {
  const [view, setView] = useState('view'); // 'view' or 'edit'
  const [profileData, setProfileData] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        const _response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (_response.ok) {
          const data = await _response.json();
          setProfileData(data.user);
          setFormData(data.user);
          return;
        }
      }
      // Fallback to user prop if API fails
      setProfileData(user);
      setFormData(user);
    } catch (error) {
      console.error('Failed to load profile from database:', error);
      setProfileData(user);
      setFormData(user);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user, loadProfileData]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, loadProfileData]);

  const setFormData = (data) => {
    setDisplayName(data?.displayName || '');
    setWhatsapp(data?.whatsapp || '');
    setInstagram(data?.instagram || '');
    setTiktok(data?.tiktok || '');
    setFacebook(data?.facebook || '');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const updateData = { displayName, whatsapp, instagram, tiktok, facebook };
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await userAPI.updateProfile(updateData, token);
      
      // Fetch fresh user data from API after successful update
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Update local profile data
        setProfileData(userData.user);
        setFormData(userData.user);
        
        // Call parent update function with fresh data
        if (onUpdateProfile) {
          onUpdateProfile(userData.user);
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setView('view');
      }, 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const profileDrawer = createPortal(
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-[9999] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {view === 'view' ? 'Profile' : 'Edit Profile'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView(view === 'view' ? 'edit' : 'view')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title={view === 'view' ? 'Edit Profile' : 'View Profile'}
                >
                  {view === 'view' ? <Edit size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                  {(profileData?.displayName || user?.displayName)?.charAt(0) || 'U'}
                </div>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                  {user?.role}
                </span>
              </div>

              {view === 'view' ? (
                // View Mode
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">
                        <User size={16} className="inline mr-1" />
                        Display Name
                      </label>
                      <p className="text-gray-900 dark:text-white">{profileData?.displayName || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">
                        <Phone size={16} className="inline mr-1" />
                        WhatsApp Number
                      </label>
                      <p className="text-gray-900 dark:text-white">{profileData?.whatsapp || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">
                        <Instagram size={16} className="inline mr-1" />
                        Instagram Handle
                      </label>
                      <p className="text-gray-900 dark:text-white">{profileData?.instagram || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">
                        🎵 TikTok Handle
                      </label>
                      <p className="text-gray-900 dark:text-white">{profileData?.tiktok || 'Not set'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">
                        <Facebook size={16} className="inline mr-1" />
                        Facebook Profile
                      </label>
                      <p className="text-gray-900 dark:text-white">{profileData?.facebook || 'Not set'}</p>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          onClose();
                          if (typeof onNavigate === 'function') {
                            onNavigate('discover-remnants');
                          }
                        }}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                      >
                        <Users size={16} />
                        Discover Remnants
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Edit Mode
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between">
                      <span>{error}</span>
                      <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                      Profile updated successfully!
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <User size={16} className="inline mr-1" />
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone size={16} className="inline mr-1" />
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Instagram size={16} className="inline mr-1" />
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      🎵 TikTok Handle
                    </label>
                    <input
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Facebook size={16} className="inline mr-1" />
                      Facebook Profile
                    </label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="facebook.com/username"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );

  return profileDrawer;
}