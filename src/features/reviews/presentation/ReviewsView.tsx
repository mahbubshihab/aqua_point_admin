'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Star,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
  LayoutGrid,
  List,
  Check,
  Ban,
  Plus,
  X
} from 'lucide-react';
import {
  db,
  REVIEWS_COLLECTION,
  addReviewToFirestore,
  updateReviewInFirestore,
  deleteReviewFromFirestore,
  ReviewDoc
} from '@/core/services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import TableFooter from '@/core/components/TableFooter';
import { useSearch } from '@/core/context/SearchContext';

export default function ReviewsView() {
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [ratingFilter, setRatingFilter] = useState<'All' | number>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [visibleCount, setVisibleCount] = useState(10);

  // Add Review Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [deletingReview, setDeletingReview] = useState<ReviewDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  // 100% Real-time Firestore Sync
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ReviewDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            customerName: data.customerName || data.name || data.userName || 'Anonymous Customer',
            location: data.location || data.userLocation || 'Dhaka',
            rating: Number(data.rating) || 5,
            comment: data.comment || data.reviewText || data.text || '',
            isApproved: data.isApproved !== undefined ? Boolean(data.isApproved) : false,
            createdAt: data.createdAt,
          };
        });
        setReviews(list);
        setLoading(false);
      },
      (error) => {
        console.warn('Ordered query fallback to raw collection snapshot:', error);
        const fallbackUnsub = onSnapshot(collection(db, REVIEWS_COLLECTION), (snapshot) => {
          const list: ReviewDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              customerName: data.customerName || data.name || data.userName || 'Anonymous Customer',
              location: data.location || data.userLocation || 'Dhaka',
              rating: Number(data.rating) || 5,
              comment: data.comment || data.reviewText || data.text || '',
              isApproved: data.isApproved !== undefined ? Boolean(data.isApproved) : false,
              createdAt: data.createdAt,
            };
          });
          setReviews(list);
          setLoading(false);
        });
        return fallbackUnsub;
      }
    );

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setNewCustomerName('');
    setNewRating(5);
    setNewComment('');
    setNewLocation('');
    setFormError('');
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!newComment.trim()) {
      setFormError('Comment is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await addReviewToFirestore({
        customerName: newCustomerName.trim(),
        rating: Number(newRating),
        comment: newComment.trim(),
        location: newLocation.trim() || 'Dhaka',
        isApproved: true,
      });

      setSuccessMessage('Review created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating review:', err);
      setFormError(err.message || 'Failed to create review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary Metrics calculated live
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterApproved === 'approved' && !r.isApproved) return false;
    if (filterApproved === 'pending' && r.isApproved) return false;
    if (ratingFilter !== 'All' && r.rating !== Number(ratingFilter)) return false;

    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      const matchName = r.customerName.toLowerCase().includes(term);
      const matchLocation = r.location.toLowerCase().includes(term);
      const matchComment = r.comment.toLowerCase().includes(term);
      if (!matchName && !matchLocation && !matchComment) return false;
    }

    return true;
  });

  // Action Controls
  const handleApprove = async (revId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await updateReviewInFirestore(revId, { isApproved: true });
      setSuccessMessage('Review approved & published.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error approving review:', err);
    }
  };

  const handleReject = async (revId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await updateReviewInFirestore(revId, { isApproved: false });
      setSuccessMessage('Review status set to Pending.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error rejecting review:', err);
    }
  };

  const confirmDeleteReview = async () => {
    if (!deletingReview) return;
    setIsDeleting(true);
    try {
      await deleteReviewFromFirestore(deletingReview.id);
      setSuccessMessage(`Review by "${deletingReview.customerName}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setDeletingReview(null);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert(`Failed to delete review: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Reviews
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-[#141b2d] text-[#00BCE1] border border-[#2c3754]">
            {filteredReviews.length} reviews
          </span>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-5 py-2.5 transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Review
        </button>
      </div>

      {/* Dynamic Summary Stats in 2 Lines on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center gap-2.5 sm:gap-3 shadow-xl min-w-0">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#00BCE1]/15 border border-[#00BCE1]/30 text-[#00BCE1] shrink-0">
            <MessageSquareQuote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Total Reviews</p>
            <p className="text-base sm:text-lg font-bold text-white leading-tight">{totalReviews}</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center gap-2.5 sm:gap-3 shadow-xl min-w-0">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Approved</p>
            <p className="text-base sm:text-lg font-bold text-white leading-tight">{approvedCount}</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center gap-2.5 sm:gap-3 shadow-xl min-w-0">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Pending</p>
            <p className="text-base sm:text-lg font-bold text-white leading-tight">{pendingCount}</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[#1f2940] border border-[#2c3754] flex items-center gap-2.5 sm:gap-3 shadow-xl min-w-0">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#f59e0b]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Average Rating</p>
            <p className="text-base sm:text-lg font-bold text-white leading-tight">{avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Consolidated Filter Bar */}
      <div className="p-4 bg-[#1f2940] border border-[#2c3754] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <div className="relative w-full sm:w-48">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-slate-200 focus:outline-none focus:border-[#00BCE1] cursor-pointer"
              >
                <option value="All">All Star Ratings</option>
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★☆</option>
                <option value={3}>3 Stars ★★★☆☆</option>
                <option value={2}>2 Stars ★★☆☆☆</option>
                <option value={1}>1 Star ★☆☆☆☆</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#2c3754]">
            <div className="p-1 rounded-xl bg-[#141b2d] border border-[#2c3754] flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#3e4396] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#3e4396] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Approval Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2c3754] scrollbar-none">
          <button
            onClick={() => setFilterApproved('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              filterApproved === 'all'
                ? 'bg-[#00BCE1] text-[#141b2d] font-bold shadow-[0_0_15px_rgba(0,188,225,0.4)]'
                : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
            }`}
          >
            <span>All Reviews</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
              filterApproved === 'all' ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#00BCE1]'
            }`}>
              {totalReviews}
            </span>
          </button>

          <button
            onClick={() => setFilterApproved('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              filterApproved === 'approved'
                ? 'bg-emerald-500 text-[#141b2d] font-bold shadow-md'
                : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
            }`}
          >
            <span>Approved</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
              filterApproved === 'approved' ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-emerald-400'
            }`}>
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterApproved('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              filterApproved === 'pending'
                ? 'bg-[#f59e0b] text-[#141b2d] font-bold shadow-md'
                : 'bg-[#141b2d] text-slate-400 hover:text-white border border-[#2c3754]'
            }`}
          >
            <span>Pending</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
              filterApproved === 'pending' ? 'bg-[#141b2d]/25 text-[#141b2d]' : 'bg-white/10 text-[#f59e0b]'
            }`}>
              {pendingCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#00BCE1] animate-spin" />
          <p className="text-xs text-[#A0AEC0]">Syncing reviews from Firestore in real-time...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl p-16 text-center space-y-4">
          <MessageSquareQuote className="w-12 h-12 text-[#A0AEC0] mx-auto" />
          <h3 className="text-base font-bold text-white">No Reviews Found</h3>
          <p className="text-xs text-[#A0AEC0] max-w-sm mx-auto">
            {searchTerm || filterApproved !== 'all'
              ? 'No reviews match your current filter query.'
              : 'No customer reviews submitted yet.'}
          </p>
          {!searchTerm && filterApproved === 'all' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-[#00BCE1]/25 rounded-full px-5 py-2.5 transition-all duration-300 transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add First Review
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredReviews.slice(0, visibleCount).map((rev) => (
              <div
                key={rev.id}
                className="bg-[#1f2940] border border-[#2c3754] hover:border-[#00BCE1]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative group transition-all"
              >
                <div className="space-y-3">
                  {/* Star Rating & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        rev.isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      }`}
                    >
                      {rev.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-300 leading-relaxed font-normal italic">
                    "{rev.comment}"
                  </p>

                  {/* Customer Info */}
                  <div className="pt-2 border-t border-[#2c3754]/60 flex items-center justify-between text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#00BCE1]/20 text-[#00BCE1] font-bold flex items-center justify-center text-xs">
                        {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <span>{rev.customerName}</span>
                    </div>
                    <div className="text-[11px] text-[#00BCE1] font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {rev.location}
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="pt-3 border-t border-[#2c3754] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(rev.id)}
                      disabled={rev.isApproved}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                        rev.isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 opacity-50'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 cursor-pointer shadow-md'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(rev.id)}
                      disabled={!rev.isApproved}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                        !rev.isApproved
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 opacity-50'
                          : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 cursor-pointer shadow-md'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>

                  <button
                    onClick={() => setDeletingReview(rev)}
                    className="p-2 rounded-xl bg-[#141b2d] hover:bg-rose-950 text-rose-400 border border-[#2c3754] transition-all cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-lg">
            <TableFooter 
              totalItems={filteredReviews.length} 
              visibleCount={visibleCount}
              onSeeMore={() => setVisibleCount((prev) => prev + 10)}
            />
          </div>
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-[#1f2940] border border-[#2c3754] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#3e4396] text-white font-bold uppercase tracking-wider text-xs border-b border-[#2c3754]">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 max-w-xs">Comment</th>
                  <th className="py-3.5 px-4">Status & Moderation</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3754] bg-[#1f2940]">
                {filteredReviews.slice(0, visibleCount).map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#2c3754] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{rev.customerName}</td>
                    <td className="py-4 px-4 text-[#00BCE1]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {rev.location}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex text-amber-400 items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#A0AEC0] italic max-w-xs truncate">
                      "{rev.comment}"
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            rev.isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                          }`}
                        >
                          {rev.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApprove(rev.id)}
                            disabled={rev.isApproved}
                            className={`p-1 rounded-lg border transition-all ${
                              rev.isApproved
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 opacity-50'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 cursor-pointer'
                            }`}
                            title="Approve Review"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReject(rev.id)}
                            disabled={!rev.isApproved}
                            className={`p-1 rounded-lg border transition-all ${
                              !rev.isApproved
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 opacity-50'
                                : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 cursor-pointer'
                            }`}
                            title="Reject Review"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDeletingReview(rev)}
                          className="p-1.5 rounded-lg bg-[#141b2d] hover:bg-rose-900/50 text-rose-400 border border-[#2c3754] cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter 
            totalItems={filteredReviews.length} 
            visibleCount={visibleCount}
            onSeeMore={() => setVisibleCount((prev) => prev + 10)}
          />
        </div>
      )}

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-[#2c3754] w-full max-w-lg rounded-3xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2c3754] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#00BCE1]/15 border border-[#00BCE1]/30 text-[#00BCE1]">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Review</h3>
                  <p className="text-xs text-[#A0AEC0]">Create a review to publish on the website.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#141b2d] border border-transparent hover:border-[#2c3754] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all"
                />
              </div>

              {/* Rating Star Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Rating <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141b2d] border border-[#2c3754]">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600 fill-slate-800'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Location (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Location <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Review Comment <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter customer feedback or review details..."
                  rows={4}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141b2d] border border-[#2c3754] text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCE1] transition-all resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2c3754]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-300 border border-[#2c3754] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-[#00BCE1]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Save Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141b2d]/80 backdrop-blur-md">
          <div className="bg-[#1f2940] border border-rose-500/30 w-full max-w-md rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Customer Review</h3>
                <p className="text-xs text-[#A0AEC0]">Confirm permanent deletion from Firestore.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete the review from{' '}
              <strong className="text-white">"{deletingReview.customerName}"</strong> ({deletingReview.location})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2c3754]">
              <button
                onClick={() => setDeletingReview(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#141b2d] hover:bg-[#2c3754] text-slate-300 border border-[#2c3754] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
