import React, { useState } from 'react';
import { HiGlobeAlt, HiMoon, HiShieldCheck } from 'react-icons/hi';
import DashboardLayout, { GradientButton, SectionCard, StatusBadge } from '../../components/dashboard/Layout';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Customize your workspace, privacy, and profile preferences with a polished control center."
      actions={<GradientButton>Save Changes</GradientButton>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Profile Settings</h3>
              <StatusBadge label="Synced" tone="green" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Name</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-blue-400" defaultValue="Apex Admin" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Email</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-blue-400" defaultValue="admin@apexcommerce.ai" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Phone</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-blue-400" defaultValue="+1 (415) 555-0192" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Profile Image</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-blue-400" defaultValue="https://images.unsplash.com/..." />
              </label>
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="mb-4 text-xl font-semibold text-white">Change Password</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-blue-400" placeholder="Current password" type="password" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-blue-400" placeholder="New password" type="password" />
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="mb-4 text-xl font-semibold text-white">Appearance</h3>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <HiMoon className="text-lg text-blue-300" />
                <div>
                  <div className="font-semibold text-white">Dark Mode</div>
                  <div className="text-sm text-slate-400">Premium dark theme with glass layers</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                className={`relative h-7 w-14 rounded-full transition ${darkMode ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${darkMode ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <h3 className="mb-4 text-xl font-semibold text-white">Notification Preferences</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">Order updates</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">Marketing campaigns</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">Security alerts</div>
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="mb-4 text-xl font-semibold text-white">Language & Timezone</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-300">
                <HiGlobeAlt className="text-lg text-purple-300" />
                Language: English (US)
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-300">Timezone: UTC-05:00</div>
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="mb-4 text-xl font-semibold text-white">Account Security</h3>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center gap-3">
                <HiShieldCheck className="text-lg text-emerald-300" />
                <span className="text-white">Two Factor Authentication (UI)</span>
              </div>
              <StatusBadge label="Enabled" tone="green" />
            </div>
            <button type="button" className="mt-4 w-full rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">Delete Account</button>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
