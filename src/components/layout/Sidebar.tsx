import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Jobs',
      path: '/jobs',
      icon: <Briefcase className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: <Calendar className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Users',
      path: '/users',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['admin'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'employee'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.allowedRoles.includes(userRole));

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-gradient-to-b from-[#312E81] via-[#2A2474] to-[#1E1B4B] text-slate-200 transition-all duration-300 border-r border-indigo-900/60 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-500/20 bg-indigo-950/20 backdrop-blur-xs">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-md shadow-indigo-950/50 shrink-0">
              <Zap className="w-5 h-5 fill-current text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-white tracking-tight text-lg leading-none">
                  Job<span className="text-cyan-400">Flow</span>
                </span>
                <span className="text-[10px] text-indigo-300 font-medium tracking-wider uppercase mt-1">
                  Smart Scheduling
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50 font-semibold'
                    : 'text-indigo-200/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}

              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-level-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-indigo-800">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Current Role Card Dock */}
        <div className="p-3 border-t border-indigo-500/20 bg-indigo-950/40">
          <div className="flex items-center px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <p className="text-[10px] uppercase tracking-wider text-indigo-300 font-medium">Access Tier</p>
                <p className="text-xs font-bold text-white capitalize">{userRole}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
