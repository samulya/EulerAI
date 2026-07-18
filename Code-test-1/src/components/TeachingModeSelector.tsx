import { TeachingMode } from '../types';
import { Lightbulb, BookOpen, ListOrdered, CheckCircle } from 'lucide-react';

const MODES: Array<{
  value: TeachingMode;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}> = [
  {
    value: 'hint',
    label: 'Hint Only',
    description: 'Just a nudge',
    icon: Lightbulb,
    color: 'from-amber-400 to-yellow-500',
  },
  {
    value: 'teach',
    label: 'Teach Me',
    description: 'Full concept',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    value: 'step-by-step',
    label: 'Step-by-Step',
    description: 'Guided walkthrough',
    icon: ListOrdered,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    value: 'full',
    label: 'Full Solution',
    description: 'Complete answer',
    icon: CheckCircle,
    color: 'from-violet-500 to-purple-600',
  },
];

interface TeachingModeSelectorProps {
  selected: TeachingMode;
  onChange: (mode: TeachingMode) => void;
  compact?: boolean;
}

export default function TeachingModeSelector({
  selected,
  onChange,
  compact = false,
}: TeachingModeSelectorProps) {
  if (compact) {
    return (
      <div className="flex gap-1.5 flex-wrap">
        {MODES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selected === value
                ? 'bg-[#0F172A] text-[#D4A017] shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {MODES.map(({ value, label, description, icon: Icon, color }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 transition-all text-left ${
            selected === value
              ? 'border-[#D4A017] bg-[#D4A017]/5 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
          >
            <Icon size={15} className="text-white" />
          </div>
          <div>
            <div className={`text-sm font-semibold ${selected === value ? 'text-[#0F172A]' : 'text-slate-700'}`}>
              {label}
            </div>
            <div className="text-xs text-slate-500">{description}</div>
          </div>
          {selected === value && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-[#D4A017] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
