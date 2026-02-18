
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Activity, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    db.getMetrics().then(setStats);
  }, []);

  if (!stats) return (
    <div className="p-8 text-center text-slate-500">
      No execution data yet. Start by running a prompt version.
    </div>
  );

  const chartData = [
    { name: 'Accuracy', value: stats.avgAccuracy, color: '#3b82f6' },
    { name: 'Clarity', value: stats.avgClarity, color: '#10b981' },
    { name: 'Hallucination', value: stats.avgHallucination, color: '#ef4444' },
    { name: 'Overall', value: stats.avgOverall, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500">Real-time performance metrics and pipeline health.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Executions" 
          value={stats.totalExecutions} 
          icon={<Activity size={20} className="text-blue-500" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          label="Avg. Accuracy" 
          value={`${Math.round(stats.avgAccuracy)}%`} 
          icon={<CheckCircle2 size={20} className="text-emerald-500" />} 
          bg="bg-emerald-50"
        />
        <StatCard 
          label="Hallucination Risk" 
          value={`${Math.round(stats.avgHallucination)}%`} 
          icon={<AlertTriangle size={20} className="text-amber-500" />} 
          bg="bg-amber-50"
        />
        <StatCard 
          label="Overall Quality" 
          value={Math.round(stats.avgOverall)} 
          icon={<Clock size={20} className="text-purple-500" />} 
          bg="bg-purple-50"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-6">Performance Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: any; icon: React.ReactNode; bg: string }> = ({ label, value, icon, bg }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
    <div className={`${bg} p-3 rounded-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
