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
      color: 'text-secondary bg-secondary/15',
    },
    {
      label: 'Leads Generated',
      value: stats.totalLeads,
      icon: Users,
      trend: '+18.5%',
      color: 'text-purple-400 bg-primary/15',
    },
    {
      label: 'Conversion Rate',
      value: stats.conversionRate,
      suffix: '%',
      decimals: 1,
      icon: TrendingUp,
      trend: '+4.1%',
      color: 'text-emerald-400 bg-success/15',
    },
    {
      label: 'Revenue Pipeline',
      value: Math.round(stats.revenuePipeline / 100000),
      prefix: '₹',
      suffix: 'L',
      decimals: 1,
      icon: IndianRupee,
      trend: '+22.0%',
      color: 'text-amber-400 bg-warning/15',
    },
  ];

  const funnelColors = ['#8B5CF6', '#7C3AED', '#6366F1', '#06B6D4', '#10B981'];

  return (
    <div className="space-y-6">
      {/* AI Agent Status Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-primary/25 bg-gradient-to-r from-primary/10 via-bg-card to-secondary/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center relative">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-background animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-space font-semibold text-base">EchoSales AI Agent is Online</h2>
              <Badge variant="success">24/7 Active</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Avg Call Duration: {formatDuration(stats.avgCallDuration)} • {stats.appointmentsBooked} Appointments Booked
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/agent"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary text-white shadow-lg shadow-primary/25 transition-all"
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card hover>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400 bg-success/10 px-2 py-0.5 rounded-full">
                    {kpi.trend}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-xs text-gray-400">{kpi.label}</p>
                <div className="font-space text-2xl font-bold mt-1">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space font-semibold">Call Activity (Last 7 Days)</h3>
            <Badge variant="primary">Calls vs Qualified</Badge>
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
                    backgroundColor: '#141827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Area type="monotone" dataKey="calls" stroke="#8B5CF6" strokeWidth={2} fill="url(#callsGrad)" />
                <Area type="monotone" dataKey="qualified" stroke="#22D3EE" strokeWidth={2} fill="url(#qualGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space font-semibold">Lead Conversion Funnel</h3>
            <Badge variant="secondary">Pipeline Stages</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoConversionFunnel} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
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
            <h3 className="font-space font-semibold">Recent Calls</h3>
            <Link to="/dashboard/calls" className="text-xs text-secondary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentCalls.slice(0, 5).map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.customerName}</p>
                  <p className="text-xs text-gray-400">
                    {formatDuration(c.duration)} • {formatTimeAgo(c.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span title={c.sentiment}>{getSentimentEmoji(c.sentiment)}</span>
                  <Badge variant={c.leadScore >= 75 ? 'success' : 'primary'}>Score {c.leadScore}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space font-semibold">Recent Leads</h3>
            <Link to="/dashboard/leads" className="text-xs text-secondary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentLeads.slice(0, 5).map((l) => (
              <div
                key={l._id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{l.name}</p>
                  <p className="text-xs text-gray-400">{l.company || l.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
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
