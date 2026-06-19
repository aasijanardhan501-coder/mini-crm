import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/helpers';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChartIcon, TrendingUp, Info } from 'lucide-react';

// Map month indices to names
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AnalyticsPage = () => {
  const { showToast } = useToast();
  const { theme } = useTheme();

  const [statusData, setStatusData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [statusRes, sourceRes, trendRes] = await Promise.all([
          api.get('/analytics/leads-by-status'),
          api.get('/analytics/leads-by-source'),
          api.get('/analytics/leads-over-time'),
        ]);

        if (statusRes.data.success) setStatusData(statusRes.data.data);
        if (sourceRes.data.success) setSourceData(sourceRes.data.data);
        
        if (trendRes.data.success) {
          // Format trend data month indices
          const formattedTrend = trendRes.data.data.map(item => ({
            ...item,
            name: `${MONTHS[item.month - 1]} ${item.year}`,
          }));
          setTrendData(formattedTrend);
        }
      } catch (error) {
        console.error('Failed to load analytics charts:', error);
        showToast('Error loading business analytics metrics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [showToast]);

  // Chart configuration constants
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  // Status color mappings
  const STATUS_COLORS = {
    new: '#3b82f6',            // Blue
    contacted: '#f59e0b',      // Amber
    qualified: '#a855f7',      // Purple
    'proposal sent': '#6366f1', // Indigo
    won: '#10b981',            // Emerald
    lost: '#f43f5e',           // Rose
    converted: '#10b981',      // Emerald (fallback)
  };

  // Source color mappings
  const SOURCE_COLORS = {
    website: '#10b981',       // Emerald
    referral: '#8b5cf6',      // Violet
    social: '#3b82f6',        // Blue
    advertisement: '#f97316', // Orange
    other: '#64748b',         // Slate
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          CRM Analytics Dashboard
        </h2>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
          Evaluate pipeline trends, status distributions, and lead channels
        </p>
      </div>

      {/* Analytics Info Callout */}
      <div className="flex gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/20 text-brand-800 dark:text-brand-300">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-normal font-medium">
          Analytics dashboard pulls live data from the database. Pipeline growth and conversions update as staff members log notes, add deals, and edit lead pipeline cards.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: 6-Month Lead Creation Trend */}
        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> 6-Month Creation & Pipeline Trend
          </h3>
          
          <div className="flex-grow">
            {loading ? (
              <Skeleton variant="rect" height="300px" />
            ) : trendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400 font-semibold">
                No historical trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(225, 73%, 57%)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(225, 73%, 57%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="name" stroke={chartTextColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Legend />
                  <Area
                    name="Leads Registered"
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(225, 73%, 57%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Pipeline Value Grouped by Status */}
        <Card className="flex flex-col min-h-[380px]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Pipeline Deal Value by Status
          </h3>

          <div className="flex-grow">
            {loading ? (
              <Skeleton variant="rect" height="280px" />
            ) : statusData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400 font-semibold">
                No pipeline data logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="status" stroke={chartTextColor} fontSize={11} tickLine={false} className="capitalize" />
                  <YAxis
                    stroke={chartTextColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Pipeline Value']}
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status.toLowerCase()] || '#cbd5e1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 3: Leads Grouped by Source */}
        <Card className="flex flex-col min-h-[380px]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-purple-500" /> Lead Source Distribution
          </h3>

          <div className="flex-grow">
            {loading ? (
              <Skeleton variant="rect" height="280px" />
            ) : sourceData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400 font-semibold">
                No source distribution data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="source"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SOURCE_COLORS[entry.source.toLowerCase()] || '#cbd5e1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="capitalize text-xs font-semibold text-slate-500 dark:text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AnalyticsPage;
