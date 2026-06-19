import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, getRelativeTime } from '../utils/helpers';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

const STATUS_ORDER = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal sent', label: 'Proposal Sent' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

const STATUS_COLORS = {
  'New': '#3b82f6',            // Blue
  'Contacted': '#f59e0b',      // Amber
  'Qualified': '#a855f7',      // Purple
  'Proposal Sent': '#6366f1', // Indigo
  'Won': '#10b981',            // Emerald
  'Lost': '#f43f5e',           // Rose
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { theme } = useTheme();

  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch in parallel
        const [statsRes, leadsRes, activityRes, statusRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/leads?page=1&limit=5'),
          api.get('/analytics/recent-activity'),
          api.get('/analytics/leads-by-status'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (leadsRes.data.success) setRecentLeads(leadsRes.data.data);
        if (activityRes.data.success) setActivities(activityRes.data.data);

        let rawStatusData = [];
        if (statusRes.data.success) {
          rawStatusData = statusRes.data.data;
        }

        // Map status counts, defaulting to 0 for missing ones
        const formattedStatusData = STATUS_ORDER.map(({ key, label }) => {
          const matched = rawStatusData.find(
            (item) => item.status?.toLowerCase() === key || (key === 'won' && item.status?.toLowerCase() === 'converted')
          );
          return {
            status: label,
            count: matched ? matched.count : 0,
            value: matched ? matched.value : 0,
          };
        });

        setStatusChartData(formattedStatusData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Error loading dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  // KPI configurations
  const kpiCards = [
    {
      title: 'Total Leads',
      value: stats?.totalLeads,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      bgIcon: 'bg-blue-50 dark:bg-blue-950/20',
      description: 'Leads in database',
    },
    {
      title: 'New Leads',
      value: stats?.newLeads,
      icon: <UserPlus className="w-5 h-5 text-amber-500" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-950/20',
      description: 'Awaiting first contact',
    },
    {
      title: 'Won Leads',
      value: stats?.convertedLeads,
      icon: <Target className="w-5 h-5 text-emerald-500" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/20',
      description: 'Closed successfully',
    },
    {
      title: 'Conversion Rate',
      value: stats ? `${stats.conversionRate}%` : null,
      icon: <Percent className="w-5 h-5 text-purple-500" />,
      bgIcon: 'bg-purple-50 dark:bg-purple-950/20',
      description: 'Wins / total leads',
    },
    {
      title: 'Pipeline Value',
      value: stats ? formatCurrency(stats.totalPipelineValue) : null,
      icon: <DollarSign className="w-5 h-5 text-indigo-500" />,
      bgIcon: 'bg-indigo-50 dark:bg-indigo-950/20',
      description: 'Estimated deal sum',
    },
  ];

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  const hasNoLeads = !statusChartData || statusChartData.every((item) => item.count === 0);

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* 1. KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {loading
          ? Array(5)
              .fill(null)
              .map((_, i) => (
                <Card key={i} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="circle" width="40px" height="40px" />
                  </div>
                  <Skeleton variant="title" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </Card>
              ))
          : kpiCards.map((kpi, idx) => (
              <Card key={idx} className="hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {kpi.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${kpi.bgIcon}`}>
                    {kpi.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                  {kpi.value ?? 0}
                </div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                  {kpi.description}
                </p>
              </Card>
            ))}
      </div>

      {/* 1.5. Lead Status Analytics Chart */}
      <Card className="flex flex-col min-h-[350px]">
        <div className="pb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Lead Status Analytics
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Distribution of leads across the pipeline stages
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
              <span>Leads Count</span>
            </div>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center pt-6 min-h-[220px]">
          {loading ? (
            <div className="w-full space-y-4">
              <Skeleton variant="rect" height="200px" />
            </div>
          ) : hasNoLeads ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Target className="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">No lead status data available</p>
              <p className="text-xs text-slate-400 mt-1">Create leads to populate the status distribution chart.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis 
                  dataKey="status" 
                  stroke={chartTextColor} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke={chartTextColor} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [value, 'Leads']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.status] || '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 2. Split Panels (Recent Leads & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Panel: Recent Leads */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Recent Leads
              </h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                The latest prospects added to your CRM
              </p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-grow overflow-x-auto">
            {loading ? (
              <div className="space-y-4 py-6">
                {Array(4)
                  .fill(null)
                  .map((_, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="space-y-2 w-1/3">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                      </div>
                      <Skeleton variant="text" width="20%" />
                      <Skeleton variant="text" width="15%" />
                    </div>
                  ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm font-medium">No leads registered yet</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse mt-4">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {recentLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className="group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 text-sm">
                        {lead.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-sm truncate max-w-[150px]">
                        {lead.company || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge text={lead.status} type={lead.status} />
                      </td>
                      <td className="py-3.5 pl-4 text-right font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {formatCurrency(lead.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Right Panel: Recent CRM Activities */}
        <Card className="flex flex-col">
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Audit Logs & Activity
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Real-time update stream of CRM updates
            </p>
          </div>

          <div className="flex-grow py-6 overflow-y-auto max-h-[360px] pr-2">
            {loading ? (
              <div className="space-y-5">
                {Array(3)
                  .fill(null)
                  .map((_, idx) => (
                    <div key={idx} className="flex gap-4">
                      <Skeleton variant="circle" width="36px" height="36px" className="flex-shrink-0" />
                      <div className="space-y-2 flex-grow">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm font-medium">No actions logged yet</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6">
                {activities.map((act) => (
                  <div key={act._id} className="relative pl-6 group">
                    {/* Bullet circle dot */}
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-brand-600 dark:bg-brand-500 group-hover:scale-125 transition-transform" />
                    
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {act.userId?.name || 'System'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {getRelativeTime(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
