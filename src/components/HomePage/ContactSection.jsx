import { motion } from "motion/react"
import { FiMail, FiPhone, FiMapPin, FiUser, FiMessageCircle, FiSend, FiRefreshCw, FiTruck, FiHeadphones, FiShield } from "react-icons/fi"
import { FaRegEnvelope } from "react-icons/fa"

export default function ContactSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Column - Info */}
     <motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="space-y-6"
>
  <h2 className="text-4xl mt-4 font-bold text-gray-900">
    Let’s <span className="text-red-600">Talk</span>
  </h2>
  <p className="text-lg text-gray-600">
    Have questions, suggestions, or just want to say hi? We’re here to help and love hearing from you.
  </p>

  {/* Contact Details */}
  <div className="space-y-4 bg-white  p-4 rounded-[15px]">
    <div className="flex items-center text-gray-700">
      <FiMapPin className="text-red-500 w-5 h-5 mr-3" />
      <span>123 Fashion Street, Style City, SC 12345</span>
    </div>
    <div className="flex items-center text-gray-700">
      <FiPhone className="text-red-500 w-5 h-5 mr-3" />
      <span>+1 (555) 123-4567</span>
    </div>
    <div className="flex items-center text-gray-700">
      <FiMail className="text-red-500 w-5 h-5 mr-3" />
      <span>support@texleath.com</span>
    </div>
  </div>

  {/* Additional Highlights */}
  <div className="grid bg-white p-2 rounded-[15px] lg:p-4 grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
    <div className="flex items-start gap-3">
      <div className="bg-red-100 p-2 rounded-lg">
        <FiShield className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">Secure Support</h4>
        <p className="text-sm text-gray-600 pr-5">Your queries are handled with privacy and care.</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="bg-red-100 p-2 rounded-lg">
        <FiHeadphones className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">24/7 Availability</h4>
        <p className="text-sm text-gray-600 pr-5">Reach out anytime — we're always listening.</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="bg-red-100 p-2 rounded-lg">
        <FiTruck className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">Shipping Help</h4>
        <p className="text-sm text-gray-600 pr-5">Questions about delivery or tracking? Let us help.</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="bg-red-100 p-2 rounded-lg">
        <FiRefreshCw className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">Returns Made Easy</h4>
        <p className="text-sm text-gray-600 pr-5">We simplify your return process — no stress.</p>
      </div>
    </div>
  </div>
</motion.div>


        {/* Right Column - Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-md space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-sm"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              <FaRegEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="pl-10 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <div className="mt-1 relative">
              <FiMessageCircle className="absolute left-3 top-4 text-gray-400" />
              <textarea
                rows="5"
                className="pl-10 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-sm resize-none"
                placeholder="Your message"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            <FiSend className="mr-2" /> Send Message
          </button>
        </motion.div>
      </div>
    </section>
  )
}
