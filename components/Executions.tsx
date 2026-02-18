
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Execution } from '../types';
import { Clock, CheckCircle, Search, Filter } from 'lucide-react';

const Executions: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    db.getExecutions().then(ex => setExecutions(ex.reverse()));
  }, []);

  const filtered = executions.filter(ex => 
    ex.promptName.toLowerCase().includes(filter.toLowerCase()) ||
    ex.responseText.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Execution History</h1>
          <p className="text-slate-500">Historical records of LLM outputs and their evaluations.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64"
                placeholder="Search logs..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
             <Filter size={18} />
             <span>Filter</span>
           </button>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt & Version</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Output Snippet</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Latency</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((ex) => (
              <tr key={ex.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">{ex.promptName}</div>
                  <div className="text-xs text-slate-400 font-mono">v{ex.versionNumber}</div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-slate-600 truncate">{ex.responseText}</p>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1.5 text-sm text-slate-500">
                     <Clock size={14} />
                     <span>{ex.responseTime}ms</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      (ex.evaluation?.overallScore || 0) > 80 ? 'text-emerald-600' : 
                      (ex.evaluation?.overallScore || 0) > 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {ex.evaluation?.overallScore || 'N/A'}
                    </span>
                    {(ex.evaluation?.overallScore || 0) > 80 && <CheckCircle size={14} className="text-emerald-500" />}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(ex.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No execution logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Executions;
