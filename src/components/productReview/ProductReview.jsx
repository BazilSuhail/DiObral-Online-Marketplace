import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react"
import { get, post } from '../../api/client';
import { FaStar } from 'react-icons/fa';
import MainLoader from '../loaders/mainLoader.jsx';
import { FiAlertCircle, FiEdit2, FiMessageSquare, FiStar } from 'react-icons/fi';
import Button from '../../utilities/Button.jsx';

const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
  )
}

const Label = ({ htmlFor, children, className = "" }) => {
  return <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 ${className}`}>{children}</label>
}

const ReviewsList = ({ productId, newReview }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await get(`/product-reviews/reviews/${productId}`);
        setReviews(response.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (newReview) setReviews(prev => [newReview, ...prev]);
  }, [newReview]);

  const handleShowMore = () => setVisibleCount(prev => Math.min(prev + 4, reviews.length));

  if (loading) return <div className="h-full w-full"><MainLoader /></div>;
  if (error) return (
    <div className="space-y-6 lg:col-span-3 lg:pl-[15px]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center p-6">
        <div className="relative mb-6">
          <FiMessageSquare className="w-32 h-32 text-gray-300" />
          <FiAlertCircle className="absolute bottom-0 right-0 w-12 h-12 text-red-400 bg-white rounded-full p-1" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-red-700">No Reviews Yet</h3>
          <p className="text-gray-500">Be the first to share your thoughts about this product!</p>
          <div className="px-4 py-2 rounded-lg bg-red-50 inline-flex items-center text-red-600 font-medium">
            <FiEdit2 className="mr-2" /><span>Write Your Review Now</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const displayedReviews = reviews.slice(0, visibleCount);
  return (
    <div className="space-y-6 lg:col-span-3 lg:pl-[15px]">
      <h2 className="text-lg font-bold text-gray-900 mb-8">Customer Reviews</h2>
      <AnimatePresence>
        {displayedReviews.map((review, index) => (
          <motion.div key={review._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }} className="border-[2px] rounded-[15px] border-gray-100 shadow-sm pb-4 bg-gray-50 p-4">
            <div className="mb-3">
              <div className="flex w-full items-center justify-between">
                <h4 className="font-semibold text-gray-900">{review.name}</h4>
                <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex mt-1 items-center">
                {[...Array(5)].map((_, i) => (<FiStar key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />))}
              </div>
            </div>
            <p className="text-gray-600">{review.description}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      {reviews.length > visibleCount && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleShowMore}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">Show More Reviews</motion.button>
      )}
    </div>
  );
};

const ReviewProduct = ({ productId }) => {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await get('/auth/profile');
          setUser(response);
        }
      } catch { setError('Failed to fetch user details'); }
    };
    fetchUserDetails();
  }, []);

  const handleStarClick = (index) => setRating(index + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!user) { setError('Please login to submit a review'); setIsSubmitting(false); return; }
      const reviewData = { productId, review: { name: user.fullName, email: user.email, phone: user.contact, date: new Date(), rating, description: review } };
      const response = await post('/product-reviews/reviews', reviewData);
      setNewReview(response.review);
      setSuccess('Review submitted successfully!');
      setRating(1);
      setReview('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally { setIsSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-16 grid lg:grid-cols-5 gap-8">
      <div className="col-span-2 sticky top-0 border-t border-gray-200">
        <Button variant="outline" className="mb-3">Write a Review</Button>
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}
          className="bg-gray-50 rounded-lg py-4 px-6 mt-4 md:mr-5 border-[2px] border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rating</Label>
              <motion.div className="flex items-center space-x-1 mt-2" whileTap={{ scale: 0.95 }}>
                {[...Array(5)].map((_, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.1 }}>
                    <FaStar size={25} className={`cursor-pointer ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`} onClick={() => handleStarClick(index)} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div>
              <Label htmlFor="review-comment">Your Review</Label>
              <Textarea id="review-comment" value={review} onChange={(e) => setReview(e.target.value)} rows={4} required className="resize-none" />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-red-800 hover:bg-red-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block">⏳</motion.span>
                ) : 'Submit Review'}
              </Button>
            </div>
          </form>
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                className="fixed top-4 right-4 z-50 bg-green-700 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2">{success}</motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                className="fixed top-4 right-4 z-50 bg-red-700 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2">{error}</motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <ReviewsList productId={productId} newReview={newReview} />
    </motion.div>
  );
};

export default ReviewProduct;
