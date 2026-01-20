import React, { useState } from "react";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/Header.css";

export function Header({
  user,
  currentPage,
  setCurrentPage,
  onAuthClick,
  onLogout,
  darkMode,
  setDarkMode,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const getNavItems = () => {
    const items = [
      { id: "landing", label: "Home", icon: "🏠" },
    ];

    if (user) {
      if (["contributor", "admin"].includes(user.role)) {
        items.push({ id: "create-post", label: "Create Post", icon: "✍️" });
      }
      if (user.role === "admin") {
        items.push({ id: "admin", label: "Dashboard", icon: "⚙️" });
      }
    }

    return items;
  };

  return (
    <header className="header">
      <motion.div
        className="header-container"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="header-logo">
          <button
            onClick={() => handleNavClick("landing")}
            className="logo-btn"
          >
            <span className="logo-text">GenRemnant</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {getNavItems().map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">{user.displayName?.charAt(0)}</div>
                <div className="user-details">
                  <span className="user-name">{user.displayName}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>

              <button
                className="logout-btn"
                onClick={onLogout}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn-login"
                onClick={() => onAuthClick("login")}
              >
                Sign In
              </button>
              <button
                className="btn-signup"
                onClick={() => onAuthClick("register")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <motion.nav
          className="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {getNavItems().map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`mobile-nav-item ${currentPage === item.id ? "active" : ""}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </motion.nav>
      )}
    </header>
  );
}
