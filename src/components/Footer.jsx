import React from "react";

export function Footer() {
  return (
    <footer className="mt-12 p-6 text-center text-sm text-slate-500">
      <div>Generation Remnant — © {new Date().getFullYear()}</div>
      <div>Built with prayer, Tailwind, and a sprinkle of motion ✨</div>
    </footer>
  );
}
