'use client';

import { useState } from 'react';
import { 
  Settings, 
  Cloud, 
  ShieldCheck, 
  Bell, 
  Sliders, 
  Sparkles, 
  Check, 
  Save,
  Key,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [cloudName, setCloudName] = useState('rvoym2gw');
  const [uploadPreset, setUploadPreset] = useState('aqua_point');
  const [tdsThreshold, setTdsThreshold] = useState('100');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            System & Media Configuration <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Cloudinary upload presets, sensor alerts, and administrative security options.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : <Save className="w-4 h-4" />}
          {saved ? 'Settings Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Cloudinary Integration Section */}
      <div className="glass-panel-cyan rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Cloud className="w-4 h-4 text-cyan-400" /> Cloudinary Media Storage Helper
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cloud Name</label>
            <input
              type="text"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Unsigned Upload Preset</label>
            <input
              type="text"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20 text-xs text-slate-300">
          Upload API Endpoint: <span className="font-mono text-cyan-400">https://api.cloudinary.com/v1_1/{cloudName}/image/upload</span>
        </div>
      </div>

      {/* Telemetry Sensor Alerts */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Sliders className="w-4 h-4 text-cyan-400" /> Sensor & Telemetry Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">TDS Alert Threshold (PPM)</label>
            <input
              type="number"
              value={tdsThreshold}
              onChange={(e) => setTdsThreshold(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Triggers filter alert notification if output exceeds threshold</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Telemetry Heartbeat Interval</label>
            <select className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400">
              <option value="5">Every 5 Minutes (Realtime)</option>
              <option value="15">Every 15 Minutes (Standard)</option>
              <option value="60">Hourly Sync</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Profile & Security */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Admin Profile Credentials
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            MS
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Mahbub Shihab</h3>
            <p className="text-xs text-cyan-400">Super Administrator</p>
            <p className="text-[11px] text-slate-400">mahbub.shihab@aquapoint.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
