'use client';

import { 
  BarChart3, 
  TrendingUp, 
  Droplets, 
  Activity, 
  Zap, 
  Award, 
  Globe, 
  Sliders
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Hydration & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System analytics and water quality metrics.
          </p>
        </div>
      </div>

      {/* Grid of Key Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Average Network TDS</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">38.4 <span className="text-sm font-normal text-cyan-400">PPM</span></p>
          <p className="text-xs text-emerald-400">99.8% within WHO drinking water standards</p>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400 w-[35%]" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Filter Lifespan Efficiency</span>
            <Droplets className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">92.1%</p>
          <p className="text-xs text-cyan-400">Predictive maintenance algorithm operational</p>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 w-[92%]" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Customer Retention</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">98.4%</p>
          <p className="text-xs text-emerald-400">High satisfaction score across regions</p>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400 w-[98%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
