import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { LibraryPage } from "./pages/LibraryPage";
import { DiscoverRemnants } from "./pages/DiscoverRemnants";
import { CreatePostPage } from "./pages/CreatePostPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { VisitPage } from "./pages/VisitPage";
import { AuthModal } from "./components/AuthModal";
import { PostRefreshProvider, usePostRefresh } from "./context/PostRefreshContext";
import { samplePosts } from "./data/samplePosts";
import { realtimeUpdates } from "./utils/realtimeUpdates";
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function App() {
  return (
    <PostRefreshProvider>
      <AppContent />
    </PostRefreshProvider>
  );
}

function AppContent() {
  const { refreshTrigger, triggerRefresh } = usePostRefresh();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState("landing"); // 'landing', 'create-post', 'admin', 'visit'
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [darkMode, setDarkMode] = useState(false);
  const [_isLoading, _setIsLoading] = useState(false);

  // Load published posts with comments and reactions
  const loadPublishedPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/published`);
      if (response.ok) {
        const data = await response.json();
        const postsWithInteractions = await Promise.all(
          (data.posts || []).map(async (post) => {
            try {
              // Fetch comments for this post
              const commentsRes = await fetch(`${API_URL}/api/interactions/comments/${post.id}`);
              const commentsData = commentsRes.ok ? await commentsRes.json() : { comments: [] };

              // Fetch reactions for this post
              const reactionsRes = await fetch(`${API_URL}/api/interactions/reactions/${post.id}`);
              const reactionsData = reactionsRes.ok ? await reactionsRes.json() : { reactions: [] };

              return {
                ...post,
                comments: commentsData.comments || [],
                reactions: reactionsData.reactions || [],
              };
            } catch (err) {
              console.error(`Error loading interactions for post ${post.id}:`, err);
              return post;
            }
          })
        );
        setPosts(postsWithInteractions);
      } else {
        console.error("Failed to load posts:", response.statusText);
        setPosts(samplePosts);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setPosts(samplePosts);
    }
  }, []);

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

    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }

    // Fetch published posts from API
    loadPublishedPosts();

    // Cleanup on unmount
    return () => {
      realtimeUpdates.cleanup();
    };
  }, [refreshTrigger, loadPublishedPosts]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("landing");
  };

  const handleAuthClick = (mode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const addPost = (newPost) => {
    // Trigger refresh via context
    // (new posts start as pending, so they won't show immediately)
  };

  const addComment = (postId, comment) => {
    const token = localStorage.getItem("token");
    if (!token || !comment.trim()) return;

    fetch(`${API_URL}/api/interactions/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, content: comment }),
    })
      .then((res) => res.json())
      .then(() => {
        // Trigger refresh via context
        triggerRefresh();
      })
      .catch((err) => console.error("Error adding comment:", err));
  };

  const addReaction = (postId, reactionKey) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/interactions/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, reactionType: reactionKey }),
    })
      .then((res) => res.json())
      .then(() => {
        // Trigger refresh via context
        triggerRefresh();
      })
      .catch((err) => console.error("Error adding reaction:", err));
  };

  // Determine which page to render based on user role and current page
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <LandingPage
            posts={posts}
            user={user}
            onComment={addComment}
            onReaction={addReaction}
            onNavigateLibrary={(query) => {
              setCurrentPage("library");
            }}
            onSearch={(query) => console.log("Search:", query)}
          />
        );

      case "library":
        return (
          <LibraryPage
            posts={posts}
            user={user}
            onComment={addComment}
            onReaction={addReaction}
          />
        );

      case "discover-remnants":
        return (
          <DiscoverRemnants user={user} onNavigate={setCurrentPage} />
        );

      case "create-post":
        if (!user || !["contributor", "admin"].includes(user.role)) {
          return (
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>Only contributors and admins can create posts.</p>
            </div>
          );
        }
        return (
          <CreatePostPage user={user} onPostCreate={addPost} />
        );

      case "admin":
        if (user?.role !== "admin") {
          return (
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>Only admins can access the dashboard.</p>
            </div>
          );
        }
        return <AdminDashboard user={user} />;

      case "visit":
        return <VisitPage posts={posts} user={user} />;

      default:
        return (
          <LandingPage
            posts={posts}
            user={user}
            onComment={addComment}
            onReaction={addReaction}
            onNavigateLibrary={(query) => {
              setCurrentPage("library");
            }}
            onSearch={(query) => console.log("Search:", query)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Header
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSwitchMode={(mode) => setAuthMode(mode)}
            onAuthenticate={handleLogin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
