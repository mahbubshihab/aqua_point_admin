'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  CheckCheck, 
  RefreshCw,
  User,
  Check,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, CustomerThreadDoc, CustomerMessageDoc, markThreadAsRead } from '@/core/services/firebase';

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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [messages, setMessages] = useState<CustomerMessageDoc[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 100% Dynamic Firestore Sync: Subscribe to 'customers' collection
  useEffect(() => {
    const q = query(collection(db, 'customers'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const threadList: CustomerThreadDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || data.customerName || 'Customer',
            phone: data.phone || 'N/A',
            email: data.email || '',
            address: data.address || '',
            avatarUrl: data.avatarUrl || data.photoURL || '',
            lastMessage: data.lastMessage || data.lastMessageText || '',
            lastMessageTime: data.lastMessageTime || data.updatedAt || data.createdAt,
            unreadCount: Number(data.unreadCount) || 0,
          };
        });

        setThreads(threadList);
        setSelectedCustomerId((prev) => {
          if (prev && threadList.some((t) => t.id === prev)) return prev;
          return threadList.length > 0 ? threadList[0].id : '';
        });
      },
      (error) => {
        console.error('Error fetching customers snapshot:', error);
      }
    );

    return () => unsub();
  }, []);

  // 100% Dynamic Firestore Sync: Subscribe to 'customers/{selectedUserId}/messages' ordered by createdAt asc
  useEffect(() => {
    if (!selectedCustomerId) {
      setMessages([]);
      return;
    }

    markThreadAsRead(selectedCustomerId).catch(console.error);

    const msgsQuery = query(
      collection(db, 'customers', selectedCustomerId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(
      msgsQuery,
      (snapshot) => {
        const msgList: CustomerMessageDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            text: data.text || data.message || data.content || '',
            sender: data.sender || 'customer',
            createdAt: data.createdAt,
            isRead: data.isRead !== undefined ? Boolean(data.isRead) : true,
          };
        });
        setMessages(msgList);
      },
      (error) => {
        console.error('Error fetching messages snapshot with orderBy, attempting fallback query:', error);
        const fallbackQuery = query(collection(db, 'customers', selectedCustomerId, 'messages'));
        onSnapshot(fallbackQuery, (snapshot) => {
          const msgList: CustomerMessageDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              text: data.text || data.message || data.content || '',
              sender: data.sender || 'customer',
              createdAt: data.createdAt,
              isRead: data.isRead !== undefined ? Boolean(data.isRead) : true,
            };
          });
          msgList.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeA - timeB;
          });
          setMessages(msgList);
        });
      }
    );

    return () => unsub();
  }, [selectedCustomerId]);

  // Auto-scroll chat stream to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeCustomer = threads.find((t) => t.id === selectedCustomerId);

  const filteredThreads = threads.filter(
    (t) =>
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || replyInput).trim();
    if (!content || !selectedCustomerId || isSending) return;

    setIsSending(true);
    try {
      // Add message to customers/{selectedUserId}/messages
      const msgRef = collection(db, 'customers', selectedCustomerId, 'messages');
      await addDoc(msgRef, {
        text: content,
        sender: 'admin',
        createdAt: serverTimestamp(),
        isRead: true,
      });

      // Update customer document lastMessage and lastMessageTime
      const custRef = doc(db, 'customers', selectedCustomerId);
      await setDoc(
        custRef,
        {
          lastMessage: content,
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        },
        { merge: true }
      );

      if (!textToSend) setReplyInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
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
    <div className="h-[calc(100vh-100px)] overflow-hidden flex flex-col pb-2">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-3 px-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight">Inbox</h1>
          {totalUnread > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#00BCE1] text-[#141b2d]">
              {totalUnread} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300">Live Sync</span>
        </div>
      </div>

      {/* Main Dual-Pane Grid */}
      <div className="grid grid-cols-12 gap-4 flex-1 h-full min-h-0">
        {/* LEFT PANEL: Customer Conversations List */}
        <div className={`col-span-12 md:col-span-4 flex flex-col h-full overflow-hidden bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl ${
          selectedCustomerId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Header */}
          <div className="p-3 border-b border-slate-700/60 bg-[#0F172A]/60 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0F172A] border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] transition-all"
              />
            </div>
          </div>

          {/* Customer Threads Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                <MessageSquare className="w-6 h-6 text-slate-500 mx-auto opacity-50" />
                <p className="text-slate-300 font-medium">No Conversations Yet</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedCustomerId;
                const initials = thread.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedCustomerId(thread.id);
                      markThreadAsRead(thread.id).catch(console.error);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-150 flex items-start gap-3 cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#3e4396]/40 border-l-4 border-[#00BCE1]'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {thread.avatarUrl ? (
                        <img 
                          src={thread.avatarUrl} 
                          alt={thread.name} 
                          className="w-10 h-10 rounded-full object-cover border border-[#00BCE1]/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-bold text-xs shadow-md">
                          {initials}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1E293B]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#00BCE1]' : 'text-white'}`}>
                          {thread.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formatTime(thread.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mb-1">
                        {thread.lastMessage || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
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

        {/* RIGHT PANEL: Active Chat Window */}
        <div className={`col-span-12 md:col-span-8 flex flex-col h-full overflow-hidden bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl ${
          selectedCustomerId ? 'flex' : 'hidden md:flex'
        }`}>
          {activeCustomer ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-700/60 bg-[#0F172A]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedCustomerId(null)}
                    className="md:hidden p-2 rounded-xl bg-[#141b2d] border border-[#2c3754] text-[#00BCE1] hover:text-white"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3e4396] to-[#00BCE1] flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                    {activeCustomer.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{activeCustomer.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active Customer
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400 mt-0.5 font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#00BCE1]" /> {activeCustomer.phone}
                      </span>
                      {activeCustomer.address && (
                        <span className="flex items-center gap-1 text-slate-300 truncate max-w-[200px]" title={activeCustomer.address}>
                          <MapPin className="w-3 h-3 text-[#00BCE1]" /> {activeCustomer.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeCustomer.phone}`}
                    className="p-2 rounded-xl bg-[#0F172A] border border-slate-700 text-[#00BCE1] hover:bg-[#00BCE1]/15 hover:border-[#00BCE1] transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Call Customer Phone"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(activeCustomer.phone, 'phone')}
                    className="p-2 rounded-xl bg-[#0F172A] border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                    title="Copy Phone Number"
                  >
                    {copiedInfo === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="p-3 rounded-full bg-[#3e4396]/30 text-[#00BCE1] border border-[#3e4396]/50">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold text-white">No messages yet</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Send a message to {activeCustomer.name} to start the conversation.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-[#3e4396] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {activeCustomer.name[0]}
                          </div>
                        )}

                        <div className={`max-w-[75%] space-y-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                              isAdmin
                                ? 'bg-gradient-to-r from-[#00BCE1] to-[#008cb0] text-[#141b2d] font-medium rounded-br-none'
                                : 'bg-[#0F172A] text-white border border-slate-700 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>

                          <div
                            className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 font-mono ${
                              isAdmin ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isAdmin && <CheckCheck className="w-3 h-3 text-[#00BCE1]" />}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-[#00BCE1]/20 border border-[#00BCE1]/40 flex items-center justify-center text-[#00BCE1] text-[10px] font-bold shrink-0">
                            Admin
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sticky Bottom Chat Input Bar */}
              <div className="shrink-0 bg-[#1E293B] border-t border-slate-700/60">
                {/* Quick Reply Bar */}
                <div className="px-3 py-1.5 bg-[#0F172A]/70 border-b border-slate-700/40 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#00BCE1]" /> Quick Reply:
                  </span>
                  {QUICK_REPLIES.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(reply)}
                      className="px-2.5 py-0.5 text-[11px] rounded-full bg-[#1E293B] border border-slate-700 text-slate-300 hover:text-white hover:border-[#00BCE1] transition-all whitespace-nowrap cursor-pointer shrink-0"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Reply Input Bar */}
                <div className="p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Reply to ${activeCustomer.name}...`}
                    disabled={isSending}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0F172A] border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] transition-all disabled:opacity-50"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!replyInput.trim() || isSending}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-[#00BCE1]/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <User className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-white">No Conversations Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When customers reach out, their messages will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
