import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, MessageSquare, Clock, User, Settings, BookOpen
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/ask', icon: MessageSquare, label: 'Ask' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, apiKey } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A] safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D4A017] rounded-lg flex items-center justify-center">
              <span className="text-[#0F172A] font-bold text-sm font-mono">e</span>
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight">Euler AI</span>
              <div className="text-[10px] text-[#D4A017] leading-none -mt-0.5">Mathematics Mentor</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!apiKey && (
              <NavLink
                to="/settings"
                className="text-xs bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] px-2.5 py-1 rounded-full hover:bg-[#D4A017]/20 transition-colors"
              >
                + Add API Key
              </NavLink>
            )}
            {profile && (
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f] border border-[#D4A017]/30 flex items-center justify-center text-[#D4A017] font-semibold text-sm">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-2xl mx-auto w-full pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-2.5 px-4 transition-all ${
                  active
                    ? 'text-[#D4A017]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                <span className={`text-[10px] font-medium ${active ? 'text-[#D4A017]' : ''}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
