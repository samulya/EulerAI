import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Target, TrendingUp, BarChart2, BookOpen,
  Settings, LogOut, Award, Calendar, CheckCircle, XCircle
} from 'lucide-react';

const AGE_LABELS: Record<string, string> = {
  '8-10': 'Ages 8–10 · Elementary',
  '11-13': 'Ages 11–13 · Middle School',
  '14-18': 'Ages 14–18 · High School',
  'university': 'University Level',
  'jee': 'JEE / Competitive Exams',
  'olympiad': 'Olympiad Training',
  'research': 'Research Level',
};

const GOAL_LABELS: Record<string, string> = {
  school: 'School Curriculum',
  jee: 'JEE / SAT Prep',
  olympiad: 'Math Olympiad',
  university: 'University Mathematics',
  research: 'Research Mathematics',
};

export default function Profile() {
  const { profile, progress, history, clearProfile } = useApp();
  const navigate = useNavigate();

  if (!profile) return null;

  const masteredTopics = [...new Set(
    history.filter(h => h.understood === true).map(h => h.response.concept || '').filter(Boolean)
  )];
  const reviewTopics = [...new Set(
    history.filter(h => h.understood === false).map(h => h.response.concept || '').filter(Boolean)
  )];

  const understandRate = history.length > 0
    ? Math.round((history.filter(h => h.understood === true).length / history.length) * 100)
    : 0;

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="px-4 pt-5 pb-8 space-y-5 animate-fade-in">
      {/* Hero */}
      <div className="bg-[#0F172A] rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full translate-y-10 -translate-x-6" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#D4A017] rounded-2xl flex items-center justify-center text-[#0F172A] text-3xl font-bold shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-[#D4A017] text-sm font-medium">{AGE_LABELS[profile.ageGroup] || profile.ageGroup}</p>
            <p className="text-slate-400 text-xs mt-0.5">{profile.country}</p>
          </div>
        </div>
        <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
          <Calendar size={12} />
          Joined {joinDate}
        </div>
      </div>

      {/* Goal */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Target size={16} className="text-[#D4A017]" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Learning Goal</span>
        </div>
        <p className="text-[#0F172A] font-semibold">{GOAL_LABELS[profile.goal] || profile.goal}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox value={progress.totalQuestions} label="Questions" color="text-[#0F172A]" />
        <StatBox value={masteredTopics.length} label="Mastered" color="text-emerald-600" />
        <StatBox value={`${understandRate}%`} label="Clarity rate" color="text-blue-600" />
      </div>

      {/* Mastered Topics */}
      {masteredTopics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-sm font-semibold text-[#0F172A]">Mastered Topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {masteredTopics.slice(0, 8).map(t => (
              <span key={t} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Review Topics */}
      {reviewTopics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} className="text-rose-500" />
            <span className="text-sm font-semibold text-[#0F172A]">Need More Practice</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reviewTopics.slice(0, 8).map(t => (
              <span key={t} className="text-xs bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Coming soon */}
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award size={16} className="text-[#D4A017]" />
          <span className="text-sm font-semibold text-slate-700">Coming Soon</span>
        </div>
        <div className="space-y-1.5 text-xs text-slate-500">
          <p>• Curriculum graph with topic dependencies</p>
          <p>• Personalized study plans</p>
          <p>• Olympiad training track</p>
          <p>• Research mathematics mode</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3.5 text-left hover:border-slate-300 transition-colors"
        >
          <Settings size={17} className="text-slate-500" />
          <span className="text-sm text-slate-700 font-medium">Settings & API Key</span>
        </button>
        <button
          onClick={() => {
            if (confirm('Reset your profile? This will clear all your data.')) clearProfile();
          }}
          className="w-full flex items-center gap-3 bg-white border border-red-100 rounded-xl p-3.5 text-left hover:border-red-200 transition-colors"
        >
          <LogOut size={17} className="text-red-400" />
          <span className="text-sm text-red-500 font-medium">Reset Profile</span>
        </button>
      </div>
    </div>
  );
}

function StatBox({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
