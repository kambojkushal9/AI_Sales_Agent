import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  Users,
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  Mic,
  Sparkles,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, Badge, AnimatedCounter } from '../components/ui';
import { EchoPulse } from '../components/EchoPulse';
import { analyticsAPI, callsAPI, leadsAPI } from '../lib/api';
import {
  demoDashboardStats,
  demoCallActivity,
  demoConversionFunnel,
  demoCalls,
  demoLeads,
} from '../lib/demoData';
import { formatDuration, formatTimeAgo, getSentimentEmoji } from '../lib/utils';
import { Call, Lead, DashboardStats } from '../types';

export const Overview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(demoDashboardStats);
  const [recentCalls, setRecentCalls] = useState<Call[]>(demoCalls);
  const [recentLeads, setRecentLeads] = useState<Lead[]>(demoLeads);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, callsRes, leadsRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          callsAPI.getAll(),
          leadsAPI.getAll(),
        ]);
        if (dashRes.data?.stats) setStats(dashRes.data.stats);
        if (callsRes.data?.calls?.length) setRecentCalls(callsRes.data.calls.slice(0, 5));
        if (leadsRes.data?.leads?.length) setRecentLeads(leadsRes.data.leads.slice(0, 5));
      } catch {
        // fallback to demo data seamlessly
      }
    };
    load();
  }, []);

  const kpis = [
    {
      label: 'Total Calls',
      value: stats.totalCalls,
      icon: Phone,
      trend: '+14.2%',
      color: 'text-secondary bg-secondary/10 border-secondary/25',
    },
    {
      label: 'Leads Generated',
      value: stats.totalLeads,
      icon: Users,
      trend: '+18.5%',
      color: 'text-purple-300 bg-primary/15 border-primary/25',
    },
    {
      label: 'Conversion Rate',
      value: stats.conversionRate,
      suffix: '%',
      decimals: 1,
      icon: TrendingUp,
      trend: '+4.1%',
      color: 'text-emerald-300 bg-success/10 border-success/25',
    },
    {
      label: 'Revenue Pipeline',
      value: Math.round(stats.revenuePipeline / 100000),
      prefix: '₹',
      suffix: 'L',
      decimals: 1,
      icon: IndianRupee,
      trend: '+22.0%',
      color: 'text-amber-300 bg-warning/10 border-warning/25',
    },
  ];

  const funnelColors = ['#8B5CF6', '#7C3AED', '#6366F1', '#06B6D4', '#10B981'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* AI Agent Status Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-primary/25 bg-gradient-to-r from-primary/10 via-bg-card to-secondary/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/35 flex items-center justify-center relative shrink-0">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-background animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-space font-semibold text-base text-white">
                EchoSales AI Agent is Online
              </h2>
              <Badge variant="success">24/7 Autonomous</Badge>
              <EchoPulse state="listening" bars={8} height={14} className="hidden sm:flex ml-1" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                Avg Duration: {formatDuration(stats.avgCallDuration)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {stats.appointmentsBooked} Appointments Booked
              </span>
            </div>
          </div>
        </div>
        <Link
          to="/dashboard/agent"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary via-indigo to-purple-600 hover:brightness-110 text-white shadow-lg shadow-primary/25 border border-white/10 transition-all shrink-0"
        >
          <Mic className="w-4 h-4" />
          Launch Voice Agent
        </Link>
      </Card>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card hover className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-300 bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                    {kpi.trend}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
                <div className="font-space text-2xl sm:text-3xl font-bold mt-1 text-white">
                  <AnimatedCounter
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    decimals={kpi.decimals}
                  />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-space font-semibold text-base">Call Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days • Total vs Qualified</p>
            </div>
            <Badge variant="primary">Live Telemetry</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoCallActivity}>
                <defs>
                  <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  }}
                />
                <Area type="monotone" dataKey="calls" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#callsGrad)" />
                <Area type="monotone" dataKey="qualified" stroke="#22D3EE" strokeWidth={2.5} fill="url(#qualGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-space font-semibold text-base">Lead Conversion Funnel</h3>
              <p className="text-xs text-gray-400 mt-0.5">Autonomous qualification progression</p>
            </div>
            <Badge variant="secondary">Pipeline Stages</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoConversionFunnel} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {demoConversionFunnel.map((_, i) => (
                    <Cell key={i} fill={funnelColors[i % funnelColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Recent Calls & Recent Leads */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space font-semibold text-base">Recent Calls</h3>
            <Link to="/dashboard/calls" className="text-xs text-secondary hover:underline font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentCalls.slice(0, 5).map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.045] hover:border-white/[0.1] transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDuration(c.duration)} • {formatTimeAgo(c.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span title={c.sentiment}>{getSentimentEmoji(c.sentiment)}</span>
                  <Badge variant={c.leadScore >= 75 ? 'success' : 'primary'}>Score {c.leadScore}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space font-semibold text-base">Recent Leads</h3>
            <Link to="/dashboard/leads" className="text-xs text-secondary hover:underline font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentLeads.slice(0, 5).map((l) => (
              <div
                key={l._id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.045] hover:border-white/[0.1] transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{l.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{l.company || l.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${l.leadScore}%` }}
                    />
                  </div>
                  <Badge variant={l.status === 'qualified' || l.status === 'converted' ? 'success' : 'default'}>
                    {l.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
