import React from "react";
import { nativeShare } from "../utils/shareUtils";

export function ShareControls({ post }) {
  // In a real app: create graphic with html2canvas or server-side image generator.
  const shareTextFull = `${post.title}\n\n${post.body}\n\n— Generation Remnant`;
  const shareTextSummary = `${post.title}\n\n${post.climax}\n\n— Generation Remnant`;

  return (
    <div className="flex gap-2">
      <button onClick={() => nativeShare(post, shareTextSummary)} className="px-3 py-2 rounded bg-slate-50 text-sm">Share Summary</button>
      <button onClick={() => nativeShare(post, shareTextFull)} className="px-3 py-2 rounded bg-amber-50 text-sm">Share Full</button>
      {/* In production, add an option: `Export as Image` which uses html2canvas to render a styled card and then share the generated blob. */}
    </div>
  );
}
