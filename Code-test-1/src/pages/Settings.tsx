import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Key, CheckCircle, XCircle, Eye, EyeOff, ExternalLink,
  Sparkles, Shield, Info, ChevronRight, Lightbulb, BookOpen,
  ListOrdered, CheckSquare
} from 'lucide-react';
import TeachingModeSelector from '../components/TeachingModeSelector';

type ValidStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export default function Settings() {
  const { apiKey, setApiKey, defaultMode, setDefaultMode } = useApp();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<ValidStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);

  const handleValidate = async () => {
    if (!keyInput.trim()) return;
    setStatus('validating');
    setErrorMsg('');

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setStatus('valid');
        setApiKey(keyInput.trim());
        setSaved(true);
        if (data.quotaWarning) {
          setErrorMsg('QUOTA_WARNING');
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setStatus('invalid');
        setErrorMsg(data.error || 'Invalid API key');
      }
    } catch {
      setStatus('invalid');
      setErrorMsg('Could not connect to server. Is it running?');
    }
  };

  const handleSaveWithoutValidation = () => {
    setApiKey(keyInput.trim());
    setSaved(true);
    setStatus('idle');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRemoveKey = () => {
    setApiKey('');
    setKeyInput('');
    setStatus('idle');
  };

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 6)}${'•'.repeat(20)}${apiKey.slice(-4)}`
    : '';

  return (
    <div className="px-4 pt-5 pb-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure Euler AI to your preferences</p>
      </div>

      {/* API Key Section — highlighted */}
      <div className="bg-[#0F172A] rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A017]/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Key size={16} className="text-[#D4A017]" />
            <span className="text-[#D4A017] text-xs font-semibold uppercase tracking-wide">Gemini API Key</span>
          </div>
          <p className="text-white text-sm font-medium mb-1">Connect Google Gemini AI</p>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Without a key, Euler AI shows sample responses. Add your free Gemini API key to unlock real AI-powered mathematics mentoring.
          </p>

          {/* Key format hint */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 mb-3 space-y-1.5">
            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wide">How to get your key</p>
            <p className="text-[10px] text-slate-400">1. Open <span className="text-[#D4A017] font-medium">aistudio.google.com/app/apikey</span></p>
            <p className="text-[10px] text-slate-400">2. Click the blue <span className="text-white font-medium">"Create API key"</span> button</p>
            <p className="text-[10px] text-slate-400">3. Select or create a project, then click <span className="text-white font-medium">"Create API key in new project"</span></p>
            <p className="text-[10px] text-slate-400">4. Copy the full key string from the dialog that appears</p>
            <p className="text-[10px] text-[#D4A017] pt-1 border-t border-white/10 font-medium">
              Any format accepted — validation is done by a live test request to Google.
            </p>
          </div>

          {apiKey && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-3">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-emerald-300 font-mono flex-1 truncate">{maskedKey}</span>
              <button onClick={handleRemoveKey} className="text-xs text-rose-400 hover:text-rose-300 ml-2 flex-shrink-0">Remove</button>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={e => { setKeyInput(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                placeholder="Paste your key here (AIza...)"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:border-[#D4A017] transition-colors font-mono"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {status === 'invalid' && errorMsg && (
              errorMsg.startsWith('QUOTA_ZERO:') ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-300 text-xs font-semibold">Gemini API not enabled on this project</p>
                  </div>
                  <p className="text-amber-200/80 text-[11px] leading-relaxed pl-5">
                    Your key is valid but the Gemini API hasn't been enabled in your Google Cloud project. You need to enable it once.
                  </p>
                  <a
                    href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 pl-5 underline underline-offset-2"
                  >
                    <ExternalLink size={11} />
                    Click here to enable the Gemini API, then try again
                  </a>
                  <p className="text-amber-200/60 text-[10px] pl-5">
                    Or use "Skip test" below to save the key now — it may still work for asking questions.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
                  <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-300 text-xs leading-relaxed">{errorMsg}</p>
                </div>
              )
            )}
            {status === 'valid' && errorMsg === 'QUOTA_WARNING' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-3 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <p className="text-emerald-300 text-xs font-semibold">Key saved — Google confirmed it is valid.</p>
                </div>
                <p className="text-amber-200/80 text-[11px] leading-relaxed pl-5">
                  Your free-tier quota is currently at zero for this project. To use the AI, either enable billing on your Google Cloud project (free until you exceed limits) or wait for the daily quota to reset at midnight Pacific time.
                </p>
                <a
                  href="https://console.cloud.google.com/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 pl-5 underline underline-offset-2"
                >
                  <ExternalLink size={11} />
                  Enable billing on Google Cloud (free tier still applies)
                </a>
              </div>
            )}
            {status === 'valid' && errorMsg !== 'QUOTA_WARNING' && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <p className="text-emerald-300 text-xs font-medium">API key validated and saved successfully!</p>
              </div>
            )}
            {saved && status !== 'valid' && (
              <div className="flex items-center gap-2 bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl px-3 py-2">
                <CheckCircle size={14} className="text-[#D4A017]" />
                <p className="text-[#D4A017] text-xs">Key saved. It will be used for your next question.</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleValidate}
                disabled={!keyInput.trim() || status === 'validating'}
                className="flex-1 bg-[#D4A017] text-[#0F172A] font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-40 hover:bg-[#e4c524] active:scale-95"
              >
                {status === 'validating' ? 'Validating…' : 'Validate & Save'}
              </button>
              {keyInput.trim() && status !== 'valid' && (
                <button
                  onClick={handleSaveWithoutValidation}
                  className="px-4 bg-white/10 text-slate-300 border border-white/20 font-medium py-3 rounded-xl text-sm hover:bg-white/15 transition-colors flex-shrink-0"
                  title="Save key without testing it"
                >
                  Skip test
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              Use "Skip test" if validation fails but your key is correct
            </p>
          </div>
        </div>
      </div>

      {/* How to get a key */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
          <Info size={15} className="text-blue-500" />
          How to get a free Gemini API Key
        </p>
        <ol className="space-y-2.5">
          {[
            { step: 1, text: 'Go to Google AI Studio' },
            { step: 2, text: 'Sign in with your Google account' },
            { step: 3, text: 'Click "Create API key"' },
            { step: 4, text: 'Copy and paste it above' },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#0F172A] text-[#D4A017] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {step}
              </div>
              <span className="text-sm text-slate-700">{text}</span>
            </li>
          ))}
        </ol>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
        >
          Open Google AI Studio <ExternalLink size={13} />
        </a>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 bg-slate-50 rounded-xl border border-slate-200 p-3.5">
        <Shield size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Your API key is stored only in your browser's local storage and sent directly to Google's servers.
          It is never stored on Euler AI's servers.
        </p>
      </div>

      {/* Teaching mode preference */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-[#0F172A] mb-1">Default Teaching Mode</p>
        <p className="text-xs text-slate-500 mb-3">This will be pre-selected when you start a new question</p>
        <TeachingModeSelector selected={defaultMode} onChange={setDefaultMode} />
      </div>

      {/* Teaching mode explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-sm font-semibold text-[#0F172A]">About Teaching Modes</p>
        {[
          { icon: <Lightbulb size={14} className="text-amber-500" />, name: 'Hint Only', desc: 'A gentle nudge. Euler points you in the right direction without revealing the answer. Great for practicing independent thinking.' },
          { icon: <BookOpen size={14} className="text-blue-500" />, name: 'Teach Me', desc: 'A full concept explanation with analogy, worked example, and practice. Best for learning new topics.' },
          { icon: <ListOrdered size={14} className="text-emerald-500" />, name: 'Step-by-Step', desc: 'A numbered, detailed walkthrough of the solution with reasoning at each step.' },
          { icon: <CheckSquare size={14} className="text-violet-500" />, name: 'Full Solution', desc: 'The complete answer including theory, multiple methods, verification, and real-world context.' },
        ].map(m => (
          <div key={m.name} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">{m.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-800">{m.name}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Version */}
      <div className="text-center text-xs text-slate-400 pt-2">
        Euler AI v1.0 · Built for mathematics learners worldwide
      </div>
    </div>
  );
}
