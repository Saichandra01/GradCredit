import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, Zap, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from "lucide-react";

const typeConfig: Record<string, { icon: typeof Bell; bg: string; border: string; iconColor: string }> = {
  info: { icon: Info, bg: 'bg-si/20', border: 'border-sg/40', iconColor: 'text-ob' },
  success: { icon: CheckCircle2, bg: 'bg-success-500/15', border: 'border-success-500/20', iconColor: 'text-success-600' },
  warning: { icon: AlertTriangle, bg: 'bg-sg/40', border: 'border-sg/40', iconColor: 'text-si' },
  action_required: { icon: Zap, bg: 'bg-error-500/15', border: 'border-error-500/20', iconColor: 'text-error-600' },
};

interface NotificationsProps {
  onRead: () => void;
  onNavigate: (page: string) => void;
}

export default function Notifications({
  onRead,
  onNavigate,
}: NotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    setNotifications(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    onRead();
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    onRead();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <button
  onClick={() => onNavigate("dashboard")}
  className="flex items-center gap-2 text-gray-600 hover:text-black font-medium mb-4"
>
  <ArrowLeft className="w-5 h-5" />
  Back
</button>
          <h3 className="font-semibold text-ob">Notifications</h3>
          <p className="text-si text-sm">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-ob/60 hover:text-ob transition-colors">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-si">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-10 text-center">
          <Bell className="w-10 h-10 text-sg mx-auto mb-3" />
          <p className="text-si text-sm">No notifications yet. You'll receive updates here as your application progresses.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = typeConfig[n.type] ?? typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div key={n.id} className={`card p-4 flex items-start gap-3 transition-all ${!n.read ? 'ring-1 ring-ob/10' : 'opacity-70'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-ob text-sm">{n.title}</div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-ob rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-si text-xs leading-relaxed mt-0.5">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-si text-xs">
                      {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="text-xs text-ob/60 hover:text-ob transition-colors">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
