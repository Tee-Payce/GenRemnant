import React, { useState, useEffect } from "react";
import { getToken, clearToken } from "../utils/auth";
import { authAPI } from "../utils/api";
import { AuthModal } from "./AuthModal";
import { Moon, Sun } from "lucide-react";

export function Header({ view, setView, user, setUser, darkMode, setDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      fetchUser(token);
    }
  }, [user]);

  const fetchUser = async (token) => {
    try {
      setLoading(true);
      const userData = await authAPI.getMe(token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      try {
        await authAPI.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    clearToken();
    setUser(null);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <>
      <header className="backdrop-blur-sm sticky top-0 z-30 bg-white/60 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-md">
              <span className="font-extrabold text-white">GR</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Generation Remnant</h1>
              <p className="text-xs text-slate-500">Sermons • Devotionals • Daily Reminders</p>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
            <button
              onClick={() => setView("visit")}
              className={`px-3 py-2 rounded-md text-sm ${view === "visit" ? "bg-amber-50 ring-1 ring-amber-200" : "hover:bg-slate-50"}`}
            >
              Visit
            </button>
            <button
              onClick={() => setView("admin")}
              className={`px-3 py-2 rounded-md text-sm ${view === "admin" ? "bg-rose-50 ring-1 ring-rose-200" : "hover:bg-slate-50"} ${!user?.isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!user?.isAdmin}
            >
              Admin
            </button>

            {loading ? (
              <span className="text-sm text-slate-500">Loading...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
                {user.isAdmin && (
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">Admin</span>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 rounded-md bg-slate-100 text-sm hover:bg-slate-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-2 px-3 py-2 rounded-md bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 font-medium"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
