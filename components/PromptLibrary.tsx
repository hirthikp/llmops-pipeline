
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Prompt, PromptVersion, Execution, Evaluation } from '../types';
import { Plus, ChevronRight, Save, Play, Loader2, History, FileText } from 'lucide-react';

const PromptLibrary: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<Execution | null>(null);

  useEffect(() => {
    db.getPrompts().then(setPrompts);
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      db.getVersions(selectedPrompt.id).then(v => {
        setVersions(v);
        if (v.length > 0) setSelectedVersion(v[v.length - 1]);
      });
    }
  }, [selectedPrompt]);

  const handleAddPrompt = async () => {
    if (!newPromptName) return;
    const prompt: Prompt = {
      id: crypto.randomUUID(),
      name: newPromptName,
      description: 'System prompt library entry',
      createdAt: Date.now()
    };
    await db.savePrompt(prompt);
    setPrompts([...prompts, prompt]);
    setNewPromptName('');
    setIsAddingPrompt(false);
    setSelectedPrompt(prompt);
  };

  const handleAddVersion = async () => {
    if (!selectedPrompt || !newVersionContent) return;
    const version: PromptVersion = {
      id: crypto.randomUUID(),
      promptId: selectedPrompt.id,
      versionNumber: versions.length + 1,
      content: newVersionContent,
      createdAt: Date.now()
    };
    await db.saveVersion(version);
    setVersions([...versions, version]);
    setNewVersionContent('');
    setIsAddingVersion(false);
    setSelectedVersion(version);
  };

  const handleExecute = async () => {
    if (!selectedVersion || !selectedPrompt) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      // Call backend to execute and evaluate
      const { execution, evaluation } = await db.executeVersion(selectedVersion.id);
      
      // Populate missing fields from frontend state
      execution.promptName = selectedPrompt.name;
      execution.versionNumber = selectedVersion.versionNumber;
      execution.evaluation = evaluation;

      setExecutionResult(execution);
    } catch (e) {
      console.error(e);
      alert(`Failed to execute prompt: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 h-[calc(100vh-120px)]">
      {/* Sidebar: Prompts */}
      <div className="col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Prompts</h3>
          <button onClick={() => setIsAddingPrompt(true)} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isAddingPrompt && (
            <div className="p-4 border-b border-blue-100 bg-blue-50 space-y-2">
              <input 
                autoFocus
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prompt name..."
                value={newPromptName}
                onChange={e => setNewPromptName(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={handleAddPrompt} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                <button onClick={() => setIsAddingPrompt(false)} className="text-xs text-slate-500">Cancel</button>
              </div>
            </div>
          )}
          {prompts.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPrompt(p)}
              className={`w-full text-left p-4 border-b border-slate-50 transition-colors flex justify-between items-center group ${selectedPrompt?.id === p.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}
            >
              <span className="font-medium truncate">{p.name}</span>
              <ChevronRight size={16} className={`text-slate-300 group-hover:text-blue-400 ${selectedPrompt?.id === p.id ? 'text-blue-500' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Version & Editor */}
      <div className="col-span-9 flex flex-col gap-6">
        {selectedPrompt ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedPrompt.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">Version</span>
                  <select 
                    className="text-sm border-none bg-slate-100 rounded px-2 py-0.5 focus:ring-0 cursor-pointer font-medium"
                    value={selectedVersion?.id || ''}
                    onChange={(e) => setSelectedVersion(versions.find(v => v.id === e.target.value) || null)}
                  >
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>v{v.versionNumber}</option>
                    ))}
                  </select>
                  <button onClick={() => setIsAddingVersion(true)} className="text-blue-600 hover:text-blue-700 text-xs font-semibold ml-2">+ New Version</button>
                </div>
              </div>
              <button 
                onClick={handleExecute}
                disabled={isRunning || !selectedVersion}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 shadow-md"
              >
                {isRunning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                Run Pipeline
              </button>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Prompt Template</span>
                {isAddingVersion && <span className="text-xs text-blue-600 font-semibold px-2">Creating v{versions.length + 1}</span>}
              </div>
              <div className="flex-1 relative">
                {isAddingVersion ? (
                  <div className="absolute inset-0 flex flex-col">
                    <textarea 
                      autoFocus
                      className="flex-1 w-full p-6 text-slate-800 font-mono text-sm resize-none focus:outline-none"
                      placeholder="Enter prompt content here... Use {{variable}} for placeholders."
                      value={newVersionContent}
                      onChange={e => setNewVersionContent(e.target.value)}
                    />
                    <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                      <button onClick={() => setIsAddingVersion(false)} className="px-4 py-1.5 text-sm text-slate-500">Discard</button>
                      <button onClick={handleAddVersion} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md flex items-center gap-2">
                        <Save size={14} /> Commit Version
                      </button>
                    </div>
                  </div>
                ) : (
                  <textarea 
                    readOnly
                    className="w-full h-full p-6 text-slate-800 font-mono text-sm resize-none focus:outline-none bg-white"
                    value={selectedVersion?.content || 'No versions available. Create one to begin.'}
                  />
                )}
              </div>
            </div>

            {/* Execution & Eval Results */}
            {executionResult && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-blue-400" />
                    <span className="font-medium">Latest Run Result</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">Latency: <b className="text-white">{executionResult.responseTime}ms</b></span>
                    <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">Overall Score: <b>{executionResult.evaluation?.overallScore}</b></span>
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-8 p-6 border-r border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Model Response</h4>
                    <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {executionResult.responseText}
                    </div>
                  </div>
                  <div className="col-span-4 p-6 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Automated Evaluation</h4>
                    <div className="space-y-4">
                      <EvalMetric label="Accuracy" value={executionResult.evaluation?.accuracy || 0} color="bg-blue-500" />
                      <EvalMetric label="Clarity" value={executionResult.evaluation?.clarity || 0} color="bg-emerald-500" />
                      <EvalMetric label="Hallucination Risk" value={executionResult.evaluation?.hallucinationRisk || 0} color="bg-red-500" reverse />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <FileText size={40} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium">Select or create a prompt to manage versions</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EvalMetric: React.FC<{ label: string; value: number; color: string; reverse?: boolean }> = ({ label, value, color, reverse }) => {
  const percentage = value;
  // If reverse (hallucination risk), lower is better. 
  // We use the same UI but color might change or interpretation
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PromptLibrary;
