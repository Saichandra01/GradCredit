import { useState } from 'react';
import { Bell, Shield, Moon, Globe, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from "lucide-react";

type Notifications = { email: boolean; sms: boolean; portal: boolean; loan: boolean; visa: boolean };

const Toggle = ({ k, label, desc, notifications, onToggle }: { k: keyof Notifications; label: string; desc: string; notifications: Notifications; onToggle: (k: keyof Notifications, v: boolean) => void }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-sg/20 last:border-0">
    <div>
      <div className="font-medium text-ob text-sm">{label}</div>
      <div className="text-si text-xs mt-0.5">{desc}</div>
    </div>
    <button
      onClick={() => onToggle(k, !notifications[k])}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifications[k] ? 'bg-ob' : 'bg-sg'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications[k] ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

import type { NavId } from "../Portal";

export default function SettingsPage({
  onNavigate,
}: {
  onNavigate: (id: NavId) => void;
}) {
  const [notifications, setNotifications] = useState({ email: true, sms: false, portal: true, loan: true, visa: true });
  const [saved, setSaved] = useState(false);

  const upd = (k: keyof Notifications, v: boolean) => setNotifications(p => ({ ...p, [k]: v }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

return (
  <div className="max-w-2xl mx-auto space-y-5">

    <button
      type="button"
      onClick={() => onNavigate("dashboard")}
      className="flex items-center gap-2 text-gray-600 hover:text-black font-medium mb-4"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>

    {saved && (
      <div className="flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Settings saved.
      </div>
    )}

    {/* Notifications */}
      {saved && <div className="flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Settings saved.</div>}

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-ob/60" />
          <h3 className="font-semibold text-ob">Notification Preferences</h3>
        </div>
        <Toggle k="portal" label="Portal Notifications" desc="In-app alerts for application updates, document status, and new messages." notifications={notifications} onToggle={upd} />
        <Toggle k="email" label="Email Notifications" desc="Receive important updates via email." notifications={notifications} onToggle={upd} />
        <Toggle k="sms" label="SMS Alerts" desc="Text messages for critical updates only." notifications={notifications} onToggle={upd} />
        <Toggle k="loan" label="Loan Status Updates" desc="Notifications when your loan application status changes." notifications={notifications} onToggle={upd} />
        <Toggle k="visa" label="Visa Reminders" desc="Reminders for visa appointment, document deadlines." notifications={notifications} onToggle={upd} />
        <button onClick={save} className="btn-primary text-sm py-2.5 mt-4">Save Preferences</button>
      </div>

      {/* Security */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-ob/60" />
          <h3 className="font-semibold text-ob">Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-ob text-sm">Change Password</div>
              <div className="text-si text-xs">Update your account password.</div>
            </div>
            <button
              onClick={async () => {
                const { data: userData } = await supabase.auth.getUser();
                if (userData.user?.email) {
                  await supabase.auth.resetPasswordForEmail(userData.user.email);
                  alert('Password reset email sent!');
                }
              }}
              className="btn-secondary text-xs py-2 px-3"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-sg/20">
            <div>
              <div className="font-medium text-ob text-sm">Active Sessions</div>
              <div className="text-si text-xs">You are currently signed in on 1 device.</div>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-xs text-error-500 font-medium hover:underline">
              Sign Out All
            </button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-error-500" />
          <h3 className="font-semibold text-error-500">Danger Zone</h3>
        </div>
        <div className="flex items-start justify-between gap-4 p-4 border border-error-100 bg-error-50 rounded-xl">
          <div>
            <div className="font-medium text-error-700 text-sm">Delete Account</div>
            <div className="text-error-600 text-xs mt-0.5">Permanently delete your account and all associated data. This action cannot be undone.</div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                alert('Please contact support at info@pathfindersoverseas.com to delete your account.');
              }
            }}
            className="shrink-0 px-3 py-1.5 border border-error-300 text-error-600 text-xs font-semibold rounded-lg hover:bg-error-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
