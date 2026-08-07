'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  MapPin,
  ThumbsUp,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import {
  subscribeToReviews,
  addReviewToFirestore,
  updateReviewInFirestore,
  deleteReviewFromFirestore,
  ReviewDoc
} from '@/core/services/firebase';

export default function ReviewsView() {
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Delete Modal State
  const [deletingReview, setDeletingReview] = useState<ReviewDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isApproved, setIsApproved] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Firestore Realtime Subscription
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToReviews((data) => {
      setReviews(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingReviewId(null);
    setCustomerName('');
    setLocation('Dhaka');
    setRating(5);
    setComment('');
    setIsApproved(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (rev: ReviewDoc) => {
    setEditingReviewId(rev.id);
    setCustomerName(rev.customerName);
    setLocation(rev.location);
    setRating(rev.rating);
    setComment(rev.comment);
    setIsApproved(rev.isApproved);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Review comment cannot be empty.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const payload: Omit<ReviewDoc, 'id'> = {
        customerName: customerName.trim(),
        location: location.trim() || 'Bangladesh',
        rating: Number(rating) || 5,
        comment: comment.trim(),
        isApproved,
      };

      if (editingReviewId) {
        await updateReviewInFirestore(editingReviewId, payload);
        setSuccessMessage(`Review by "${customerName}" updated successfully!`);
      } else {
        await addReviewToFirestore(payload);
        setSuccessMessage(`Review for "${customerName}" added to Firestore!`);
      }

      setTimeout(() => setSuccessMessage(''), 3500);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving review:', err);
      setFormError(err.message || 'Failed to save review.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleApproved = async (rev: ReviewDoc) => {
    try {
      await updateReviewInFirestore(rev.id, { isApproved: !rev.isApproved });
      setSuccessMessage(`Review status updated to ${!rev.isApproved ? 'Approved' : 'Pending'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error updating approval status:', err);
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

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterApproved === 'approved') return rev.isApproved;
    if (filterApproved === 'pending') return !rev.isApproved;
    return true;
  });

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Reviews
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-slate-800 text-[#00BCE1] border border-[#00BCE1]/30">
            {filteredReviews.length} reviews
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#00BCE1] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Review
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-[#00BCE1]/10 border border-[#00BCE1]/30 text-[#00BCE1]">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Reviews</p>
            <p className="text-lg font-bold text-white">{totalReviews}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Approved & Published</p>
            <p className="text-lg font-bold text-white">{approvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Pending Moderation</p>
            <p className="text-lg font-bold text-white">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Average Rating</p>
            <p className="text-lg font-bold text-white">{avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Unified Filter Bar (Single Consolidated Bar) */}
      <div className="p-4 backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl shadow-cyan-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, location, or comment..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1]/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterApproved('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                filterApproved === 'all'
                  ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalReviews})
            </button>
            <button
              onClick={() => setFilterApproved('approved')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                filterApproved === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilterApproved('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                filterApproved === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>

          {/* View Toggles */}
          <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
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
                  ? 'bg-[#00BCE1]/20 text-[#00BCE1] border border-[#00BCE1]/40 shadow-[0_0_10px_rgba(0,188,225,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading reviews from Cloud Firestore...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-4">
          <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reviews Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || filterApproved !== 'all'
              ? 'No reviews match your current filters.'
              : 'There are no customer reviews stored in Cloud Firestore yet.'}
          </p>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all inline-flex items-center gap-2 cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add First Review
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="glass-panel glass-card-hover rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-white/10 relative group"
            >
              <div className="space-y-3">
                {/* Header: Star Rating & Approval Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 fill-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleToggleApproved(rev)}
                    title={rev.isApproved ? 'Click to unapprove' : 'Click to approve'}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                      rev.isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {rev.isApproved ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-amber-400" /> Pending
                      </>
                    )}
                  </button>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  "{rev.comment}"
                </p>
              </div>

              {/* Customer Info & Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.customerName}</h4>
                  <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium mt-0.5">
                    <MapPin className="w-3 h-3" /> {rev.location}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    title="Edit Review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingReview(rev)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Layout */
        <div className="glass-panel rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 max-w-xs">Comment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-cyan-500/[0.03]">
                    <td className="py-4 px-4 font-bold text-white">{rev.customerName}</td>
                    <td className="py-4 px-4 text-cyan-400">
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
                    <td className="py-4 px-4 text-slate-300 italic max-w-xs truncate">
                      "{rev.comment}"
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleApproved(rev)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                          rev.isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                        }`}
                      >
                        {rev.isApproved ? 'Approved' : 'Pending'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(rev)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingReview(rev)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-rose-500/30 cursor-pointer"
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
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-cyan w-full max-w-lg rounded-3xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingReviewId ? (
                  <Edit2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Plus className="w-5 h-5 text-cyan-400" />
                )}
                {editingReviewId ? 'Edit Review' : 'Add New Customer Review'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gulshan, Dhaka"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Star Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                        rating >= starVal
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                          : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          rating >= starVal
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                      <span>{starVal}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Review Comment / Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Excellent service and purified water TDS dropped significantly..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Approval Toggle */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    Approval & Publication Status
                  </p>
                  <p className="text-[11px] text-slate-400">
                    If enabled, this review will be displayed on the User Web testimonials slider.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <span>{editingReviewId ? 'Update Review' : 'Create Review'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-rose-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Customer Review</h3>
                <p className="text-xs text-slate-400">Confirm permanent deletion from Firestore.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete the review from{' '}
              <strong className="text-white">"{deletingReview.customerName}"</strong> ({deletingReview.location})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingReview(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
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
