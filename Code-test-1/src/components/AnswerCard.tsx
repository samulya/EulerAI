import { useState } from 'react';
import { AIResponse, TeachingMode } from '../types';
import MathRenderer from './MathRenderer';
import FeedbackButtons from './FeedbackButtons';
import {
  BookOpen, Lightbulb, ChevronDown, ChevronUp,
  ArrowRight, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';

interface AnswerCardProps {
  response: AIResponse;
  mode: TeachingMode;
  question: string;
  entryId: string;
  onSimplify?: () => void;
  simplifying?: boolean;
}

export default function AnswerCard({
  response, mode, question, entryId, onSimplify, simplifying
}: AnswerCardProps) {
  const [showExample, setShowExample] = useState(true);

  const modeColors: Record<TeachingMode, string> = {
    hint: 'bg-amber-50 border-amber-200',
    teach: 'bg-blue-50 border-blue-200',
    'step-by-step': 'bg-emerald-50 border-emerald-200',
    full: 'bg-violet-50 border-violet-200',
  };

  const modeAccents: Record<TeachingMode, string> = {
    hint: 'text-amber-700 bg-amber-100',
    teach: 'text-blue-700 bg-blue-100',
    'step-by-step': 'text-emerald-700 bg-emerald-100',
    full: 'text-violet-700 bg-violet-100',
  };

  const modeLabelMap: Record<TeachingMode, string> = {
    hint: 'Hint',
    teach: 'Concept Explanation',
    'step-by-step': 'Step-by-Step',
    full: 'Full Solution',
  };

  return (
    <div className="animate-slide-up space-y-3">
      {response.mock && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <strong>Sample response.</strong> Add your Gemini API key in{' '}
            <a href="/settings" className="underline font-medium">Settings</a>{' '}
            to unlock real AI-powered explanations.
          </div>
        </div>
      )}

      {/* Concept Badge */}
      {response.concept && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${modeAccents[mode]}`}>
            <Sparkles size={11} />
            {response.concept}
          </span>
          <span className="text-xs text-slate-400">{modeLabelMap[mode]}</span>
        </div>
      )}

      {/* Hint Mode */}
      {mode === 'hint' && response.hint && (
        <div className={`rounded-xl border-2 p-4 ${modeColors.hint}`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1.5">Here's your hint:</p>
              <MathRenderer content={response.hint} className="text-amber-900 text-sm" />
              {response.encouragement && (
                <p className="text-amber-700 text-xs mt-2 italic">{response.encouragement}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explain / Teach Me */}
      {(mode === 'teach' || mode === 'full') && response.explanation && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-[#0F172A]" />
            <span className="text-sm font-semibold text-[#0F172A]">Explanation</span>
          </div>
          <MathRenderer content={response.explanation} />
          {response.analogy && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-3 border-blue-300">
              <p className="text-xs font-semibold text-blue-700 mb-1">Analogy</p>
              <MathRenderer content={response.analogy} className="text-blue-800 text-sm" />
            </div>
          )}
          {response.theory && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-1">Theory</p>
              <MathRenderer content={response.theory} className="text-slate-700 text-sm" />
            </div>
          )}
        </div>
      )}

      {/* Step-by-Step Mode */}
      {mode === 'step-by-step' && response.steps && response.steps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F172A] mb-3">Step-by-Step Solution</p>
          <div className="space-y-3">
            {response.steps.map((s, i) => (
              <div key={i} className="relative flex gap-3 pl-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#0F172A] text-[#D4A017] flex items-center justify-center text-xs font-bold">
                    {s.step || i + 1}
                  </div>
                  {i < response.steps!.length - 1 && (
                    <div className="w-0.5 bg-slate-200 flex-1 mt-1 mb-[-0.5rem]" />
                  )}
                </div>
                <div className="pb-3 flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">{s.action}</p>
                  <MathRenderer content={s.detail} className="text-sm text-slate-600" />
                </div>
              </div>
            ))}
          </div>
          {response.answer && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-emerald-700">Answer: </span>
                <MathRenderer content={response.answer} className="text-emerald-800 text-sm inline" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Worked Example */}
      {response.worked_example && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowExample(v => !v)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="text-sm font-semibold text-[#0F172A]">Worked Example</span>
            {showExample ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {showExample && (
            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 mb-1">Problem</p>
                <MathRenderer content={response.worked_example.problem} className="text-slate-800 font-medium text-sm" />
              </div>
              <div className="mt-3 space-y-2">
                {Array.isArray(response.worked_example.steps) && response.worked_example.steps.map((step, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#D4A017]/20 text-[#D4A017] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      {typeof step === 'string' ? (
                        <MathRenderer content={step} className="text-sm text-slate-700" />
                      ) : (
                        <div>
                          <MathRenderer content={step.step} className="text-sm font-mono text-slate-800" />
                          {step.reason && (
                            <p className="text-xs text-slate-500 mt-0.5">{step.reason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {response.worked_example.answer && (
                <div className="mt-3 p-2.5 bg-[#D4A017]/10 rounded-lg border border-[#D4A017]/20">
                  <span className="text-xs font-semibold text-[#D4A017]">✓ Answer: </span>
                  <MathRenderer content={response.worked_example.answer} className="text-[#0F172A] text-sm inline font-semibold" />
                </div>
              )}
              {response.verification && (
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                  {response.verification}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real world context */}
      {response.real_world && (
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-3.5">
          <p className="text-xs font-semibold text-indigo-700 mb-1">Real World Connection</p>
          <MathRenderer content={response.real_world} className="text-indigo-800 text-sm" />
        </div>
      )}

      {/* Practice Question */}
      {response.practice_question && (
        <div className="bg-[#0F172A] rounded-xl p-4">
          <p className="text-[#D4A017] text-xs font-semibold mb-1.5">Practice Question</p>
          <MathRenderer content={response.practice_question} className="text-white text-sm" />
        </div>
      )}

      {/* Next Topic */}
      {response.next_topic && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Suggested next topic</p>
            <p className="text-sm font-semibold text-slate-800">{response.next_topic}</p>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </div>
      )}

      {/* Feedback */}
      <FeedbackButtons entryId={entryId} onSimplify={onSimplify} simplifying={simplifying} />
    </div>
  );
}
