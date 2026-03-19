import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { post, put, del } from "../../api/client"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { useQueryClient } from "@tanstack/react-query"
import { FiStar, FiX, FiSend, FiMessageSquare, FiEdit3, FiThumbsUp, FiCalendar, FiFilter, FiTrash2, FiAlertTriangle, FiUserCheck } from "react-icons/fi"
import MainLoader from "../loaders/mainLoader"

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

function RatingBars({ distribution, totalReviews, selectedStarFilter, onSelectStarFilter }) {
  const levels = [5, 4, 3, 2, 1]
  return (
    <div className="space-y-2">
      {levels.map((star) => {
        const count = distribution?.[star] || 0
        const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
        const isSelected = selectedStarFilter === star
        return (
          <button key={star} onClick={() => onSelectStarFilter(isSelected ? null : star)}
            className={`w-full flex items-center gap-3 text-xs font-medium p-1 rounded-lg transition-colors ${isSelected ? "bg-white border border-gray-200" : "hover:bg-white"}`}>
            <div className="flex items-center gap-1 w-10 text-gray-700">
              <span className="font-bold">{star}</span>
              <FiStar className="w-3 h-3 text-amber-400 fill-current" />
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full transition-colors ${isSelected ? "bg-red-500 py-2" : "bg-red-600"}`} />
            </div>
            <span className="w-9 text-right text-gray-400 font-semibold">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

function ReviewCard({ review, index }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0)
  const [hasLiked, setHasLiked] = useState(false)
  const name = review.customer?.fullName || "Verified Buyer"
  const initial = name.charAt(0).toUpperCase()

  const handleHelpful = () => {
    if (hasLiked) { setHelpfulCount(h => Math.max(0, h - 1)); setHasLiked(false) }
    else { setHelpfulCount(h => h + 1); setHasLiked(true) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-800 flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                  <FiUserCheck className="w-3 h-3 text-green-600" /> Verified
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FiCalendar className="w-3 h-3" /> {formatDate(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-current" : "text-gray-200"}`} />
            ))}
          </div>
          {review.title && <h5 className="font-bold text-gray-800 text-sm mt-2.5 leading-snug">{review.title}</h5>}
          {review.description && <p className="text-gray-600 text-xs sm:text-sm mt-1.5 leading-relaxed break-words">{review.description}</p>}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <button onClick={handleHelpful}
              className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${hasLiked ? "text-red-600 font-bold" : "text-gray-400 hover:text-gray-700"}`}>
              <FiThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
              <span>Helpful</span>
              {helpfulCount > 0 && <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded-full font-bold">{helpfulCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewSection({ productId, onClose, modal = true }) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState("newest")
  const [starFilter, setStarFilter] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const { data, isLoading } = useApiQuery(`/reviews/product/${productId}`, { page, limit: 10, sort })
  const { data: allReviewsData } = useApiQuery(`/reviews/product/${productId}`, { limit: 1000, sort })
  const { data: myReviews } = useApiQuery("/reviews/mine", null, { enabled: isAuthenticated })

  const rawReviews = data?.reviews || []
  const pagination = data?.pagination || {}
  const allReviews = allReviewsData?.reviews || []

  const reviews = useMemo(() => {
    if (!starFilter) return rawReviews
    return rawReviews.filter(r => Math.round(r.rating) === starFilter)
  }, [rawReviews, starFilter])

  const stats = useMemo(() => {
    const total = allReviews.length
    if (total === 0) return { averageRating: 0, totalReviews: 0, distribution: {} }
    const sum = allReviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    const distribution = {}
    allReviews.forEach(r => { const s = Math.round(r.rating || 0); distribution[s] = (distribution[s] || 0) + 1 })
    return { averageRating: sum / total, totalReviews: total, distribution }
  }, [allReviews])

  const existingReview = useMemo(
    () => myReviews?.find(r => r.product?._id === productId || r.product === productId) || null,
    [myReviews, productId],
  )

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/reviews/product/${productId}`] })
    queryClient.invalidateQueries({ queryKey: ["/reviews/mine"] })
  }

  const resetForm = () => { setFormRating(5); setFormTitle(""); setFormDescription(""); setSubmitError("") }

  const openEdit = () => {
    if (existingReview) { setFormRating(existingReview.rating); setFormTitle(existingReview.title || ""); setFormDescription(existingReview.description || "") }
    setSubmitError(""); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError("")
    try {
      const payload = { rating: formRating, title: formTitle.trim() || undefined, description: formDescription.trim() || undefined }
      if (existingReview) await put(`/reviews/${existingReview._id}`, payload)
      else await post("/reviews", { ...payload, productId })
      resetForm(); setShowForm(false); invalidate()
    } catch (err) { setSubmitError(err.response?.data?.message || "Failed to submit review") }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    try { await del(`/reviews/${existingReview._id}`); setShowConfirm(false); invalidate() } catch {}
  }

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [modal])

  const reviewsContent = (
    <div className={modal ? "space-y-6" : "space-y-6"}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-white border border-gray-100 rounded-2xl">
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-gray-100">
          <span className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
            {stats.averageRating?.toFixed(1) || "0.0"}
          </span>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`w-4 h-4 ${i < Math.round(stats.averageRating || 0) ? "text-amber-400 fill-current" : "text-gray-200"}`} />
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-400 mt-1">Based on {stats.totalReviews || 0} customer reviews</p>
          {isAuthenticated && (
            <div className="mt-4 w-full">
              {existingReview ? (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={openEdit} className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5">
                    <FiEdit3 className="w-3.5 h-3.5" /> Edit Review
                  </button>
                  <button onClick={() => setShowConfirm(true)} className="px-3 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={openEdit} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <FiEdit3 className="w-3.5 h-3.5" /> Write a Customer Review
                </button>
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-7">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Rating Breakdown {starFilter && <span className="text-red-600 ml-1">(Filtered by {starFilter}★)</span>}
          </p>
          <RatingBars distribution={stats.distribution} totalReviews={stats.totalReviews || 0}
            selectedStarFilter={starFilter} onSelectStarFilter={setStarFilter} />
          {starFilter && (
            <button onClick={() => setStarFilter(null)} className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
              Clear star filter
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Delete your product review?</p>
                  <p className="text-[11px] text-gray-500">This action will permanently remove your feedback.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1">
                  <FiTrash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reviews.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort Reviews</span>
          </div>
          <div className="flex items-center gap-1.5">
            {["newest", "oldest"].map((opt) => (
              <button key={opt} onClick={() => { setSort(opt); setPage(1) }}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${sort === opt ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><MainLoader /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
            <FiMessageSquare className="w-7 h-7" />
          </div>
          <p className="text-gray-900 font-bold text-base">No Reviews Found</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            {starFilter ? `No ${starFilter}-star reviews available for this product.`
              : isAuthenticated ? "Be the first verified buyer to share your feedback!"
              : "Sign in to leave a review and share your experience."}
          </p>
          {starFilter && <button onClick={() => setStarFilter(null)} className="mt-4 text-xs font-bold text-red-600 hover:text-red-700">Clear Star Filter</button>}
          {!isAuthenticated && !starFilter && (
            <a href="/signin" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
              <FiEdit3 className="w-3.5 h-3.5" /> Sign in to Review
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {reviews.map((review, i) => (
              <ReviewCard key={review._id} review={review} index={i} />
            ))}
          </AnimatePresence>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${page === p ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (modal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center"
      >
        <div onClick={onClose} className="fixed inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-2xl mx-4 mt-8 mb-8 bg-white rounded-3xl shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {reviewsContent}
          </div>
        </motion.div>
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { resetForm(); setShowForm(false) }} className="fixed inset-0 bg-black/40 z-50" />
              <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden border border-gray-100">
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FiEdit3 className="w-4 h-4 text-red-500" />
                    {existingReview ? "Edit Your Review" : "Write a Product Review"}
                  </h3>
                  <button onClick={() => { resetForm(); setShowForm(false) }} className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-50">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                      <FiStar className="w-3.5 h-3.5 text-amber-400" /> Overall Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <button key={i} type="button" onClick={() => setFormRating(i + 1)} className="p-1 hover:scale-110 transition-transform">
                          <FiStar className={`w-7 h-7 transition-colors ${i < formRating ? "text-amber-400 fill-current" : "text-gray-200 hover:text-amber-300"}`} />
                        </button>
                      ))}
                      <span className="ml-3 text-xs font-bold text-gray-900 bg-white border border-amber-200 px-2.5 py-1 rounded-full">
                        {formRating === 1 ? "1 ★ - Poor" : formRating === 2 ? "2 ★ - Fair" : formRating === 3 ? "3 ★ - Good" : formRating === 4 ? "4 ★ - Great" : "5 ★ - Excellent"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">Headline <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="E.g. Excellent quality & fast delivery!"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 bg-white transition-all font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">Review Details <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Share specific details about fit, comfort, quality, or material..."
                      rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 bg-white transition-all resize-none font-medium" />
                  </div>
                  {submitError && <p className="text-xs text-red-600 bg-white border border-red-200 px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
                    <FiX className="w-3.5 h-3.5 flex-shrink-0" /> {submitError}
                  </p>}
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    {submitting ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><FiSend className="w-3.5 h-3.5" /> {existingReview ? "Update Review" : "Publish Review"}</>}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl">
            <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100 mb-4">
              <span className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
                {stats.averageRating?.toFixed(1) || "0.0"}
              </span>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-4 h-4 ${i < Math.round(stats.averageRating || 0) ? "text-amber-400 fill-current" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-400 mt-1">Based on {stats.totalReviews || 0} customer reviews</p>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rating Breakdown</p>
            <RatingBars distribution={stats.distribution} totalReviews={stats.totalReviews || 0}
              selectedStarFilter={starFilter} onSelectStarFilter={setStarFilter} />
            {starFilter && (
              <button onClick={() => setStarFilter(null)} className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
                Clear star filter
              </button>
            )}
            {!showForm && isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {existingReview ? (
                  <div className="flex items-center gap-2">
                    <button onClick={openEdit} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5">
                      <FiEdit3 className="w-3.5 h-3.5" /> Edit Review
                    </button>
                    <button onClick={() => setShowConfirm(true)} className="px-3 py-2.5 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={openEdit} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    <FiEdit3 className="w-3.5 h-3.5" /> Write a Customer Review
                  </button>
                )}
              </div>
            )}
          </div>

          {showForm && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiEdit3 className="w-4 h-4 text-red-500" />
                  {existingReview ? "Edit Your Review" : "Write a Product Review"}
                </h3>
                <button onClick={() => { resetForm(); setShowForm(false) }} className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-50">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <FiStar className="w-3.5 h-3.5 text-amber-400" /> Overall Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <button key={i} type="button" onClick={() => setFormRating(i + 1)} className="p-1 hover:scale-110 transition-transform">
                        <FiStar className={`w-7 h-7 transition-colors ${i < formRating ? "text-amber-400 fill-current" : "text-gray-200 hover:text-amber-300"}`} />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-bold text-gray-900 bg-white border border-amber-200 px-2.5 py-1 rounded-full">
                      {formRating === 1 ? "1 ★ - Poor" : formRating === 2 ? "2 ★ - Fair" : formRating === 3 ? "3 ★ - Good" : formRating === 4 ? "4 ★ - Great" : "5 ★ - Excellent"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">Headline <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="E.g. Excellent quality & fast delivery!"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 bg-white transition-all font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">Review Details <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Share specific details about fit, comfort, quality, or material..."
                    rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 bg-white transition-all resize-none font-medium" />
                </div>
                {submitError && <p className="text-xs text-red-600 bg-white border border-red-200 px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
                  <FiX className="w-3.5 h-3.5 flex-shrink-0" /> {submitError}
                </p>}
                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  {submitting ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><FiSend className="w-3.5 h-3.5" /> {existingReview ? "Update Review" : "Publish Review"}</>}
                </button>
              </form>
            </div>
          )}

          <AnimatePresence>
            {showConfirm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <FiAlertTriangle className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Delete your product review?</p>
                      <p className="text-[11px] text-gray-500">This action will permanently remove your feedback.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1">
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          {reviews.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiFilter className="w-3.5 h-3.5 text-red-900" />
                <span className="text-xs font-semibold text-red-900 uppercase tracking-wider">Sort Reviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                {["newest", "oldest"].map((opt) => (
                  <button key={opt} onClick={() => { setSort(opt); setPage(1) }}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${sort === opt ? "bg-red-600 text-white" : "bg-white text-red-900 border border-red-200 hover:border-red-300"}`}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-40 flex items-center justify-center"><MainLoader /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                <FiMessageSquare className="w-7 h-7" />
              </div>
              <p className="text-gray-900 font-bold text-base">No Reviews Found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {starFilter ? `No ${starFilter}-star reviews available for this product.`
                  : isAuthenticated ? "Be the first verified buyer to share your feedback!"
                  : "Sign in to leave a review and share your experience."}
              </p>
              {starFilter && <button onClick={() => setStarFilter(null)} className="mt-4 text-xs font-bold text-red-600 hover:text-red-700">Clear Star Filter</button>}
              {!isAuthenticated && !starFilter && (
                <a href="/signin" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
                  <FiEdit3 className="w-3.5 h-3.5" /> Sign in to Review
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {reviews.map((review, i) => (
                  <ReviewCard key={review._id} review={review} index={i} />
                ))}
              </AnimatePresence>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${page === p ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
