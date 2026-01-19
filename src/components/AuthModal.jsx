import React, { useState } from "react";
import { setToken } from "../utils/auth";
import { authAPI } from "../utils/api";

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestToContribute, setRequestToContribute] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(email, password);
      } else {
        response = await authAPI.register(email, displayName, password, confirmPassword, requestToContribute);
      }

      if (response.token) {
        setToken(response.token);
        onAuthSuccess(response.user);
        onClose();
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDisplayName("");
      } else {
        setAuthError(response.message || "Authentication failed");
      }
    } catch (error) {
      setAuthError(error.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-slate-400 hover:text-slate-600 transition-colors"
            >
              ×
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {!isLogin && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            {!isLogin && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requestToContribute}
                  onChange={(e) => setRequestToContribute(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Request to contribute (request will be reviewed by admin)</span>
              </label>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 font-medium transition-colors"
            >
              {authLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setDisplayName("");
              }}
              className="text-blue-500 hover:underline font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
