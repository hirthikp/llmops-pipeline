
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PromptLibrary from './components/PromptLibrary';
import Executions from './components/Executions';
import { Database, ShieldCheck, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.PROMPTS:
        return <PromptLibrary />;
      case AppView.EXECUTIONS:
        return <Executions />;
      case AppView.METRICS:
        return <Dashboard />; // Metrics is basically a deeper dashboard
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentView={currentView} setView={setView} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Database size={14} className="text-blue-500" />
                <span>PostgreSQL: Connected</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Evals: Active</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Zap size={14} className="text-amber-500" />
                <span>Docker: Healthy</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Admin Engineer</p>
                <p className="text-[10px] text-slate-400">Production Role</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="Avatar" />
             </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
