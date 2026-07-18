import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Clock, Search, ThumbsUp, ThumbsDown, Minus, Filter, Trash2 } from 'lucide-react';
import { TeachingMode } from '../types';

const MODE_LABELS: Record<TeachingMode, string> = {
  hint: 'Hint',
  teach: 'Teach Me',
  'step-by-step': 'Step-by-Step',
  full: 'Full Solution',
};

const MODE_COLORS: Record<TeachingMode, string> = {
  hint: 'bg-amber-100 text-amber-700',
  teach: 'bg-blue-100 text-blue-700',
  'step-by-step': 'bg-emerald-100 text-emerald-700',
  full: 'bg-violet-100 text-violet-700',
};

export default function History() {
  const { history, addHistory } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'understood' | 'review'>('all');

  const filtered = history.filter(entry => {
    const matchSearch = !search || entry.question.toLowerCase().includes(search.toLowerCase()) ||
      (entry.response.concept || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ||
      (filter === 'understood' && entry.understood === true) ||
      (filter === 'review' && entry.understood === false);
    return matchSearch && matchFilter;
  });

  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach(entry => {
    const date = new Date(entry.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let key: string;
    if (date.toDateString() === today.toDateString()) key = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    else key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  });

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">History</h1>
        <p className="text-slate-500 text-sm mt-0.5">{history.length} questions asked</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions or topics…"
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 focus:border-[#D4A017]"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([['all', 'All'], ['understood', 'Mastered'], ['review', 'Review']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === val
                ? 'bg-[#0F172A] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grouped entries */}
      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-16">
          <Clock size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">No questions yet</p>
          <p className="text-slate-400 text-xs mt-1">Start asking math questions to build your history</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, entries]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">{date}</p>
          <div className="space-y-2">
            {entries.map(entry => (
              <button
                key={entry.id}
                onClick={() => navigate('/ask', { state: { question: entry.question, mode: entry.mode, preloaded: entry } })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-left hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-1.5">{entry.question}</p>
                    <div className="flex items-center flex-wrap gap-1.5">
                      {entry.response.concept && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {entry.response.concept}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODE_COLORS[entry.mode]}`}>
                        {MODE_LABELS[entry.mode]}
                      </span>
                      {entry.response.mock && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Sample</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    {entry.understood === true && <ThumbsUp size={14} className="text-emerald-500" />}
                    {entry.understood === false && <ThumbsDown size={14} className="text-rose-500" />}
                    {entry.understood === null && <Minus size={14} className="text-slate-300" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
