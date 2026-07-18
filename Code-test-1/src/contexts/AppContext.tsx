import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, HistoryEntry, Progress, TeachingMode } from '../types';

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  history: HistoryEntry[];
  addHistory: (entry: HistoryEntry) => void;
  updateHistoryEntry: (id: string, update: Partial<HistoryEntry>) => void;
  progress: Progress;
  defaultMode: TeachingMode;
  setDefaultMode: (m: TeachingMode) => void;
  clearProfile: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultProgress: Progress = {
  totalQuestions: 0,
  strongTopics: [],
  weakTopics: [],
  lastActive: new Date().toISOString(),
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const p = localStorage.getItem('euler_profile');
      return p ? JSON.parse(p) : null;
    } catch { return null; }
  });

  const [apiKey, setApiKeyState] = useState<string>(() =>
    localStorage.getItem('euler_gemini_key') || ''
  );

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const h = localStorage.getItem('euler_history');
      return h ? JSON.parse(h) : [];
    } catch { return []; }
  });

  const [defaultMode, setDefaultModeState] = useState<TeachingMode>(() =>
    (localStorage.getItem('euler_mode') as TeachingMode) || 'teach'
  );

  const progress: Progress = {
    totalQuestions: history.length,
    strongTopics: history
      .filter(h => h.understood === true)
      .map(h => h.response.concept || h.topic || '')
      .filter(Boolean)
      .slice(-5),
    weakTopics: history
      .filter(h => h.understood === false)
      .map(h => h.response.concept || h.topic || '')
      .filter(Boolean)
      .slice(-5),
    lastActive: history[0]?.timestamp || new Date().toISOString(),
  };

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem('euler_profile', JSON.stringify(p));
  };

  const setApiKey = (k: string) => {
    setApiKeyState(k);
    localStorage.setItem('euler_gemini_key', k);
  };

  const setDefaultMode = (m: TeachingMode) => {
    setDefaultModeState(m);
    localStorage.setItem('euler_mode', m);
  };

  const addHistory = (entry: HistoryEntry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 100);
      localStorage.setItem('euler_history', JSON.stringify(updated));
      return updated;
    });
  };

  const updateHistoryEntry = (id: string, update: Partial<HistoryEntry>) => {
    setHistory(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...update } : e);
      localStorage.setItem('euler_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('euler_profile');
  };

  return (
    <AppContext.Provider value={{
      profile, setProfile, apiKey, setApiKey,
      history, addHistory, updateHistoryEntry,
      progress, defaultMode, setDefaultMode, clearProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
