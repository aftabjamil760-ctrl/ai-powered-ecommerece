import React from 'react';
import SectionHeader from './home/SectionHeader';

export default function CustomerPageShell({ eyebrow, title, description, action, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          {action && <div className="mt-8">{action}</div>}
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {children}
      </main>
    </div>
  );
}
