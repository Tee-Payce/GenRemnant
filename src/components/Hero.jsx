import React from "react";

export function Hero({ onViewSermons, onViewDailyByDate, onJoin }) {
  return (
    <section className="rounded-2xl p-6 bg-gradient-to-r from-white via-amber-50 to-white ring-1 ring-amber-100 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-extrabold">Generation Remnant — Feed the Flame</h2>
          <p className="mt-2 text-slate-600">Daily sermons and devotionals to strengthen the remnant — read, react, and share.</p>
          <div className="mt-4 flex gap-3">
            <button onClick={onViewSermons} className="px-4 py-2 rounded-md ring-1 ring-amber-300 font-medium">
              View Sermons by Topic/Part
            </button>
            <button onClick={onViewDailyByDate} className="px-4 py-2 rounded-md bg-amber-500 text-white font-medium">
              Select Daily by Date
            </button>
            <button onClick={onJoin} className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium">
              Join the Remnant
            </button>
          </div>
        </div>
        <div className="w-48 h-32 rounded-xl overflow-hidden shadow-lg hidden md:block">
          <img src="https://picsum.photos/400/260?random=9" alt="hero" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}
