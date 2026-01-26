import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users, MessageCircle, X } from 'lucide-react';

export function DiscoverRemnants({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'requests', or 'friends'
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadFriends();
  }, [user?.id]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || user?.id;
      console.log('Loading users with token:', !!token);
      console.log('Current user:', user);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/discover`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Discover API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw users data:', data);
        const filteredUsers = data.users.filter(u => u.id !== user?.id);
        console.log('Filtered users (excluding current user):', filteredUsers);
        setAllUsers(filteredUsers);
      } else {
        const errorText = await response.text();
        console.error('Discover API error:', errorText);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const token = localStorage.getItem('token') || user?.id;
      console.log('Loading friends with token:', !!token);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Friends API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Friends data loaded:', data);
        setFriends(data.friends || []);
        setFriendRequests(data.requests || []);
        setSentRequests(data.sentRequests || []);
      } else {
        const errorText = await response.text();
        console.error('Friends API error:', errorText);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    console.log('Sending friend request to userId:', userId);
    try {
      const token = localStorage.getItem('token') || user?.id;
      console.log('Token found:', !!token);
      
      if (!token) {
        console.error('No authentication token found');
        alert('Please log in to send friend requests');
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('Friend request sent successfully');
        
        // Temporarily add to sentRequests locally until API is fixed
        const targetUser = allUsers.find(u => u.id === userId);
        if (targetUser) {
          setSentRequests(prev => [...prev, targetUser]);
        }
        
        loadUsers(); // Refresh to update button states
        loadFriends(); // Refresh to update sent requests
      } else {
        const errorData = await response.text();
        console.error('Failed to send friend request:', errorData);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token') || user?.id;
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friend-request/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });
      if (response.ok) {
        loadFriends();
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const getButtonState = (targetUser) => {
    console.log('Checking button state for user:', targetUser.id);
    console.log('Friends:', friends.map(f => f.id));
    console.log('Sent requests:', sentRequests.map(r => r.id));
    console.log('Friend requests:', friendRequests.map(r => r.id));
    
    if (friends.some(f => f.id === targetUser.id)) return 'friend';
    if (sentRequests.some(r => r.id === targetUser.id)) return 'requested';
    if (friendRequests.some(r => r.id === targetUser.id)) return 'pending';
    return 'none';
  };

  const filteredUsers = allUsers.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Discover Remnants</h2>
          <button
            onClick={() => onNavigate('landing')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'discover'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search size={16} className="inline mr-2" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus size={16} className="inline mr-2" />
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'friends'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Friends ({friends.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'discover' && (
            <div className="p-6">
              {/* Search */}
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search remnants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>

              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Friend Requests</h3>
                  <div className="space-y-2">
                    {friendRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {request.displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{request.displayName}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => acceptFriendRequest(request.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                        >
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((targetUser) => {
                      const buttonState = getButtonState(targetUser);
                      return (
                        <div key={targetUser.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                              {targetUser.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{targetUser.displayName}</div>
                              <div className="text-sm text-gray-500">{targetUser.email}</div>
                              <div className="text-xs text-blue-500">{targetUser.role}</div>
                            </div>
                          </div>
                          {buttonState === 'friend' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                              Friends
                            </span>
                          ) : buttonState === 'requested' ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                              Requested
                            </span>
                          ) : buttonState === 'pending' ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                              Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => sendFriendRequest(targetUser.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center gap-1"
                            >
                              <UserPlus size={14} />
                              Add Friend
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending friend requests.
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-medium mb-4">Incoming Friend Requests</h3>
                  <div className="space-y-2">
                    {friendRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {request.displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{request.displayName}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => acceptFriendRequest(request.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                        >
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {sentRequests.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Sent Requests</h3>
                      <div className="space-y-2">
                        {sentRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                                {request.displayName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{request.displayName}</div>
                                <div className="text-sm text-gray-500">{request.email}</div>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                              Pending
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="p-6">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No friends yet. Start by discovering remnants!
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {friend.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{friend.displayName}</div>
                          <div className="text-sm text-gray-500">{friend.email}</div>
                          {friend.whatsapp && (
                            <div className="text-xs text-green-500">📱 {friend.whatsapp}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(`https://wa.me/${friend.whatsapp}`, '_blank')}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center gap-1"
                        disabled={!friend.whatsapp}
                      >
                        <MessageCircle size={14} />
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}