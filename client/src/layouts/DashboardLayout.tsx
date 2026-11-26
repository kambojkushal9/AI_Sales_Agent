import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Mic,
  Users,
  BookOpen,
  Calendar,
  Phone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../lib/utils';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { PageTransition } from '../components/PageTransition';
import { EchoPulse } from '../components/EchoPulse';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/agent', label: 'AI Voice Agent', icon: Mic },
  { path: '/dashboard/leads', label: 'Leads & CRM', icon: Users },
  { path: '/dashboard/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { path: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { path: '/dashboard/calls', label: 'Call History', icon: Phone },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isDemoMode } = useAuth();
  const location = useLocation();

  const currentNav = navItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen bg-background text-white flex relative overflow-x-hidden">
      <AnimatedBackground variant="dashboard" />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 78 : 252 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col border-r border-white/[0.07] bg-bg-secondary/70 backdrop-blur-2xl sticky top-0 h-screen z-30"
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.07]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-indigo to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-space font-bold text-lg tracking-tight whitespace-nowrap">
                EchoSales <span className="text-secondary">AI</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-indigo/15 to-secondary/10 border border-primary/30 shadow-sm shadow-primary/10"
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 relative z-10 ${isActive ? 'text-secondary' : ''}`} />
                {!collapsed && <span className="truncate relative z-10">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.025] border border-white/[0.05]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.name || 'AR')}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'Alex Rivera'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.company || 'EchoSales AI'}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-64 bg-bg-secondary border-r border-white/10 h-full flex flex-col z-10"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <Link to="/" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-space font-bold text-lg">EchoSales AI</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? 'bg-primary/20 text-white border border-primary/30'
                            : 'text-gray-400 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Compact Top Bar */}
        <header className="h-16 border-b border-white/[0.07] bg-background/60 backdrop-blur-2xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="font-space font-semibold text-base sm:text-lg text-white tracking-tight">
                {currentNav?.label || 'Dashboard'}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[11px] text-gray-400">
                <EchoPulse state="listening" bars={5} height={12} />
                Aria Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Interactive Workspace
              </span>
            )}
            <Link
              to="/dashboard/agent"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-primary/25 to-secondary/20 text-white border border-primary/35 hover:border-secondary/50 transition-all"
            >
              <Mic className="w-3.5 h-3.5 text-secondary" />
              <span className="hidden sm:inline">Command Center</span>
            </Link>
          </div>
        </header>

        {/* Page Content with smooth route entrance */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
