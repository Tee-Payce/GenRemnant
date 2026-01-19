import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hero } from "../components/Hero";
import { PostCard } from "../components/PostCard";
import { PostModal } from "../components/PostModal";
import { AuthModal } from "../components/AuthModal";
import { postsAPI } from "../utils/postsApi";

export function VisitPage({ user, onReact, onComment }) {
  const [selected, setSelected] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [devotionals, setDevotionals] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSermonFilter, setShowSermonFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState(null);
  const [filterInfo, setFilterInfo] = useState({});

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

  const latestSermonList = filteredPosts && filterInfo.type === 'sermon' ? filteredPosts : sermons;
  const latestDevotionalList = filteredPosts && filterInfo.type === 'devotional' ? filteredPosts : devotionals;
  const latestSermon = (latestSermonList && latestSermonList.length > 0) ? latestSermonList[0] : null;
  const latestDevotional = (latestDevotionalList && latestDevotionalList.length > 0) ? latestDevotionalList[0] : null;

  const openSermonFilter = () => setShowSermonFilter(true);
  const openDatePicker = () => setShowDatePicker(true);
  const openJoin = () => setShowAuthModal(true);

  const applySermonFilter = (topic, part) => {
    const filtered = sermons.filter((p) => {
      return (!topic || p.topic === topic) && (!part || p.part === part);
    });
    setFilteredPosts(filtered);
    setFilterInfo({ type: 'sermon', topic, part });
    setShowSermonFilter(false);
  };

  const applyDateFilter = (date) => {
    const filtered = devotionals.filter((p) => {
      const created = new Date(p.createdAt).toISOString().slice(0, 10);
      return created === date;
    });
    setFilteredPosts(filtered);
    setFilterInfo({ type: 'devotional', date });
    setShowDatePicker(false);
  };

  const clearFilters = () => {
    setFilteredPosts(null);
    setFilterInfo({});
  };

  return (
    <motion.div
      key="visit"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <Hero onViewSermons={openSermonFilter} onViewDailyByDate={openDatePicker} onJoin={openJoin} />

      {filterInfo.type && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Filtered: </span>
          <span className="text-sm font-medium">{filterInfo.type === 'sermon' ? `Topic: ${filterInfo.topic || 'All'} Part: ${filterInfo.part || 'All'}` : `Date: ${filterInfo.date}`}</span>
          <button className="ml-4 text-sm text-blue-600" onClick={clearFilters}>Clear</button>
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        {latestSermon && (
          <PostCard key={latestSermon.id} post={latestSermon} user={user} onOpen={() => setSelected(latestSermon)} onReact={onReact} />
        )}

        {latestDevotional && (
          <PostCard key={latestDevotional.id} post={latestDevotional} user={user} onOpen={() => setSelected(latestDevotional)} onReact={onReact} />
        )}
      </section>

      <AnimatePresence>
        {selected && (
          <PostModal
            post={selected}
            user={user}
            onClose={() => setSelected(null)}
            onComment={onComment}
            onReact={onReact}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal (Join) */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={() => { setShowAuthModal(false); }} />

      {/* Sermon filter modal */}
      {showSermonFilter && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSermonFilter(false)} />
          <div className="bg-white rounded-lg p-6 z-50 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-3">Filter Sermons by Topic / Part</h3>
            <SermonFilterForm sermons={sermons} onApply={applySermonFilter} onClose={() => setShowSermonFilter(false)} />
          </div>
        </div>
      )}

      {/* Date picker modal for devotionals */}
      {showDatePicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDatePicker(false)} />
          <div className="bg-white rounded-lg p-6 z-50 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-3">Select Date for Daily Devotional</h3>
            <div className="flex gap-2 items-center">
              <input type="date" className="p-2 border rounded" onChange={(e) => applyDateFilter(e.target.value)} />
              <button className="px-3 py-2 bg-slate-100 rounded" onClick={() => setShowDatePicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SermonFilterForm({ sermons, onApply, onClose }) {
  const topics = Array.from(new Set(sermons.map((s) => s.topic).filter(Boolean)));
  const parts = Array.from(new Set(sermons.map((s) => s.part).filter(Boolean)));
  const [topic, setTopic] = useState('');
  const [part, setPart] = useState('');

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Topic</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-2 border rounded">
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Part</label>
        <select value={part} onChange={(e) => setPart(e.target.value)} className="w-full p-2 border rounded">
          <option value="">All Parts</option>
          {parts.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button className="px-3 py-2 rounded bg-slate-100" onClick={onClose}>Cancel</button>
        <button className="px-3 py-2 rounded bg-amber-500 text-white" onClick={() => onApply(topic || null, part || null)}>Apply</button>
      </div>
    </div>
  );
}
