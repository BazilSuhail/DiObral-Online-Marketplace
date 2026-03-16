import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { post, put, del } from "../../api/client"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { useQueryClient } from "@tanstack/react-query"
import {
  FiStar, FiX, FiCheck, FiSend, FiMessageSquare, FiEdit3,
  FiThumbsUp, FiCalendar, FiFilter, FiTrash2, FiAlertTriangle,
} from "react-icons/fi"
import MainLoader from "../loaders/mainLoader"

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

function RatingBars({ distribution, totalReviews }) {
  const levels = [5, 4, 3, 2, 1]
  return (
    <div className="space-y-2">
      {levels.map((star) => {
        const count = distribution?.[star] || 0
        const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-3 text-right text-red-700 font-semibold">{star}</span>
            <FiStar className="w-3.5 h-3.5 text-red-500 fill-current flex-shrink-0" />
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
              />
            </div>
            <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function ReviewCard({ review, index }) {
  const name = review.customer?.fullName || "Anonymous"
  const initial = name.charAt(0).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
        >
          {initial}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">{name}</span>
            {review.isVerifiedPurchase && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium border border-red-100"
              >
                <FiCheck className="w-3 h-3" /> Verified Purchase
              </motion.span>
            )}
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {formatDate(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 + i * 0.08 }}
              >
                <FiStar
                  className={`w-4 h-4 ${i < review.rating ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`}
                />
              </motion.div>
            ))}
          </div>
          {review.title && (
            <p className="font-semibold text-gray-800 text-sm mt-2 flex items-center gap-1.5">
              <FiThumbsUp className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              {review.title}
            </p>
          )}
          {review.description && (
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{review.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewSection({ productId }) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState("newest")
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const { data, isLoading } = useApiQuery(
    `/reviews/product/${productId}`,
    { page, limit: 5, sort },
  )
  const { data: myReviews } = useApiQuery("/reviews/mine", null, {
    enabled: isAuthenticated,
  })

  const reviews = data?.reviews || []
  const pagination = data?.pagination || {}
  const stats = data?.stats || { averageRating: 0, totalReviews: 0, distribution: {} }

  const existingReview = useMemo(
    () => myReviews?.find(
      (r) => r.product?._id === productId || r.product === productId
    ) || null,
    [myReviews, productId],
  )

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/reviews/product/${productId}`] })
    queryClient.invalidateQueries({ queryKey: ["/reviews/mine"] })
  }

  const resetForm = () => {
    setFormRating(5)
    setFormTitle("")
    setFormDescription("")
    setSubmitError("")
  }

  const openEdit = () => {
    if (existingReview) {
      setFormRating(existingReview.rating)
      setFormTitle(existingReview.title || "")
      setFormDescription(existingReview.description || "")
    }
    setSubmitError("")
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        rating: formRating,
        title: formTitle.trim() || undefined,
        description: formDescription.trim() || undefined,
      }
      if (existingReview) {
        await put(`/reviews/${existingReview._id}`, payload)
      } else {
        await post("/reviews", { ...payload, productId })
      }
      resetForm()
      setShowForm(false)
      invalidate()
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await del(`/reviews/${existingReview._id}`)
      setShowConfirm(false)
      invalidate()
    } catch {}
  }

  return (
    <section>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8"
      >
        <div className="flex items-end gap-6">
          <div className="text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-5xl font-bold text-red-700 leading-none"
            >
              {stats.averageRating?.toFixed(1) || "0.0"}
            </motion.span>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(stats.averageRating || 0) ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <FiMessageSquare className="w-3.5 h-3.5" />
              {stats.totalReviews || 0} reviews
            </p>
          </div>
          <div className="flex-1 min-w-[200px] pb-0.5">
            <RatingBars distribution={stats.distribution} totalReviews={stats.totalReviews || 0} />
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            {existingReview ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openEdit}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
                  <FiEdit3 className="w-4 h-4" /> Edit Review
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirm(true)}
                  className="px-4 py-2.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={openEdit}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <FiEdit3 className="w-4 h-4" /> Write a Review
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {/* Delete confirm */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">Delete your review?</p>
                  <p className="text-xs text-red-600">This action cannot be undone</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FiTrash2 className="w-3.5 h-3.5" /> Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6"
        >
          <FiFilter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Sort by</span>
          {["newest", "oldest"].map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSort(opt); setPage(1) }}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all font-medium ${
                sort === opt
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><MainLoader /></div>
      ) : reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center"
          >
            <FiMessageSquare className="w-8 h-8 text-red-400" />
          </motion.div>
          <p className="text-gray-800 font-semibold text-lg">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {isAuthenticated
              ? "Be the first to share your experience with this product"
              : "Sign in to leave a review and share your thoughts"
            }
          </p>
          {!isAuthenticated && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              href="/signin"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-600/20"
            >
              <FiEdit3 className="w-4 h-4" /> Sign in to Review
            </motion.a>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {reviews.map((review, i) => (
              <ReviewCard key={review._id} review={review} index={i} />
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 pt-4"
            >
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${
                    page === p
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  {p}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Review Modal (Create / Edit) */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { resetForm(); setShowForm(false) }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-x-4 top-[8%] max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiEdit3 className="w-5 h-5" />
                    {existingReview ? "Edit Review" : "Write a Review"}
                  </h3>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => { resetForm(); setShowForm(false) }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <FiX className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiStar className="w-4 h-4 text-red-500" /> Your Rating
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormRating(i + 1)}
                      >
                        <FiStar
                          className={`w-8 h-8 transition-all ${
                            i < formRating
                              ? "text-red-500 fill-current drop-shadow-sm"
                              : "text-gray-200 hover:text-red-300"
                          }`}
                        />
                      </motion.button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 font-medium">
                      {formRating === 1 ? "Poor" : formRating === 2 ? "Fair" : formRating === 3 ? "Good" : formRating === 4 ? "Great" : "Excellent"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Title <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Your Review <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Tell others about your experience..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 transition-all resize-none"
                  />
                </div>

                {submitError && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={submitting ? {} : { scale: 1.01 }}
                  whileTap={submitting ? {} : { scale: 0.99 }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-300 disabled:to-red-300 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <><FiSend className="w-4 h-4" /> {existingReview ? "Update Review" : "Submit Review"}</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
