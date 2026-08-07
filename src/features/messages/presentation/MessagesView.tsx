'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  CheckCheck, 
  Wrench, 
  RefreshCw,
  Droplets,
  Check,
  Mail,
  Copy
} from 'lucide-react';
import { 
  CustomerThreadDoc, 
  CustomerMessageDoc, 
  subscribeToCustomerThreads, 
  subscribeToCustomerMessages, 
  sendAdminReply, 
  markThreadAsRead 
} from '@/core/services/firebase';

const INITIAL_DEMO_THREADS: CustomerThreadDoc[] = [
  {
    id: 'CUST-001',
    name: 'Sarah Ahmed',
    phone: '01711-223344',
    email: 'sarah.ahmed@example.com',
    address: 'House 42, Road 11, Banani, Dhaka',
    avatarUrl: '',
    lastMessage: 'When will the technician arrive for filter replacement?',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
  },
  {
    id: 'CUST-002',
    name: 'Tanvir Hossain',
    phone: '01822-334455',
    email: 'tanvir.h@example.com',
    address: 'Sector 4, Uttara, Dhaka',
    avatarUrl: '',
    lastMessage: 'Thanks! The TDS reading is now 35 PPM after servicing.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'CUST-003',
    name: 'Nusrat Jahan',
    phone: '01933-445566',
    email: 'nusrat.j@example.com',
    address: 'Dhanmondi 27, Dhaka',
    avatarUrl: '',
    lastMessage: 'Is the RO 7-stage membrane in stock for delivery?',
    lastMessageTime: '02 Aug',
    unreadCount: 1,
  },
  {
    id: 'CUST-004',
    name: 'Mahmudur Rahman',
    phone: '01644-556677',
    email: 'mahmud.r@example.com',
    address: 'Mirpur 10, Circle 1, Dhaka',
    avatarUrl: '',
    lastMessage: 'Payment complete for order #ORD-8821.',
    lastMessageTime: '28 Jul',
    unreadCount: 0,
  },
];

const INITIAL_DEMO_MESSAGES: Record<string, CustomerMessageDoc[]> = {
  'CUST-001': [
    { id: 'm1', text: 'Hello, I booked a service request for my RO purifier yesterday.', sender: 'customer', createdAt: { seconds: 1723024000 }, isRead: true },
    { id: 'm2', text: 'Hello Sarah! We have received your request.', sender: 'admin', createdAt: { seconds: 1723024300 }, isRead: true },
    { id: 'm3', text: 'When will the technician arrive for filter replacement?', sender: 'customer', createdAt: { seconds: 1723025400 }, isRead: false },
  ],
  'CUST-002': [
    { id: 'm10', text: 'Technician visited today. Everything looks good.', sender: 'customer', createdAt: { seconds: 1722900000 }, isRead: true },
    { id: 'm11', text: 'Thanks! The TDS reading is now 35 PPM after servicing.', sender: 'customer', createdAt: { seconds: 1722901000 }, isRead: true },
  ],
  'CUST-003': [
    { id: 'm20', text: 'Is the RO 7-stage membrane in stock for delivery?', sender: 'customer', createdAt: { seconds: 1722600000 }, isRead: false },
  ],
  'CUST-004': [
    { id: 'm30', text: 'Payment complete for order #ORD-8821.', sender: 'customer', createdAt: { seconds: 1722100000 }, isRead: true },
  ]
};

const QUICK_REPLIES = [
  'Your service technician is on the way! 🚚',
  'Water TDS test complete. Standard level is 45 ppm. 💧',
  'Thank you for contacting Aqua Point! How can we assist you today?',
  'Your order has been confirmed and packed for shipping. 📦'
];

function formatTime(timestamp: any): string {
  if (!timestamp) return 'Just now';
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp?.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return 'Just now';
}

