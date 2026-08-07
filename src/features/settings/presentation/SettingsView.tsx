'use client';

import { useState, useEffect } from 'react';
import { 
  Building2,
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Share2, 
  MessageSquare,
  Cloud, 
  ShieldCheck, 
  Sliders, 
  Check, 
  Save, 
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  CompanySettingsDoc, 
  DEFAULT_COMPANY_SETTINGS, 
  subscribeToCompanyInfo, 
  saveCompanyInfoToFirestore 
} from '@/core/services/firebase';

const FacebookIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Company Contact & Social Media State
  const [contactInfo, setContactInfo] = useState<CompanySettingsDoc>(DEFAULT_COMPANY_SETTINGS);

  // Helper Configuration States (Preserved)
  const [cloudName, setCloudName] = useState('rvoym2gw');
  const [uploadPreset, setUploadPreset] = useState('aqua_point');
  const [tdsThreshold, setTdsThreshold] = useState('100');

  useEffect(() => {
    const unsubscribe = subscribeToCompanyInfo((info) => {
      setContactInfo(info);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (field: keyof CompanySettingsDoc, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCompanyInfoToFirestore(contactInfo);
      setToastMessage('Contact information & social media links updated successfully!');
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    } catch (error) {
      console.error('Failed to save settings to Firestore:', error);
      setToastMessage('Failed to save settings to Cloud Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl relative pb-12">
      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="glass-panel-cyan px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(0,188,225,0.35)] border border-cyan-400/40 flex items-center gap-3 text-white backdrop-blur-xl">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-xs font-medium pr-2">
              <span className="font-semibold text-cyan-300 block">Changes Saved</span>
              <span className="text-slate-300">{toastMessage}</span>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Settings
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#4cceac] border border-[#2c3754]">
            System Config
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-6 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Unified Section Toolbar */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'company', label: 'Company Contact' },
            { id: 'social', label: 'Social Channels' },
            { id: 'cloudinary', label: 'Cloudinary Storage' },
            { id: 'telemetry', label: 'Telemetry & Sensors' },
            { id: 'admin', label: 'Admin Security' },
          ].map((tab, idx) => (
            <span
              key={tab.id}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                idx === 0
                  ? 'bg-[#4cceac] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(76,206,172,0.4)]'
                  : 'bg-[#141b2d] text-slate-400 border border-[#2c3754] hover:text-white'
              }`}
            >
              {tab.label}
            </span>
          ))}
        </div>
      </div>

      {/* Company Contact Information Card */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2c3754] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3e4396] text-[#4cceac]">
              <Building2 className="w-4 h-4" />
            </div>
            Company Contact Information
          </h2>
          <span className="text-[11px] text-[#4cceac] font-mono bg-[#141b2d] px-2.5 py-1 rounded-full border border-[#2c3754]">
            Firestore: company_info
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone / Helpline 1 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#4cceac]" /> Phone / Helpline 1
            </label>
            <input
              type="text"
              value={contactInfo.phone1}
              onChange={(e) => handleChange('phone1', e.target.value)}
              placeholder="e.g. 01780-885841"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* Phone / Hotline 2 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#4cceac]" /> Phone / Hotline 2
            </label>
            <input
              type="text"
              value={contactInfo.phone2}
              onChange={(e) => handleChange('phone2', e.target.value)}
              placeholder="e.g. 09613 700 750"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number
            </label>
            <input
              type="text"
              value={contactInfo.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="e.g. +8801780885841"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#4cceac]" /> Official Email
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. aquabd112@gmail.com"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* Office Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Office Address
            </label>
            <input
              type="text"
              value={contactInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. House 72, Janata Housing Road, 3 Ring Road, Dhaka 1219"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* Google Maps URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#4cceac]" /> Google Maps URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={contactInfo.googleMapsUrl}
                onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
              />
              {contactInfo.googleMapsUrl && (
                <a
                  href={contactInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#4cceac] text-[#A0AEC0] hover:text-[#4cceac] transition-colors shrink-0 flex items-center justify-center"
                  title="Test Map Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links Card */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2c3754] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3e4396] text-[#4cceac]">
              <Share2 className="w-4 h-4" />
            </div>
            Social Media Links
          </h2>
          <span className="text-[11px] text-[#A0AEC0] font-mono">
            Public Channels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Facebook Page URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FacebookIcon className="w-3.5 h-3.5 text-blue-400" /> Facebook Page URL
            </label>
            <input
              type="url"
              value={contactInfo.facebookUrl}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* WhatsApp Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Link
            </label>
            <input
              type="url"
              value={contactInfo.whatsappLink}
              onChange={(e) => handleChange('whatsappLink', e.target.value)}
              placeholder="https://wa.me/8801780885841"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* YouTube Channel URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <YoutubeIcon className="w-3.5 h-3.5 text-red-500" /> YouTube Channel URL
            </label>
            <input
              type="url"
              value={contactInfo.youtubeUrl}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* Instagram URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-400" /> Instagram URL
            </label>
            <input
              type="url"
              value={contactInfo.instagramUrl}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <LinkedinIcon className="w-3.5 h-3.5 text-blue-500" /> LinkedIn URL
            </label>
            <input
              type="url"
              value={contactInfo.linkedinUrl}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Cloudinary Integration Section */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#2c3754] pb-3">
          <Cloud className="w-4 h-4 text-[#4cceac]" /> Cloudinary Media Storage Helper
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cloud Name</label>
            <input
              type="text"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Unsigned Upload Preset</label>
            <input
              type="text"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#4cceac]"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#141b2d] border border-[#2c3754] text-xs text-slate-300">
          Upload API Endpoint: <span className="font-mono text-[#4cceac]">https://api.cloudinary.com/v1_1/{cloudName}/image/upload</span>
        </div>
      </div>

      {/* Telemetry Sensor Alerts */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#2c3754] pb-3">
          <Sliders className="w-4 h-4 text-[#4cceac]" /> Sensor & Telemetry Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">TDS Alert Threshold (PPM)</label>
            <input
              type="number"
              value={tdsThreshold}
              onChange={(e) => setTdsThreshold(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#4cceac]"
            />
            <span className="text-[10px] text-[#A0AEC0] mt-1 block">Triggers filter alert notification if output exceeds threshold</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Telemetry Heartbeat Interval</label>
            <select className="w-full px-3 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#4cceac]">
              <option value="5">Every 5 Minutes (Realtime)</option>
              <option value="15">Every 15 Minutes (Standard)</option>
              <option value="60">Hourly Sync</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Profile & Security */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#2c3754] pb-3">
          <ShieldCheck className="w-4 h-4 text-[#4cceac]" /> Admin Profile Credentials
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#3e4396] flex items-center justify-center text-white font-bold text-lg border border-[#4cceac]/30 shadow-md">
            MS
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Mahbub Shihab</h3>
            <p className="text-xs text-[#4cceac]">Super Administrator</p>
            <p className="text-[11px] text-[#A0AEC0]">mahbub.shihab@aquapoint.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
