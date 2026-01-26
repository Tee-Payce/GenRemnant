import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { VisitPage } from "./pages/VisitPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { DiscoverRemnants } from "./pages/DiscoverRemnants";
import { samplePosts } from "./data/samplePosts";
import { realtimeUpdates } from "./utils/realtimeUpdates";

export default function App() {
  const [posts, setPosts] = useState(samplePosts);
  const [view, setView] = useState("visit"); // 'visit', 'admin', or 'dashboard'
  const [currentPage, setCurrentPage] = useState("landing"); // 'landing' or 'library'
  const [user, setUser] = useState({
    id: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'regular'
  });
  
  const [darkMode, setDarkMode] = useState(false);

  // Load user profile from database on app start
  useEffect(() => {
    // Set test token for development
    localStorage.setItem('authToken', 'test-user-123');
    
    // Load user from database
    loadUserFromDatabase();
  }, []);

  const loadUserFromDatabase = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to load user from database:', error);
    }
  };

  const handleUpdateProfile = async (userData) => {
    console.log('handleUpdateProfile called with:', userData);
    // Update user state with the complete user data from API
    setUser(userData);
    console.log('Profile updated in main app:', userData);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);



  useEffect(() => {
    // Initialize real-time updates
    realtimeUpdates.init();
    
    // Cleanup on unmount
    return () => {
      realtimeUpdates.cleanup();
    };
  }, []);

  function addPost(newPost) {
    setPosts((p) => [newPost, ...p]);
  }

  function addComment(postId, comment) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
    );
  }

  function addReaction(postId, reactionKey) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reactions: { ...p.reactions, [reactionKey]: (p.reactions[reactionKey] || 0) + 1 } } : p
      )
    );
  }

  const handlePageChange = (newPage) => {
    console.log('handlePageChange called with:', newPage);
    console.log('Current view before change:', view);
    console.log('Current page before change:', currentPage);
    
    if (newPage === "landing" || newPage === "library" || newPage === "discover-remnants") {
      setCurrentPage(newPage);
      setView("visit");
    } else if (newPage === "admin") {
      setCurrentPage("admin");
      setView("dashboard");
    } else if (newPage === "create-post") {
      setCurrentPage("create-post");
      setView("create-post");
    } else {
      setCurrentPage(newPage);
      setView(newPage);
    }
    
    console.log('View after change:', view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
        user={user} 
        setUser={setUser} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onUpdateProfile={handleUpdateProfile} 
        onAuthClick={() => console.log('Auth clicked')} 
        onLogout={() => setUser(null)}
        onNavigate={(page) => {
          console.log('onNavigate called with:', page);
          handlePageChange(page);
        }}
      />

      <main className="max-w-4xl mx-auto p-4">
        <div className="p-8 bg-red-500 text-white rounded-lg">
          <h1 className="text-4xl font-bold">EMERGENCY TEST - IF YOU SEE THIS, THE CODE IS WORKING</h1>
          <p className="text-xl">View: {view}</p>
          <p className="text-xl">CurrentPage: {currentPage}</p>
          <button 
            onClick={() => alert('Button clicked!')}
            className="mt-4 px-4 py-2 bg-white text-red-500 rounded"
          >
            Test Button
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
