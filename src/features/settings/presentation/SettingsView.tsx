'use client';

import { useState, useEffect } from 'react';
import { 
  Building2,
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Share2, 
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

// Authentic Social Media Brand Icons
const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsappIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'contact' | 'social'>('all');

  // Company Contact & Social Media State
  const [contactInfo, setContactInfo] = useState<CompanySettingsDoc>(DEFAULT_COMPANY_SETTINGS);

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
      setToastMessage('Settings updated successfully!');
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setToastMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl relative pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="glass-panel-cyan px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(0,188,225,0.35)] border border-cyan-400/40 flex items-center gap-3 text-white backdrop-blur-xl">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-xs font-medium pr-2">
              <span className="font-semibold text-cyan-300 block">Saved</span>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Settings
          </h1>
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

      {/* Simplified Tabs */}
      <div className="p-2 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl flex items-center gap-2 w-fit">
        {[
          { id: 'all', label: 'All Sections' },
          { id: 'contact', label: 'Contact Info' },
          { id: 'social', label: 'Social Links' },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as 'all' | 'contact' | 'social')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#00BCE1] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contact Info Card */}
      {(activeSection === 'all' || activeSection === 'contact') && (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#2c3754] pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#00BCE1]/10 border border-[#00BCE1]/20 text-[#00BCE1]">
                <Building2 className="w-4 h-4" />
              </div>
              Contact Info
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00BCE1]" /> Phone 1
              </label>
              <input
                type="text"
                value={contactInfo.phone1}
                onChange={(e) => handleChange('phone1', e.target.value)}
                placeholder="01780-885841"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#00BCE1] transition-colors"
              />
            </div>

            {/* Phone 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00BCE1]" /> Phone 2
              </label>
              <input
                type="text"
                value={contactInfo.phone2}
                onChange={(e) => handleChange('phone2', e.target.value)}
                placeholder="09613 700 750"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#00BCE1] transition-colors"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <WhatsappIcon className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp
              </label>
              <input
                type="text"
                value={contactInfo.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+8801780885841"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#00BCE1] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#00BCE1]" /> Email
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="aquabd112@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#00BCE1] transition-colors"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00BCE1]" /> Address
              </label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="House 72, Janata Housing Road, 3 Ring Road, Dhaka 1219"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white focus:outline-none focus:border-[#00BCE1] transition-colors"
              />
            </div>

            {/* Maps URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00BCE1]" /> Maps URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={contactInfo.googleMapsUrl}
                  onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#00BCE1] transition-colors"
                />
                {contactInfo.googleMapsUrl && (
                  <a
                    href={contactInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] hover:border-[#00BCE1] text-[#A0AEC0] hover:text-[#00BCE1] transition-colors shrink-0 flex items-center justify-center"
                    title="Open Map Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Links Card */}
      {(activeSection === 'all' || activeSection === 'social') && (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#2c3754] pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Share2 className="w-4 h-4" />
              </div>
              Social Links
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FacebookIcon className="w-4 h-4 text-[#1877F2]" /> Facebook
              </label>
              <input
                type="url"
                value={contactInfo.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#1877F2] transition-colors"
              />
            </div>

            {/* WhatsApp Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <WhatsappIcon className="w-4 h-4 text-[#25D366]" /> WhatsApp Link
              </label>
              <input
                type="url"
                value={contactInfo.whatsappLink}
                onChange={(e) => handleChange('whatsappLink', e.target.value)}
                placeholder="https://wa.me/8801780885841"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#25D366] transition-colors"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <YoutubeIcon className="w-4 h-4 text-[#FF0000]" /> YouTube
              </label>
              <input
                type="url"
                value={contactInfo.youtubeUrl}
                onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#FF0000] transition-colors"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <InstagramIcon className="w-4 h-4 text-[#E4405F]" /> Instagram
              </label>
              <input
                type="url"
                value={contactInfo.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#E4405F] transition-colors"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
              </label>
              <input
                type="url"
                value={contactInfo.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-[#0A66C2] transition-colors"
              />
            </div>

            {/* X / Twitter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <XIcon className="w-4 h-4 text-slate-200" /> X / Twitter
              </label>
              <input
                type="url"
                value={contactInfo.twitterUrl || ''}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                placeholder="https://x.com/yourhandle"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white font-mono focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
