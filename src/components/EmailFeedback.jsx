import React from "react";
import { sendEmailFeedback } from "../utils/shareUtils";

export function EmailFeedback({ post }) {
  return (
    <div className="mt-6 border-t pt-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">Send feedback by email</div>
        <div className="text-xs text-slate-500">Your feedback helps shape future messages.</div>
      </div>
      <div>
        <button onClick={() => sendEmailFeedback(post)} className="px-4 py-2 rounded bg-slate-800 text-white">
          Send Email
        </button>
      </div>
    </div>
  );
}
