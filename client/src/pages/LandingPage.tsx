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
  CheckCircle2,
  Play,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AiOrb, OrbState } from '../components/AiOrb';
import { AnimatedCounter } from '../components/ui';

const features = [
  {
    icon: Mic,
    title: 'Voice Intelligence',
    desc: 'Natural, low-latency voice conversations in English, Hindi, and Hinglish with real-time audio visualization.',
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
  {
    icon: Brain,
    title: 'Autonomous Agent',
    desc: 'Powered by Google Gemini function calling — reasons, selects tools, updates CRM, and books demos autonomously.',
    color: 'text-purple-400 bg-primary/10 border-primary/20',
  },
  {
    icon: BarChart3,
    title: 'Smart Qualification',
    desc: 'Real-time 0–100 lead scoring based on budget, timeline, authority, sentiment, and buying intent.',
    color: 'text-emerald-400 bg-success/10 border-success/20',
  },
  {
    icon: BookOpen,
    title: 'Knowledge RAG',
    desc: 'Upload PDFs, Markdown, or text playbooks. Answers are strictly grounded in your verified company data.',
    color: 'text-amber-400 bg-warning/10 border-warning/20',
  },
  {
    icon: Calendar,
    title: 'Auto Scheduling',
    desc: 'Checks live availability, prevents double-bookings, and schedules product demos mid-conversation.',
    color: 'text-cyan-400 bg-secondary/10 border-secondary/20',
  },
  {
    icon: Sparkles,
    title: 'Business Insights',
    desc: 'AI-generated executive summaries, pain point extraction, objection patterns, and revenue analytics.',
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
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

export const LandingPage: React.FC = () => {
  const [orbState, setOrbState] = useState<OrbState>('idle');

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      {/* Subtle background grid & radial lights */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-60" />
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-space font-bold text-xl tracking-tight">
            EchoSales <span className="text-secondary">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#command-center" className="hover:text-white transition-colors">Command Center</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard/agent"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-lg shadow-primary/25 transition-all"
          >
            Launch AI Agent
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium text-secondary mb-6">
              <Zap className="w-3.5 h-3.5" />
              Powered by Google Gemini 2.0 & Autonomous Tool Calling
            </div>

            <h1 className="font-space text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Your Next Sales Superstar{' '}
              <span className="gradient-text">Never Sleeps.</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">
              Meet the autonomous AI sales agent that listens, understands, qualifies, and converts — around the clock. Built with real-time voice, RAG intelligence, and instant CRM automation.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard/agent"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary text-white shadow-xl shadow-primary/30 transition-all"
              >
                <Mic className="w-5 h-5" />
                Launch AI Agent
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium glass glass-hover text-gray-200"
              >
                <Play className="w-4 h-4 text-secondary" />
                Explore the Platform
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" /> English, Hindi & Hinglish
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-secondary" /> Grounded RAG Citations
              </span>
            </div>
          </motion.div>

          {/* Interactive Orb Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Ready
              </div>

              <AiOrb state={orbState} size="lg" />

              <p className="mt-6 text-sm font-medium text-gray-300 capitalize">
                State: <span className="text-secondary">{orbState}</span>
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(['idle', 'listening', 'thinking', 'speaking'] as OrbState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrbState(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                      orbState === st
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Calls Handled', value: 10000, suffix: '+' },
            { label: 'Lead Accuracy', value: 95, suffix: '%' },
            { label: 'Conversion Lift', value: 3, suffix: 'x' },
            { label: 'Autonomous Uptime', value: 24, suffix: '/7' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <div className="font-space text-3xl sm:text-4xl font-bold gradient-text">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-space text-3xl sm:text-4xl font-bold mb-4">
            Enterprise-Grade <span className="gradient-text">Agentic Sales</span>
          </h2>
          <p className="text-gray-400">
            Every capability required to turn cold inquiries into qualified, scheduled pipeline automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass glass-hover rounded-2xl p-6"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-space text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-space text-3xl sm:text-4xl font-bold mb-4">
            Live in <span className="text-secondary">Three Steps</span>
          </h2>
          <p className="text-gray-400">From raw product docs to an autonomous revenue-generating voice agent.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-6 relative"
            >
              <span className="font-space text-4xl font-bold text-white/10">{s.num}</span>
              <h3 className="font-space text-xl font-semibold mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Command Center Preview */}
      <section id="command-center" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-8 lg:p-12 border border-primary/20 relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Signature Experience
              </span>
              <h2 className="font-space text-3xl sm:text-4xl font-bold mt-2 mb-4">
                The AI Sales Command Center
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Watch your AI agent reason in real time: live voice transcription, sentiment detection, dynamic 0–100 lead scoring, autonomous tool execution, and instant demo booking.
              </p>
              <Link
                to="/dashboard/agent"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25"
              >
                Open Command Center
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="glass rounded-2xl p-5 space-y-3 bg-bg-secondary/90">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-3">
                <span>Live Call • Rajesh Kumar (TechCorp)</span>
                <span className="text-emerald-400 font-medium">Lead Score: 85/100</span>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="bg-white/5 rounded-xl p-3 max-w-[85%]">
                  “We have 50 sales reps and want to automate lead qualification within 30 days.”
                </div>
                <div className="bg-primary/20 border border-primary/30 rounded-xl p-3 max-w-[85%] ml-auto">
                  “Our Growth Plan fits your 50-rep workflow. I’ve checked tomorrow’s calendar — would 10:00 AM work for a live demo?”
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
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
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-space text-3xl sm:text-5xl font-bold mb-4">
          Ready to Transform Your Sales?
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Start qualifying leads, answering product questions, and booking demos 24/7.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary text-white shadow-xl shadow-primary/30 transition-all"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-8 px-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} EchoSales AI — Autonomous AI Sales Voice Agent. Built with Google Gemini.
      </footer>
    </div>
  );
};
