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
  Bell,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../lib/utils';

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
    <div className="min-h-screen bg-background text-white flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col border-r border-white/[0.08] bg-bg-secondary/60 backdrop-blur-xl sticky top-0 h-screen z-30"
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-space font-bold text-lg tracking-tight whitespace-nowrap">
                EchoSales <span className="text-secondary">AI</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-white border border-primary/30 shadow-sm shadow-primary/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.name || 'AR')}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Alex Rivera'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.company || 'EchoSales AI'}</p>
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="relative w-64 bg-bg-secondary border-r border-white/10 h-full flex flex-col z-10"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <Link to="/" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-space font-bold text-lg">EchoSales AI</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400">
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
                          isActive ? 'bg-primary/20 text-white' : 'text-gray-400 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/[0.08] bg-bg-secondary/40 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-space font-semibold text-lg text-white">
              {currentNav?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Interactive Workspace
              </span>
            )}
            <Link
              to="/dashboard/agent"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-primary/20 text-purple-200 border border-primary/30 hover:bg-primary/30 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              Command Center
            </Link>
            <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-secondary absolute top-2 right-2" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
