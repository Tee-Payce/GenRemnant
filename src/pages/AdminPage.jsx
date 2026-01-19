import React, { useState, useEffect } from "react";
import { getToken } from "../utils/auth";
import { postsAPI } from "../utils/postsApi";
import { adminAPI } from "../utils/api";

export function AdminPage({ user }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [climax, setClimax] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("devotional");
  const [topic, setTopic] = useState("");
  const [part, setPart] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState([]);

  const submitPost = async (e) => {
    e.preventDefault();
    
    if (!user?.isAdmin) {
      setError("You must be an admin to create posts");
      return;
    }

    if (!title.trim() || !body.trim()) {
      setError("Title and body are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();
      const newPost = await postsAPI.createPost(
        {
          title,
          excerpt: excerpt || null,
          body,
          climax: climax || null,
          image: image || null,
          category,
          topic: topic || null,
          part: part || null,
        },
        token
      );

      setSuccess("Post published successfully!");
      setTitle("");
      setExcerpt("");
      setBody("");
      setClimax("");
      setImage("");
      setCategory("devotional");
    } catch (err) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPending = async () => {
      if (!user?.isAdmin) return;
      try {
        const token = getToken();
        const allUsers = await adminAPI.getUsers(token);
        const requests = allUsers.filter(u => u.requestedContributor === true);
        setPending(requests);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };
    loadPending();
  }, [user]);

  const handleApprove = async (userId) => {
    try {
      const token = getToken();
      await adminAPI.approveUser(userId, token);
      setPending((p) => p.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-sm text-slate-500 mt-2">Only admins can access this page. Please sign in as an admin.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100">
      <h2 className="text-xl font-bold">Admin — Create New Post</h2>
      <p className="text-sm text-slate-500">Create sermons and devotionals. Provide a short "Climax" — this is used for summary shares.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={submitPost} className="mt-4 grid gap-2">
        <div>
          <label className="text-sm font-medium">Post Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="devotional">Daily Devotional</option>
            <option value="sermon">Sermon</option>
          </select>
        </div>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          required
        />

        <input
          placeholder="Short excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        <textarea
          placeholder="Full body / sermon"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 h-40"
          required
        />

        <input
          placeholder="Climax point (used for summary shares)"
          value={climax}
          onChange={(e) => setClimax(e.target.value)}
          className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        {category === 'sermon' && (
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Topic (e.g. Faith, Worship)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              placeholder="Part (e.g. 1, 2, A)"
              value={part}
              onChange={(e) => setPart(e.target.value)}
              className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        <input
          placeholder="Cover image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Publishing..." : "Publish Post"}
        </button>
      </form>

      <div className="mt-6 text-sm text-slate-500">
        <p><strong>Posts are saved to the database</strong> and will persist across sessions.</p>
        <p>Only admin users (email: {process.env.REACT_APP_ADMIN_EMAIL || 'tkpat3@gmail.com'}) can create posts.</p>
      </div>

      {pending.length > 0 && (
        <div className="mt-6 bg-slate-50 p-4 rounded">
          <h3 className="font-bold mb-2">Pending Contributor Requests</h3>
          <ul className="space-y-2">
            {pending.map(u => (
              <li key={u.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{u.displayName} ({u.email})</div>
                  <div className="text-xs text-slate-500">Requested on {new Date(u.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <button onClick={() => handleApprove(u.id)} className="px-3 py-1 bg-amber-500 text-white rounded">Approve</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
