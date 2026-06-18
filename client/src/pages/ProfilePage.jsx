import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../api/axios';
import {
  User, Mail, ShieldCheck, Calendar, Clock,
  Target, PhoneCall, TrendingUp, MessageSquare,
  Loader2, Crown, Briefcase, Eye,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format an ISO date string as "Jun 18, 2026" */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

/** Return relative time string: "2 hours ago", "3 days ago", etc. */
const timeAgo = (iso) => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24)  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days  < 30)  return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(iso);
};

// ─── Role Badge ───────────────────────────────────────────────────────────────

const roleMeta = {
  admin:   { label: 'Admin',   Icon: Crown,     classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700' },
  manager: { label: 'Manager', Icon: Briefcase, classes: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-700' },
  viewer:  { label: 'Viewer',  Icon: Eye,       classes: 'bg-purple-100 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-700' },
};

const RoleBadge = ({ role }) => {
  const meta = roleMeta[role] || roleMeta.viewer;
  const { Icon, label, classes } = meta;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${classes}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// ─── Read-Only Info Row ───────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, loading }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-900/40',   border: 'border-blue-100 dark:border-blue-800/40' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-100 dark:border-emerald-800/40' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-900/40', border: 'border-violet-100 dark:border-violet-800/40' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600 dark:text-amber-400',  iconBg: 'bg-amber-100 dark:bg-amber-900/40',   border: 'border-amber-100 dark:border-amber-800/40'  },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default ${c.bg} ${c.border}`}>
      {/* Decorative circle */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-20 bg-current" />

      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${c.iconBg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
      ) : (
        <p className={`text-3xl font-extrabold ${c.icon} mb-1`}>{value}</p>
      )}
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name,    setName]    = useState(user?.name  || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Fetch CRM stats on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await api.get('/auth/profile/stats');
        if (res.data.success) setStats(res.data.data);
      } catch {
        // silently fail — stats are non-critical
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile({ name, email });
    setLoading(false);
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Profile Header ── */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex-shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold truncate">{user?.name || 'Your Profile'}</h2>
          <p className="text-sm text-brand-100 truncate mb-1.5">{user?.email}</p>
          <RoleBadge role={user?.role} />
        </div>
      </div>

      {/* ── CRM Statistics ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Your CRM Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Target}        label="Total Leads"     value={stats?.totalLeads     ?? 0} color="blue"   loading={statsLoading} />
          <StatCard icon={PhoneCall}     label="Contacted"       value={stats?.contactedLeads ?? 0} color="amber"  loading={statsLoading} />
          <StatCard icon={TrendingUp}    label="Converted"       value={stats?.convertedLeads ?? 0} color="green"  loading={statsLoading} />
          <StatCard icon={MessageSquare} label="Notes Added"     value={stats?.notesAdded     ?? 0} color="violet" loading={statsLoading} />
        </div>
      </div>

      {/* ── Account Information (Read-Only) ── */}
      <Card>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={Calendar}
            label="Member Since"
            value={formatDate(user?.createdAt)}
            sub={timeAgo(user?.createdAt)}
          />
          <InfoRow
            icon={Clock}
            label="Last Login"
            value={user?.lastLogin ? timeAgo(user.lastLogin) : 'No record yet'}
            sub={user?.lastLogin ? formatDate(user.lastLogin) : ''}
          />
        </div>
      </Card>

      {/* ── Edit Profile Form ── */}
      <Card>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Profile Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Role — read-only with badge */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Account Role
            </label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <RoleBadge role={user?.role} />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Managed by administration
              </span>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};

export default ProfilePage;
