import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  Brain,
  BarChart3,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Play,
  ShieldCheck,
  Zap,
  Languages,
  Activity,
} from 'lucide-react';
import { AiOrb, OrbState } from '../components/AiOrb';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { EchoPulse } from '../components/EchoPulse';
import { ScrollReveal } from '../components/ScrollReveal';
import { AnimatedCounter } from '../components/ui';

const features = [
  {
    icon: Mic,
    title: 'Voice Intelligence',
    desc: 'Natural, low-latency voice conversations in English, Hindi, and Hinglish with real-time acoustic visualization.',
    accent: 'text-secondary bg-secondary/10 border-secondary/25',
  },
  {
    icon: Brain,
    title: 'Autonomous Agent',
    desc: 'Powered by Google Gemini function calling — reasons, selects tools, updates CRM, and books demos autonomously.',
    accent: 'text-purple-300 bg-primary/15 border-primary/25',
  },
  {
    icon: BarChart3,
    title: 'Smart Qualification',
    desc: 'Real-time 0–100 lead scoring based on budget, timeline, authority, sentiment, and buying intent.',
    accent: 'text-emerald-300 bg-success/10 border-success/25',
  },
  {
    icon: BookOpen,
    title: 'Knowledge RAG',
    desc: 'Upload PDFs, Markdown, or text playbooks. Answers are strictly grounded in your verified company data.',
    accent: 'text-amber-300 bg-warning/10 border-warning/25',
  },
  {
    icon: Calendar,
    title: 'Auto Scheduling',
    desc: 'Checks live availability, prevents double-bookings, and schedules product demos mid-conversation.',
    accent: 'text-cyan-300 bg-secondary/10 border-secondary/25',
  },
  {
    icon: Sparkles,
    title: 'Business Insights',
    desc: 'AI-generated executive summaries, pain point extraction, objection patterns, and revenue analytics.',
    accent: 'text-pink-300 bg-pink-500/10 border-pink-500/25',
  },
];

const steps = [
  {
    num: '01',
    title: 'Upload Knowledge',
    desc: 'Drop your product catalogs, pricing guides, and FAQs. Our RAG pipeline chunks and embeds them automatically.',
  },
  {
    num: '02',
    title: 'Configure Agent',
    desc: 'Customize your AI representative’s persona, greeting, sales pitch, and target languages in seconds.',
  },
  {
    num: '03',
    title: 'Launch & Convert',
    desc: 'Your AI agent handles inbound & outbound conversations 24/7, qualifies leads, and books demos into your CRM.',
  },
];

const orbStateDescriptions: Record<OrbState, string> = {
  idle: 'Standing by for incoming prospect voice stream',
  listening: 'Capturing speech & detecting buyer intent',
  thinking: 'Querying RAG knowledge & selecting CRM tools',
  speaking: 'Delivering natural, grounded voice response',
  completed: 'Call summarized & CRM record updated',
};

