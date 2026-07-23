import React from 'react';

export default function FeedbackForm() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="text-lg font-semibold">Send Feedback</h2>
      <form className="mt-4 space-y-3">
        <input placeholder="Subject" className="w-full rounded border px-3 py-2" />
        <textarea placeholder="Your feedback" className="w-full rounded border px-3 py-2 h-28" />
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-white">Send</button>
      </form>
    </div>
  );
}
