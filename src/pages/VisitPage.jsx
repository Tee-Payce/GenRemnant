import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingPage } from "./LandingPage";
import { LibraryPage } from "./LibraryPage";
import { Hero } from "../components/Hero";
import { PostCard } from "../components/PostCard";
import { PostModal } from "../components/PostModal";
import { AuthModal } from "../components/AuthModal";
import { postsAPI } from "../utils/postsApi";

export function VisitPage({ user, onReact, onComment, currentPage = "landing", setCurrentPage = () => {} }) {
  const [selected, setSelected] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [devotionals, setDevotionals] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSermonFilter, setShowSermonFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState(null);
  const [filterInfo, setFilterInfo] = useState({});
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const all = await postsAPI.getPosts();
        setPosts(all);
        const s = all.filter((p) => p.category === 'sermon');
        const d = all.filter((p) => p.category === 'devotional');
        setSermons(s);
        setDevotionals(d);
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    };
    load();
  }, []);

  const handleNavigateLibrary = (searchQuery = "") => {
    setLibrarySearchQuery(searchQuery);
    if (typeof setCurrentPage === 'function') {
      setCurrentPage("library");
    }
  };

  // Landing Page View
  if (currentPage === "landing") {
    return (
      <motion.div
        key="landing"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
      >
        <LandingPage
          posts={posts}
          user={user}
          onNavigateLibrary={handleNavigateLibrary}
        />
      </motion.div>
    );
  }

  // Library Page View
  if (currentPage === "library") {
    return (
      <motion.div
        key="library"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
      >
        <LibraryPage
          posts={posts}
          user={user}
          initialSearchQuery={librarySearchQuery}
          onComment={onComment}
          onReaction={onReact}
        />
      </motion.div>
    );
  }

  // Default: Landing Page
  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <LandingPage
        posts={posts}
        user={user}
        onNavigateLibrary={handleNavigateLibrary}
      />
    </motion.div>
  );
}
