
import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, FileText, PlayCircle, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const items = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PROMPTS, label: 'Prompt Library', icon: FileText },
    { id: AppView.EXECUTIONS, label: 'Execution History', icon: PlayCircle },
    { id: AppView.METRICS, label: 'Performance Metrics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <PlayCircle size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight">LLMOps Pro</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
