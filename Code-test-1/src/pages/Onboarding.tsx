import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { UserProfile, AgeGroup, LearningGoal } from '../types';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const AGE_GROUPS: Array<{ value: AgeGroup; label: string; emoji: string; description: string }> = [
  { value: '8-10', label: 'Ages 8–10', emoji: '🌱', description: 'Elementary school' },
  { value: '11-13', label: 'Ages 11–13', emoji: '📐', description: 'Middle school' },
  { value: '14-18', label: 'Ages 14–18', emoji: '📚', description: 'High school' },
  { value: 'jee', label: 'JEE / SAT', emoji: '🎯', description: 'Competitive exams' },
  { value: 'olympiad', label: 'Olympiad', emoji: '🏅', description: 'Math competitions' },
  { value: 'university', label: 'University', emoji: '🎓', description: 'Undergraduate & above' },
  { value: 'research', label: 'Research', emoji: '🔬', description: 'Graduate & research' },
];

const GOALS: Array<{ value: LearningGoal; label: string; icon: string; description: string }> = [
  { value: 'school', label: 'School', icon: '🏫', description: 'Master my school curriculum' },
  { value: 'jee', label: 'JEE / Exams', icon: '📝', description: 'Crack competitive entrance exams' },
  { value: 'olympiad', label: 'Olympiad', icon: '🥇', description: 'Train for math olympiads' },
  { value: 'university', label: 'University', icon: '🎓', description: 'Excel in university mathematics' },
  { value: 'research', label: 'Research', icon: '🔭', description: 'Explore advanced mathematics' },
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'China', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'South Korea', 'Singapore', 'Brazil',
  'Nigeria', 'South Africa', 'Mexico', 'Russia', 'Other',
];

type Step = 'welcome' | 'name' | 'age' | 'country' | 'goal' | 'done';

