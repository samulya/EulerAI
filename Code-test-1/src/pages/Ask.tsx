import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { AIResponse, TeachingMode } from '../types';
import AnswerCard from '../components/AnswerCard';
import TeachingModeSelector from '../components/TeachingModeSelector';
import MathRenderer from '../components/MathRenderer';
import { Send, ImagePlus, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface LocationState {
  question?: string;
  imageFile?: File;
  mode?: TeachingMode;
  preloaded?: { id: string; question: string; mode: TeachingMode; response: AIResponse };
}

type ConversationEntry = {
  id: string;
  question: string;
  mode: TeachingMode;
  response: AIResponse;
  loading?: boolean;
};

export default function Ask() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};
  const { profile, apiKey, addHistory, defaultMode } = useApp();

  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mode, setMode] = useState<TeachingMode>(state.mode || defaultMode);
  const [showModes, setShowModes] = useState(false);
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [simplifyingId, setSimplifyingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (state.preloaded) {
      setEntries([{
        id: state.preloaded.id,
        question: state.preloaded.question,
        mode: state.preloaded.mode,
        response: state.preloaded.response,
      }]);
      return;
    }

    if (state.question || state.imageFile) {
      askQuestion(state.question || 'Analyze the math in this image', state.imageFile, state.mode || mode);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const askQuestion = async (question: string, imgFile?: File | null, askMode?: TeachingMode) => {
    const usedMode = askMode || mode;
    const id = crypto.randomUUID();

    const loadingEntry: ConversationEntry = {
      id,
      question,
      mode: usedMode,
      response: {} as AIResponse,
      loading: true,
    };
    setEntries(prev => [...prev, loadingEntry]);

    try {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('mode', usedMode);
      formData.append('profile', JSON.stringify(profile));
      if (imgFile) formData.append('image', imgFile);

      const headers: Record<string, string> = {};
      if (apiKey) headers['x-gemini-key'] = apiKey;

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      const response: AIResponse = data.success ? data.data : {
        concept: 'Error',
        explanation: data.error || 'Something went wrong. Please try again.',
        mock: true,
      };

      const finalEntry: ConversationEntry = { id, question, mode: usedMode, response };
      setEntries(prev => prev.map(e => e.id === id ? finalEntry : e));

      addHistory({
        id,
        question,
        mode: usedMode,
        response,
        timestamp: new Date().toISOString(),
        understood: null,
        topic: response.concept,
      });
    } catch (err) {
      const fallback: AIResponse = {
        concept: 'Network Error',
        explanation: 'Could not connect to the server. Please check your connection and try again.',
        mock: true,
      };
      setEntries(prev => prev.map(e => e.id === id ? { ...e, response: fallback, loading: false } : e));
    }
  };

  const handleSimplify = async (entryId: string) => {
    setSimplifyingId(entryId);
    const original = entries.find(e => e.id === entryId);
    if (!original) return;

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (apiKey) (headers as Record<string, string>)['x-gemini-key'] = apiKey;

      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          originalResponse: original.response,
          question: original.question,
          profile,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const simpId = crypto.randomUUID();
        const simpEntry: ConversationEntry = {
          id: simpId,
          question: `[Simpler explanation] ${original.question}`,
          mode: original.mode,
          response: data.data,
        };
        setEntries(prev => [...prev, simpEntry]);
        addHistory({
          id: simpId,
          question: simpEntry.question,
          mode: original.mode,
          response: data.data,
          timestamp: new Date().toISOString(),
          understood: null,
          topic: data.data.concept,
        });
      }
    } catch { /* silent */ } finally {
      setSimplifyingId(null);
    }
  };

  const handleSend = () => {
    if (!input.trim() && !imageFile) return;
    const q = input.trim();
    const img = imageFile;
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
    askQuestion(q || 'Analyze the math in this image', img);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)]">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 bg-[#F8FAFC]">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate('/')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </button>
          <span className="text-sm font-semibold text-[#0F172A]">Ask Euler</span>
          <div className="ml-auto">
            <button
              onClick={() => setShowModes(v => !v)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0F172A] border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Mode {showModes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>
        {showModes && (
          <div className="pb-2 animate-slide-up">
            <TeachingModeSelector selected={mode} onChange={setMode} compact />
          </div>
        )}
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {entries.length === 0 && (
          <div className="text-center pt-16">
            <p className="text-slate-400 text-sm">Ask a math question to get started</p>
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="space-y-3">
            {/* User question */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-[#0F172A] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                {entry.question.startsWith('[Simpler') ? (
                  <span className="italic text-slate-300 text-xs">{entry.question}</span>
                ) : (
                  <MathRenderer content={entry.question} className="text-white" />
                )}
              </div>
            </div>

            {/* AI response */}
            {entry.loading ? (
              <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-200 w-48">
                <div className="w-8 h-8 bg-[#D4A017] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0F172A] font-bold text-sm font-mono">e</span>
                </div>
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="thinking-dot w-2 h-2 bg-[#D4A017] rounded-full"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-[#D4A017] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#0F172A] font-bold text-xs font-mono">e</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Euler AI</span>
                </div>
                <AnswerCard
                  response={entry.response}
                  mode={entry.mode}
                  question={entry.question}
                  entryId={entry.id}
                  onSimplify={() => handleSimplify(entry.id)}
                  simplifying={simplifyingId === entry.id}
                />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-slate-100 bg-white px-3 py-3 safe-bottom">
        {imagePreview && (
          <div className="flex items-center gap-2 mb-2 pl-1">
            <img src={imagePreview} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
            <span className="text-xs text-slate-500 flex-1 truncate">Image attached</span>
            <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="p-1 hover:bg-slate-100 rounded">
              <X size={13} className="text-slate-400" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
          >
            <ImagePlus size={18} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask another question…"
            rows={1}
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 resize-none max-h-32 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !imageFile}
            className="p-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-[#1e3a5f] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
          >
            <Send size={17} className="text-[#D4A017]" />
          </button>
        </div>
      </div>
    </div>
  );
}
