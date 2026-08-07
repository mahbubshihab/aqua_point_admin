'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Gift, 
  Award, 
  Phone, 
  Mail, 
  Calendar, 
  Copy, 
  Check, 
  Droplets,
  ShoppingBag,
  UserPlus,
  LayoutGrid,
  List
} from 'lucide-react';
import TableFooter from '@/core/components/TableFooter';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  rewardPoints: number;
  referralCode: string;
  activeDevices: number;
  totalOrders: number;
}

const initialCustomers: Customer[] = [
  {
    id: 'CUST-801',
    name: 'Mahbub Shihab',
    email: 'mahbub.shihab@aquapoint.com',
    phone: '+1 (555) 019-2834',
    joinedDate: '2025-01-15',
    rewardPoints: 1250,
    referralCode: 'AQUA-MAHBUB99',
    activeDevices: 3,
    totalOrders: 14,
  },
  {
    id: 'CUST-802',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    joinedDate: '2025-04-10',
    rewardPoints: 450,
    referralCode: 'AQUA-SARAH45',
    activeDevices: 1,
    totalOrders: 5,
  },
  {
    id: 'CUST-803',
    name: 'Marcus Vance',
    email: 'marcus.vance@techcorp.io',
    phone: '+1 (555) 876-5432',
    joinedDate: '2025-06-22',
    rewardPoints: 820,
    referralCode: 'AQUA-MARCUS82',
    activeDevices: 2,
    totalOrders: 8,
  },
  {
    id: 'CUST-804',
    name: 'Elena Rostova',
    email: 'elena.rostova@designstudio.org',
    phone: '+1 (555) 345-6789',
    joinedDate: '2025-09-05',
    rewardPoints: 310,
    referralCode: 'AQUA-ELENA31',
    activeDevices: 1,
    totalOrders: 3,
  },
  {
    id: 'CUST-805',
    name: 'David Kim',
    email: 'david.kim@innovate.co',
    phone: '+1 (555) 987-6543',
    joinedDate: '2025-11-18',
    rewardPoints: 600,
    referralCode: 'AQUA-KIM60',
    activeDevices: 2,
    totalOrders: 6,
  },
];

export default function CustomersView() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'All' | 'VIP' | 'Regular'>('All');

  const copyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.referralCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'VIP') return c.rewardPoints >= 800;
    if (statusFilter === 'Regular') return c.rewardPoints < 800;

    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Customers
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#4cceac] border border-[#2c3754]">
            {filteredCustomers.length} customers
          </span>
        </div>
        <button className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-[#00BCE1]/20 rounded-xl px-5 py-2.5 text-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer shrink-0">
          <UserPlus className="w-4 h-4 stroke-[2.5]" /> Register Customer
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-xl hover:border-[#4cceac]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Active Users</span>
            <div className="p-2.5 rounded-xl bg-[#4cceac]/15 text-[#4cceac]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">1,428</p>
          <span className="text-[11px] text-[#4cceac] font-medium mt-1 inline-block">+34 new this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-xl hover:border-[#4cceac]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Reward Points Issued</span>
            <div className="p-2.5 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b]">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-300 mt-2">342,900 <span className="text-xs text-slate-400 font-normal">PTS</span></p>
          <span className="text-[11px] text-[#4cceac] font-medium mt-1 inline-block">Aqua Loyalty Program</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f2940] border border-[#2c3754] shadow-xl hover:border-[#4cceac]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Referrals Converted</span>
            <div className="p-2.5 rounded-xl bg-[#4cceac]/15 text-[#4cceac]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#4cceac] mt-2">584</p>
          <span className="text-[11px] text-[#4cceac] font-medium mt-1 inline-block">+18% growth month-over-month</span>
        </div>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            {/* In-Page Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer by name, email, or referral code..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-slate-400 focus:outline-none focus:border-[#4cceac] transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#4cceac] cursor-pointer transition-all"
              >
                <option value="All">All Loyalty Tiers</option>
                <option value="VIP">VIP Gold (800+ PTS)</option>
                <option value="Regular">Standard Member</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#2c3754]">
            <div className="p-1 rounded-xl bg-[#141b2d] border border-[#2c3754] flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#4cceac]/20 text-[#4cceac] border border-[#4cceac]/40'
                    : 'text-[#A0AEC0] hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#4cceac]/20 text-[#4cceac] border border-[#4cceac]/40'
                    : 'text-[#A0AEC0] hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loyalty Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
          {(['All', 'VIP', 'Regular'] as const).map((tier) => {
            const label = tier === 'All' ? 'All Customers' : tier === 'VIP' ? 'VIP Gold Tier' : 'Standard Tier';
            const count = tier === 'All' ? customers.length : customers.filter(c => tier === 'VIP' ? c.rewardPoints >= 800 : c.rewardPoints < 800).length;
            const isActive = statusFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setStatusFilter(tier)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#4cceac] text-[#141b2d] font-bold shadow-md'
                    : 'bg-[#141b2d] text-[#A0AEC0] border border-[#2c3754] hover:text-white'
                }`}
              >
                <span>{label}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                  isActive ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#4cceac]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Reward Points</th>
                <th className="py-3.5 px-4">Devices</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#2c3754] transition-colors">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3e4396] to-[#4cceac] flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {cust.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div>{cust.name}</div>
                      <div className="text-[10px] text-[#4cceac] font-mono">{cust.id}</div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3 h-3 text-[#4cceac]" /> {cust.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#A0AEC0] text-[11px] mt-0.5">
                      <Phone className="w-3 h-3 text-[#4cceac]" /> {cust.phone}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => copyReferral(cust.referralCode)}
                      className="px-2.5 py-1 rounded-lg bg-[#141b2d] border border-[#2c3754] text-[#4cceac] font-mono text-[11px] flex items-center gap-1.5 hover:border-[#4cceac] transition-all cursor-pointer"
                      title="Click to copy referral code"
                    >
                      {cust.referralCode}
                      {copiedCode === cust.referralCode ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#A0AEC0]" />
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-4 font-bold text-amber-300">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      ⚡ {cust.rewardPoints} pts
                    </span>
                  </td>

                  <td className="py-4 px-4 font-medium text-slate-200">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-[#4cceac]" /> {cust.activeDevices} Units
                    </span>
                  </td>

                  <td className="py-4 px-4 font-medium text-slate-200">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-400" /> {cust.totalOrders} Orders
                    </span>
                  </td>

                  <td className="py-4 px-4 text-[#A0AEC0] text-[11px]">
                    {cust.joinedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter totalItems={filteredCustomers.length} />
      </div>
    </div>
  );
}
