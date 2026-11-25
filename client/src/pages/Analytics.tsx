import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Card, Button, Badge, AnimatedCounter } from '../components/ui';
import { analyticsAPI } from '../lib/api';
import { demoCallActivity, demoSentimentData, demoConversionFunnel } from '../lib/demoData';

export const Analytics: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<{
    salesPerformance: string;
    painPoints: string[];
    suggestions: string[];
    recommendedActions: string[];
  } | null>(null);

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await analyticsAPI.getInsights();
      if (res.data?.insights) {
        setInsights(res.data.insights);
        toast.success('AI Business Insights generated');
      }
    } catch {
      toast.error('Failed to generate insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-space text-2xl font-bold">Analytics & AI Insights</h2>
          <p className="text-sm text-gray-400">Real-time sales intelligence powered by Google Gemini.</p>
        </div>

        <div className="flex items-center gap-2 bg-bg-secondary border border-white/10 rounded-xl p-1">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-400">Qualified Rate</p>
          <p className="font-space text-2xl font-bold text-emerald-400 mt-1">
            <AnimatedCounter value={48.1} decimals={1} suffix="%" />
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-400">Booking Rate</p>
          <p className="font-space text-2xl font-bold text-secondary mt-1">
            <AnimatedCounter value={27.5} decimals={1} suffix="%" />
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-400">Positive Sentiment</p>
          <p className="font-space text-2xl font-bold text-primary mt-1">
            <AnimatedCounter value={58} suffix="%" />
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-400">Pipeline Value</p>
          <p className="font-space text-2xl font-bold text-amber-400 mt-1">
            <AnimatedCounter value={42.5} prefix="₹" suffix="L" decimals={1} />
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-space font-semibold mb-4">Calls Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoCallActivity}>
                <defs>
                  <linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="calls" stroke="#8B5CF6" strokeWidth={2} fill="url(#analyticsArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-space font-semibold mb-4">Sentiment Distribution</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demoSentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {demoSentimentData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#141827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-4">
              {demoSentimentData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-300">{s.name}: {s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel Bar */}
      <Card>
        <h3 className="font-space font-semibold mb-4">Conversion Funnel Breakdown</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoConversionFunnel}>
              <XAxis dataKey="stage" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#141827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="count" fill="#22D3EE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AI Business Insights */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-bg-card to-secondary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-space text-lg font-semibold">AI Business Insights</h3>
            <Badge variant="primary">Gemini Powered</Badge>
          </div>
          <Button onClick={generateInsights} loading={loadingInsights}>
            <Sparkles className="w-4 h-4" />
            Generate AI Insights
          </Button>
        </div>

        {!insights ? (
          <p className="text-sm text-gray-400">
            Click “Generate AI Insights” to analyze your stored CRM leads and call transcripts for actionable revenue recommendations.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-secondary font-medium text-sm mb-2">
                <TrendingUp className="w-4 h-4" /> Sales Performance
              </div>
              <p className="text-sm text-gray-300">{insights.salesPerformance}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-amber-400 font-medium text-sm mb-2">
                <AlertCircle className="w-4 h-4" /> Common Pain Points
              </div>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {insights.painPoints?.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-purple-400 font-medium text-sm mb-2">
                <Sparkles className="w-4 h-4" /> Conversion Suggestions
              </div>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {insights.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm mb-2">
                <CheckCircle2 className="w-4 h-4" /> Recommended Actions
              </div>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {insights.recommendedActions?.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