export default function MessagesView() {
  const [threads, setThreads] = useState<CustomerThreadDoc[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-001');
  const [messages, setMessages] = useState<CustomerMessageDoc[]>([]);
  const [localDemoMessages, setLocalDemoMessages] = useState<Record<string, CustomerMessageDoc[]>>(INITIAL_DEMO_MESSAGES);
  const [replyInput, setReplyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to Customer Threads
  useEffect(() => {
    const unsub = subscribeToCustomerThreads((firestoreThreads) => {
      if (firestoreThreads && firestoreThreads.length > 0) {
        setThreads(firestoreThreads);
        if (!selectedCustomerId || !firestoreThreads.some(t => t.id === selectedCustomerId)) {
          setSelectedCustomerId(firestoreThreads[0].id);
        }
      } else {
        setThreads(INITIAL_DEMO_THREADS);
      }
    });

    return () => unsub();
  }, [selectedCustomerId]);

  // Subscribe to Selected Customer's Messages
  useEffect(() => {
    if (!selectedCustomerId) return;

    markThreadAsRead(selectedCustomerId).catch(console.error);

    const unsub = subscribeToCustomerMessages(selectedCustomerId, (firestoreMsgs) => {
      if (firestoreMsgs && firestoreMsgs.length > 0) {
        setMessages(firestoreMsgs);
      } else {
        setMessages(localDemoMessages[selectedCustomerId] || []);
      }
    });

    return () => unsub();
  }, [selectedCustomerId, localDemoMessages]);

  // Auto-scroll chat stream to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeCustomer = threads.find(t => t.id === selectedCustomerId) || threads[0] || INITIAL_DEMO_THREADS[0];

  const filteredThreads = threads.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || replyInput).trim();
    if (!content || !selectedCustomerId || isSending) return;

    setIsSending(true);
    try {
      // Send to Firestore
      await sendAdminReply(selectedCustomerId, content);

      // Local state fallback update
      const newMsg: CustomerMessageDoc = {
        id: 'msg-' + Date.now(),
        text: content,
        sender: 'admin',
        createdAt: new Date(),
        isRead: true,
      };

      setLocalDemoMessages(prev => ({
        ...prev,
        [selectedCustomerId]: [...(prev[selectedCustomerId] || []), newMsg]
      }));

      setThreads(prev => prev.map(t => {
        if (t.id === selectedCustomerId) {
          return {
            ...t,
            lastMessage: content,
            lastMessageTime: 'Just now',
            unreadCount: 0,
          };
        }
        return t;
      }));

      if (!textToSend) setReplyInput('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInfo(label);
    setTimeout(() => setCopiedInfo(null), 2000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#00BCE1]/15 text-[#00BCE1] border border-[#00BCE1]/30 shadow-lg shadow-[#00BCE1]/10">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Live Support Inbox
              {totalUnread > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#00BCE1] text-[#141b2d] animate-pulse">
                  {totalUnread} new
                </span>
              )}
            </h1>
            <p className="text-xs text-[#A0AEC0] mt-0.5">
              Real-time customer messaging & instant support dispatch center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#1f2940] border border-[#2c3754] flex items-center gap-2 text-xs font-medium text-slate-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Firestore Live Sync</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
        {/* LEFT PANEL: Customer Threads List */}
        <div className="lg:col-span-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {/* Search Header */}
          <div className="p-4 border-b border-[#2c3754] bg-[#141b2d]/60 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers or phone..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 placeholder-[#A0AEC0] focus:outline-none focus:border-[#00BCE1] transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A0AEC0] px-1 font-medium">
              <span>{filteredThreads.length} Conversations</span>
              <span>Sorted by Recent</span>
            </div>
          </div>

          {/* Customer Threads Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2c3754]/50 scrollbar-thin">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
                <p>No customer chats found matching search.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedCustomerId;
                const initials = thread.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedCustomerId(thread.id);
                      markThreadAsRead(thread.id).catch(console.error);
                    }}
                    className={`w-full text-left p-4 transition-all duration-200 flex items-start gap-3.5 cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#3e4396]/30 border-l-4 border-[#00BCE1]'
                        : 'hover:bg-[#141b2d]/40'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {thread.avatarUrl ? (
                        <img 
                          src={thread.avatarUrl} 
                          alt={thread.name} 
                          className="w-11 h-11 rounded-full object-cover border border-[#00BCE1]/40"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-bold text-xs shadow-md">
                          {initials}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1f2940]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#00BCE1]' : 'text-white'}`}>
                          {thread.name}
                        </h4>
                        <span className="text-[10px] text-[#A0AEC0] shrink-0 font-mono">
                          {formatTime(thread.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mb-1">
                        {thread.lastMessage || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#A0AEC0]">
                        <span className="font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-[#00BCE1]" /> {thread.phone}
                        </span>
                        {thread.unreadCount && thread.unreadCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#00BCE1] text-[#141b2d] font-bold text-[10px] shadow-sm">
                            {thread.unreadCount} new
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Chat Conversation Window */}
        <div className="lg:col-span-8 bg-[#1f2940] border border-[#2c3754] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {activeCustomer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#2c3754] bg-[#141b2d]/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                    {activeCustomer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{activeCustomer.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active Customer
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A0AEC0] mt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#00BCE1]" /> {activeCustomer.phone}
                      </span>
                      {activeCustomer.address && (
                        <span className="flex items-center gap-1 text-slate-300 truncate max-w-[240px]" title={activeCustomer.address}>
                          <MapPin className="w-3 h-3 text-[#00BCE1]" /> {activeCustomer.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeCustomer.phone}`}
                    className="p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-[#00BCE1] hover:bg-[#00BCE1]/15 hover:border-[#00BCE1] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Call Customer Phone"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(activeCustomer.phone, 'phone')}
                    className="p-2.5 rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                    title="Copy Phone Number"
                  >
                    {copiedInfo === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#141b2d]/40 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="p-4 rounded-full bg-[#3e4396]/30 text-[#00BCE1] border border-[#3e4396]/50">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Start the conversation</h4>
                    <p className="text-xs text-[#A0AEC0] max-w-sm">
                      Send a message to {activeCustomer.name} to offer support, schedule servicing, or respond to inquiries.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex items-end gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#3e4396] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {activeCustomer.name[0]}
                          </div>
                        )}

                        <div className={`max-w-[75%] space-y-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                              isAdmin
                                ? 'bg-gradient-to-r from-[#00BCE1] to-[#008cb0] text-[#141b2d] font-medium rounded-br-none'
                                : 'bg-[#2c3754] text-white border border-[#374568] rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>

                          <div className={`flex items-center gap-1.5 text-[10px] text-[#A0AEC0] px-1 font-mono ${
                            isAdmin ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{formatTime(msg.createdAt)}</span>
                            {isAdmin && (
                              <CheckCheck className="w-3 h-3 text-[#00BCE1]" />
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#00BCE1]/20 border border-[#00BCE1]/40 flex items-center justify-center text-[#00BCE1] text-[11px] font-bold shrink-0">
                            Admin
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Bar */}
              <div className="px-4 py-2 bg-[#141b2d]/70 border-t border-[#2c3754] flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] uppercase font-bold text-[#A0AEC0] shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#00BCE1]" /> Quick Reply:
                </span>
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="px-3 py-1 text-[11px] rounded-full bg-[#1f2940] border border-[#2c3754] text-slate-300 hover:text-white hover:border-[#00BCE1] transition-all whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Bottom Reply Input Bar */}
              <div className="p-4 bg-[#1f2940] border-t border-[#2c3754] flex items-center gap-3">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Type reply to ${activeCustomer.name}...`}
                  disabled={isSending}
                  className="flex-1 px-4 py-3 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-100 placeholder-[#A0AEC0] focus:outline-none focus:border-[#00BCE1] transition-all disabled:opacity-50"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!replyInput.trim() || isSending}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-[#00BCE1]/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send Reply</span>
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <User className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-white">Select a customer from the left list</p>
              <p className="text-xs text-[#A0AEC0] mt-1">Choose any customer thread to begin live chat support</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
