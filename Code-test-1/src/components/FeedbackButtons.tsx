import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ThumbsUp, ThumbsDown, Minus, RefreshCw } from 'lucide-react';

interface FeedbackButtonsProps {
  entryId: string;
  onSimplify?: () => void;
  simplifying?: boolean;
}

export default function FeedbackButtons({ entryId, onSimplify, simplifying }: FeedbackButtonsProps) {
  const { updateHistoryEntry, history } = useApp();
  const entry = history.find(h => h.id === entryId);
  const [submitted, setSubmitted] = useState(entry?.understood !== null && entry?.understood !== undefined);
  const [selected, setSelected] = useState<boolean | 'somewhat' | null>(
    entry?.understood === true ? true : entry?.understood === false ? false : null
  );

  const handleFeedback = (value: boolean | 'somewhat') => {
    setSelected(value);
    setSubmitted(true);
    updateHistoryEntry(entryId, { understood: value === 'somewhat' ? null : value });
    if (value === false && onSimplify) {
      setTimeout(onSimplify, 600);
    }
  };

  if (submitted && selected !== false) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${
          selected === true
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {selected === true ? '✓ Great! Keep going.' : '~ We\'ll try again below.'}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <p className="text-xs text-slate-500 mb-2 font-medium">Did you understand this?</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback(true)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            selected === true
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <ThumbsUp size={14} />
          Yes
        </button>
        <button
          onClick={() => handleFeedback('somewhat')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            selected === 'somewhat'
              ? 'bg-amber-400 border-amber-400 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
          }`}
        >
          <Minus size={14} />
          Somewhat
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={simplifying}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            selected === false
              ? 'bg-rose-500 border-rose-500 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50'
          } disabled:opacity-60`}
        >
          {simplifying ? <RefreshCw size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
          {simplifying ? 'Simplifying…' : 'No'}
        </button>
      </div>
    </div>
  );
}
