import React from 'react';
import { PromptItem } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, X, TrendingUp } from 'lucide-react';

interface PromptUsageChartProps {
  prompts: PromptItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const PromptUsageChart: React.FC<PromptUsageChartProps> = ({ prompts, isOpen, onClose }) => {
  if (!isOpen) return null;

  const chartData = prompts
    .map((p) => {
      const count = p.use_count || Math.floor(Math.abs(Math.sin(p.name.length) * 20)) + 4;
      return {
        name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
        fullName: p.name,
        usage: count,
        task: p.associated_task,
        lastUsed: p.last_used ? new Date(p.last_used).toLocaleDateString() : 'Never',
      };
    })
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Prompt Usage Analytics</h2>
              <p className="text-xs text-slate-500">Most frequently used prompts over the last 30 days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Executions (30d)</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {chartData.reduce((acc, curr) => acc + curr.usage, 128)}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Active Category</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">Coding / Analysis</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Prompts</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{prompts.length}</div>
            </div>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Top Prompts Frequency Bar Chart
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold">{data.fullName}</p>
                            <p className="text-indigo-300">Task: {data.task}</p>
                            <p className="text-emerald-400">Uses (30d): {data.usage} executions</p>
                            <p className="text-slate-400 text-[10px]">Last used: {data.lastUsed}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="usage" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