export const LandingPage: React.FC = () => {
  const [orbState, setOrbState] = useState<OrbState>('listening');

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <AnimatedBackground variant="landing" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-indigo to-secondary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-space font-bold text-lg tracking-tight">
              EchoSales <span className="text-secondary">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#command-center" className="hover:text-white transition-colors">Command Center</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/agent"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-primary via-indigo to-purple-600 hover:brightness-110 shadow-lg shadow-primary/25 border border-white/10 transition-all"
            >
              Launch Agent
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-subtle text-xs font-medium text-gray-200 mb-7">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary font-semibold">Autonomous AI Sales Intelligence</span>
              <span className="text-white/20">•</span>
              <span className="text-gray-400">Gemini Powered</span>
            </div>

            <h1 className="font-space text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.06] tracking-[-0.03em] mb-6">
              Your next best salesperson{' '}
              <span className="gradient-text-animated block sm:inline">
                is already listening.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-9 max-w-xl">
              EchoSales AI conducts natural voice conversations, qualifies leads in real time, grounds every answer in your knowledge base, and books demos directly into your CRM — 24/7.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard/agent"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-medium bg-gradient-to-r from-primary via-indigo to-purple-600 hover:brightness-110 text-white shadow-xl shadow-primary/30 border border-white/15 transition-all"
              >
                <Mic className="w-4 h-4" />
                Launch AI Sales Agent
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium glass glass-hover text-gray-200"
              >
                <Play className="w-4 h-4 text-secondary" />
                Explore the platform
              </a>
            </div>

            {/* Trust & Capability Strip */}
            <div className="mt-10 pt-8 border-t border-white/[0.07] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-secondary shrink-0" />
                <span>English, Hindi & Hinglish</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Grounded RAG Citations</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span>Autonomous CRM & Calendar</span>
              </div>
            </div>
          </motion.div>

          {/* Right Signature AI Sales Orb Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center"
          >
            <div className="glass rounded-3xl p-7 sm:p-9 w-full max-w-md flex flex-col items-center relative overflow-hidden">
              {/* Top status bar */}
              <div className="w-full flex items-center justify-between text-xs mb-4">
                <span className="inline-flex items-center gap-1.5 text-gray-400 font-medium">
                  <Activity className="w-3.5 h-3.5 text-secondary" />
                  Aria • Voice Core
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="my-2">
                <AiOrb state={orbState} size="lg" />
              </div>

              <EchoPulse state={orbState} bars={22} height={28} className="mt-3" />

              <div className="mt-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  {orbState}
                </p>
                <p className="text-xs text-gray-400 mt-1 h-4">
                  {orbStateDescriptions[orbState]}
                </p>
              </div>

              {/* Interactive State Selector */}
              <div className="mt-6 flex flex-wrap justify-center gap-1.5 p-1.5 rounded-2xl bg-black/30 border border-white/[0.06] w-full">
                {(['idle', 'listening', 'thinking', 'speaking', 'completed'] as OrbState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrbState(st)}
                    className={`flex-1 min-w-[60px] px-2.5 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                      orbState === st
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metrics Strip */}
        <ScrollReveal delay={0.1} className="mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Calls Handled', value: 10000, suffix: '+', sub: 'Autonomous voice sessions' },
              { label: 'Lead Accuracy', value: 95, suffix: '%', sub: 'BANT & intent scoring' },
              { label: 'Conversion Lift', value: 3, suffix: 'x', sub: 'Faster demo scheduling' },
              { label: 'Autonomous Uptime', value: 24, suffix: '/7', sub: 'Zero missed inquiries' },
            ].map((stat, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-6">
                <div className="font-space text-3xl sm:text-4xl font-bold gradient-text">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-medium text-white mt-1.5">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Platform Capabilities
            </span>
            <h2 className="font-space text-3xl sm:text-4xl font-bold mt-2 mb-4 tracking-tight">
              Enterprise-Grade <span className="gradient-text">Agentic Sales</span>
            </h2>
            <p className="text-gray-400">
              Every capability required to turn cold inquiries into qualified, scheduled pipeline automatically.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={idx} delay={idx * 0.06}>
                <div className="glass glass-hover rounded-2xl p-6 h-full flex flex-col">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${f.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-space text-lg font-semibold mb-2 text-white">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Deployment
            </span>
            <h2 className="font-space text-3xl sm:text-4xl font-bold mt-2 mb-4 tracking-tight">
              Live in <span className="text-secondary">Three Steps</span>
            </h2>
            <p className="text-gray-400">From raw product docs to an autonomous revenue-generating voice agent.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.08}>
              <div className="glass glass-hover rounded-2xl p-7 relative h-full">
                <span className="font-space text-xs font-bold tracking-widest text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">
                  STEP {s.num}
                </span>
                <h3 className="font-space text-xl font-semibold mt-4 mb-2.5">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Command Center Preview */}
      <section id="command-center" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <ScrollReveal>
          <div className="glass rounded-3xl p-8 lg:p-12 border border-primary/20 relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                  <Sparkles className="w-3.5 h-3.5" />
                  Signature Experience
                </span>
                <h2 className="font-space text-3xl sm:text-4xl font-bold mt-2.5 mb-4 tracking-tight">
                  The AI Sales Command Center
                </h2>
                <p className="text-gray-400 mb-7 leading-relaxed">
                  Watch your AI agent reason in real time: live voice transcription, sentiment detection, dynamic 0–100 lead scoring, autonomous tool execution, and instant demo booking.
                </p>
                <Link
                  to="/dashboard/agent"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-primary via-indigo to-secondary text-white shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
                >
                  Open Command Center
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="glass-subtle rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-gray-200 font-medium">Live Call • Rajesh Kumar (TechCorp)</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">Lead Score: 85/100</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3.5 max-w-[88%] text-gray-200">
                    “We have 50 sales reps and want to automate lead qualification within 30 days.”
                  </div>
                  <div className="bg-primary/15 border border-primary/30 rounded-2xl p-3.5 max-w-[88%] ml-auto text-white">
                    “Our Growth Plan fits your 50-rep workflow. I’ve checked tomorrow’s calendar — would 10:00 AM work for a live demo?”
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-full text-[11px] bg-secondary/15 text-cyan-300 border border-secondary/30">
                    Tool: search_knowledge_base
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] bg-success/15 text-emerald-300 border border-success/30">
                    Tool: book_appointment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <ScrollReveal>
          <h2 className="font-space text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Start qualifying leads, answering product questions, and booking demos 24/7.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary via-indigo to-purple-600 hover:brightness-110 text-white shadow-xl shadow-primary/30 border border-white/15 transition-all"
          >
            Enter Workspace
            <ArrowRight className="w-5 h-5" />
          </Link>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] py-8 px-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} EchoSales AI — Autonomous AI Sales Voice Agent. Built with Google Gemini.
      </footer>
    </div>
  );
};