export default function Onboarding() {
  const { setProfile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [form, setForm] = useState({
    name: '',
    ageGroup: '' as AgeGroup,
    country: '',
    goal: '' as LearningGoal,
  });

  const steps: Step[] = ['welcome', 'name', 'age', 'country', 'goal', 'done'];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex) / (steps.length - 1)) * 100;

  const next = () => setStep(steps[stepIndex + 1]);
  const back = () => setStep(steps[stepIndex - 1]);

  const handleDone = () => {
    const profile: UserProfile = {
      name: form.name.trim() || 'Learner',
      ageGroup: form.ageGroup,
      country: form.country,
      goal: form.goal,
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-[#0F172A] flex flex-col">
      {/* Progress bar */}
      {step !== 'welcome' && step !== 'done' && (
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-[#D4A017] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center animate-fade-in max-w-sm w-full">
            <div className="w-24 h-24 bg-[#D4A017] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#D4A017]/20">
              <span className="text-[#0F172A] font-bold text-5xl font-mono">e</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Euler AI
            </h1>
            <p className="text-[#D4A017] text-lg font-medium mb-3">The AI Mathematics Mentor</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              From elementary arithmetic to research mathematics — personalized explanations
              that adapt to how you think and what you need.
            </p>
            <button
              onClick={next}
              className="w-full bg-[#D4A017] text-[#0F172A] font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:bg-[#e4c524] transition-all active:scale-95 shadow-lg shadow-[#D4A017]/20"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
            <p className="text-slate-500 text-xs mt-4">No account required · Free to use</p>
          </div>
        )}

        {/* Name */}
        {step === 'name' && (
          <div className="w-full max-w-sm animate-slide-up">
            <div className="mb-8">
              <p className="text-[#D4A017] text-sm font-semibold mb-1">Step 1 of 4</p>
              <h2 className="text-2xl font-bold text-white">What's your name?</h2>
              <p className="text-slate-400 text-sm mt-1">I'll use this to personalize your experience</p>
            </div>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter your name"
              autoFocus
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-[#D4A017] transition-colors"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={back} className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border border-white/20 text-slate-300 text-sm hover:border-white/40 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={next}
                disabled={!form.name.trim()}
                className="flex-1 bg-[#D4A017] text-[#0F172A] font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-[#e4c524] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Age Group */}
        {step === 'age' && (
          <div className="w-full max-w-sm animate-slide-up">
            <div className="mb-6">
              <p className="text-[#D4A017] text-sm font-semibold mb-1">Step 2 of 4</p>
              <h2 className="text-2xl font-bold text-white">What's your level?</h2>
              <p className="text-slate-400 text-sm mt-1">I'll adapt explanations to match your knowledge</p>
            </div>
            <div className="space-y-2">
              {AGE_GROUPS.map(ag => (
                <button
                  key={ag.value}
                  onClick={() => setForm(f => ({ ...f, ageGroup: ag.value }))}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all text-left ${
                    form.ageGroup === ag.value
                      ? 'bg-[#D4A017]/15 border-[#D4A017] shadow-sm'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{ag.emoji}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">{ag.label}</div>
                    <div className="text-slate-400 text-xs">{ag.description}</div>
                  </div>
                  {form.ageGroup === ag.value && (
                    <CheckCircle size={18} className="text-[#D4A017] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={back} className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border border-white/20 text-slate-300 text-sm hover:border-white/40 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={next}
                disabled={!form.ageGroup}
                className="flex-1 bg-[#D4A017] text-[#0F172A] font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-[#e4c524] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Country */}
        {step === 'country' && (
          <div className="w-full max-w-sm animate-slide-up">
            <div className="mb-6">
              <p className="text-[#D4A017] text-sm font-semibold mb-1">Step 3 of 4</p>
              <h2 className="text-2xl font-bold text-white">Where are you from?</h2>
              <p className="text-slate-400 text-sm mt-1">Helps align with your curriculum</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, country: c }))}
                  className={`px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${
                    form.country === c
                      ? 'bg-[#D4A017]/15 border-[#D4A017] text-[#D4A017] font-semibold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={back} className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border border-white/20 text-slate-300 text-sm hover:border-white/40 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={next}
                disabled={!form.country}
                className="flex-1 bg-[#D4A017] text-[#0F172A] font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-[#e4c524] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Goal */}
        {step === 'goal' && (
          <div className="w-full max-w-sm animate-slide-up">
            <div className="mb-6">
              <p className="text-[#D4A017] text-sm font-semibold mb-1">Step 4 of 4</p>
              <h2 className="text-2xl font-bold text-white">What's your goal?</h2>
              <p className="text-slate-400 text-sm mt-1">I'll tailor problem-solving strategies to your path</p>
            </div>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all text-left ${
                    form.goal === g.value
                      ? 'bg-[#D4A017]/15 border-[#D4A017] shadow-sm'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">{g.label}</div>
                    <div className="text-slate-400 text-xs">{g.description}</div>
                  </div>
                  {form.goal === g.value && (
                    <CheckCircle size={18} className="text-[#D4A017] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={back} className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border border-white/20 text-slate-300 text-sm hover:border-white/40 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={next}
                disabled={!form.goal}
                className="flex-1 bg-[#D4A017] text-[#0F172A] font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-[#e4c524] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="text-center animate-fade-in max-w-sm w-full">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">You're all set, {form.name || 'Learner'}!</h2>
            <p className="text-slate-400 text-sm mb-2">
              Euler AI will teach you mathematics adapted for your level and goals.
            </p>
            <div className="bg-white/5 rounded-2xl p-4 mb-8 text-left space-y-2 border border-white/10">
              <ProfileRow label="Level" value={AGE_GROUPS.find(a => a.value === form.ageGroup)?.label || ''} />
              <ProfileRow label="Country" value={form.country} />
              <ProfileRow label="Goal" value={GOALS.find(g => g.value === form.goal)?.label || ''} />
            </div>
            <button
              onClick={handleDone}
              className="w-full bg-[#D4A017] text-[#0F172A] font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:bg-[#e4c524] transition-all active:scale-95 shadow-lg shadow-[#D4A017]/20"
            >
              Start Learning <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}
