import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Zap, LayoutDashboard, Briefcase, Calendar, Users, BarChart3, Settings } from 'lucide-react';
import type { UserRole } from '../../types';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  if (!isOpen) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, allowedRoles: ['admin', 'manager', 'employee'] },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase className="w-5 h-5" />, allowedRoles: ['admin', 'manager', 'employee'] },
    { name: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" />, allowedRoles: ['admin', 'manager', 'employee'] },
    { name: 'Users', path: '/users', icon: <Users className="w-5 h-5" />, allowedRoles: ['admin'] },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" />, allowedRoles: ['admin', 'manager'] },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" />, allowedRoles: ['admin', 'manager', 'employee'] },
  ];

  const filteredItems = navItems.filter((item) => item.allowedRoles.includes(userRole));

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Content */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-[#312E81] via-[#2A2474] to-[#1E1B4B] text-slate-200 border-r border-indigo-900/60 shadow-2xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white font-bold shadow-md shadow-indigo-950/50">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-white tracking-tight text-lg leading-none">
                Job<span className="text-cyan-400">Flow</span>
              </span>
              <span className="text-[9px] text-indigo-300 font-medium tracking-wider uppercase mt-0.5">
                Smart Scheduling
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50 font-semibold'
                    : 'text-indigo-200/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
