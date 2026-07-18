import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import TeachingModeSelector from '../components/TeachingModeSelector';
import { Send, ImagePlus, Clock, Sparkles, TrendingUp, BookOpen, Target, X, Image } from 'lucide-react';

const QUICK_EXAMPLES = [
  'Solve: 2x² + 5x − 3 = 0',
  'What is the derivative of sin(x²)?',
  'Explain the Pythagorean theorem',
  'Find the area under y = x² from 0 to 3',
  'Prove that √2 is irrational',
  'What is a prime number?',
];

export default function Dashboard() {
  const { profile, history, progress, defaultMode, setDefaultMode } = useApp();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModes, setShowModes] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAsk = () => {
    if (!question.trim() && !imageFile) return;
    navigate('/ask', { state: { question: question.trim(), imageFile, mode: defaultMode } });
  };

  const handleExample = (q: string) => {
    setQuestion(q);
  };

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <p className="text-slate-500 text-sm">{greetingTime()},</p>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          {profile?.name || 'Learner'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">What would you like to learn today?</p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4">
          {/* Image preview */}
          {imagePreview && (
            <div className="relative mb-3 inline-block">
              <img
                src={imagePreview}
                alt="Math question"
                className="h-28 rounded-xl border border-slate-200 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center"
              >
                <X size={11} className="text-white" />
              </button>
            </div>
          )}

          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Type or paste a math question…"
            rows={3}
            className="w-full text-[#0F172A] placeholder-slate-400 text-sm leading-relaxed focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0F172A] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <ImagePlus size={15} />
                Image
              </button>
              <button
                onClick={() => setShowModes(v => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0F172A] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <BookOpen size={15} />
                Mode
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            </div>

            <button
              onClick={handleAsk}
              disabled={!question.trim() && !imageFile}
              className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1e3a5f] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Sparkles size={14} className="text-[#D4A017]" />
              Ask Euler
            </button>
          </div>
        </div>

        {/* Teaching mode selector (expandable) */}
        {showModes && (
          <div className="border-t border-slate-100 p-4 bg-slate-50 animate-slide-up">
            <p className="text-xs font-semibold text-slate-500 mb-2.5">Teaching Mode</p>
            <TeachingModeSelector selected={defaultMode} onChange={setDefaultMode} compact />
          </div>
        )}
      </div>

      {/* Quick Examples */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXAMPLES.map(q => (
            <button
              key={q}
              onClick={() => handleExample(q)}
              className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full hover:border-[#D4A017] hover:text-[#0F172A] transition-all hover:shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Target size={16} className="text-[#D4A017]" />}
          value={progress.totalQuestions.toString()}
          label="Questions"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-emerald-500" />}
          value={progress.strongTopics.length.toString()}
          label="Strong topics"
        />
        <StatCard
          icon={<BookOpen size={16} className="text-blue-500" />}
          value={progress.weakTopics.length.toString()}
          label="Reviewing"
        />
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recent</p>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-[#D4A017] font-semibold hover:underline"
            >
              See all
            </button>
          </div>
          <div className="space-y-2">
            {history.slice(0, 4).map(entry => (
              <button
                key={entry.id}
                onClick={() => navigate('/ask', { state: { question: entry.question, mode: entry.mode, preloaded: entry } })}
                className="w-full flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-slate-300 transition-colors"
              >
                <Clock size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">{entry.question}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {entry.response.concept} · {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                  entry.understood === true ? 'bg-emerald-400' :
                  entry.understood === false ? 'bg-rose-400' : 'bg-slate-300'
                }`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sparkles size={28} className="text-[#D4A017]" />
          </div>
          <p className="text-slate-700 font-semibold text-sm">Ask your first question</p>
          <p className="text-slate-400 text-xs mt-1">Type or paste any math problem above</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-xl font-bold text-[#0F172A]">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
