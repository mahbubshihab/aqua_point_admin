'use client';

import { 
  BarChart3, 
  TrendingUp, 
  Droplets, 
  Activity, 
  Sparkles, 
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
            Hydration & Revenue Analytics <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep insights into water purity performance, filter lifecycle metrics, and customer growth trends.
          </p>
        </div>
      </div>

      {/* Grid of Key Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-cyan rounded-2xl p-6 space-y-4">
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

        <div className="glass-panel-cyan rounded-2xl p-6 space-y-4">
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

        <div className="glass-panel-cyan rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Customer Retention</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">96.4%</p>
          <p className="text-xs text-emerald-400">+4.2% increase after rewards launch</p>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400 w-[96%]" />
          </div>
        </div>
      </div>

      {/* Regional Consumption Breakdown */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" /> Regional Hydration Telemetry
        </h2>
        <div className="space-y-4">
          {[
            { region: 'North District - Urban Hub', volume: '18,400 Liters/day', tds: '42 PPM', health: '98%' },
            { region: 'South District - Residential Area', volume: '14,200 Liters/day', tds: '36 PPM', health: '95%' },
            { region: 'Central Commercial Plaza', volume: '22,900 Liters/day', tds: '40 PPM', health: '99%' },
            { region: 'West Bay Sector', volume: '9,800 Liters/day', tds: '45 PPM', health: '91%' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">{item.region}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Purified Volume: {item.volume}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 font-bold">
                  Avg TDS: {item.tds}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 font-bold">
                  Health: {item.health}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
