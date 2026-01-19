// Share utilities for posts
export async function nativeShare(post, text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: post.title, text });
    } catch (err) {
      console.warn("share failed", err);
    }
  } else {
    // fallback: copy to clipboard
    await navigator.clipboard.writeText(text);
    alert("Share text copied to clipboard — paste into other apps.");
  }
}

export function sendEmailFeedback(post) {
  const subject = encodeURIComponent(`Feedback: ${post.title}`);
  const body = encodeURIComponent(
    `Hi team,\n\nI have feedback about the post titled "${post.title}".\n\n(Write your feedback here)\n\nBlessings,`
  );
  window.location.href = `mailto:hello@generationremnant.org?subject=${subject}&body=${body}`;
}
