import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { VisitPage } from "./pages/VisitPage";
import { AdminPage } from "./pages/AdminPage";
import { samplePosts } from "./data/samplePosts";
import { realtimeUpdates } from "./utils/realtimeUpdates";

export default function App() {
  const [posts, setPosts] = useState(samplePosts);
  const [view, setView] = useState("visit"); // 'visit' or 'admin'
  const [currentPage, setCurrentPage] = useState("landing"); // 'landing' or 'library'
  const [user, setUser] = useState(null);
  
  const [darkMode, setDarkMode] = useState(false);

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
    if (newPage === "landing" || newPage === "library") {
      setCurrentPage(newPage);
    } else {
      setView(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Header currentPage={currentPage} setCurrentPage={handlePageChange} user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="max-w-4xl mx-auto p-4">
        
        <AnimatePresence mode="wait">
          {view === "visit" ? (
            <VisitPage posts={posts} user={user} currentPage={currentPage} setCurrentPage={handlePageChange} onReact={addReaction} onComment={addComment} />
          ) : (
            <AdminPage user={user} />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
