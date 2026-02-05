import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import "../styles/AuthModal.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function AuthModal({ mode = "login", onClose, _onSwitchMode, onAuthenticate }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestToContribute, setRequestToContribute] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        // Call actual login API
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Login failed');
          setLoading(false);
          return;
        }

        // Save token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onAuthenticate?.(data.user);
      } else {
        if (!email || !displayName || !password || !confirmPassword) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        // Call actual register API
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            displayName, 
            password, 
            confirmPassword,
            requestToContribute 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Registration failed');
          setLoading(false);
          return;
        }

        // Save token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onAuthenticate?.(data.user);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred. Make sure the server is running.');
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
    setRequestToContribute(false);
  };

  return (
    <motion.div
      className="auth-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="auth-modal-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="auth-modal-close"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="auth-modal-header">
          <h2>{isLogin ? "Welcome Back" : "Create Your Account"}</h2>
          <p>{isLogin ? "Sign in to your GenRemnant account" : "Join our community"}</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="auth-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="contribute"
                checked={requestToContribute}
                onChange={(e) => setRequestToContribute(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="contribute">
                I want to contribute (request will be reviewed by admins)
              </label>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={handleSwitchMode}
              className="auth-toggle-btn"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
