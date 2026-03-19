import { motion } from "motion/react"
import { FiMail, FiPhone, FiMapPin, FiHeart, FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiSend } from "react-icons/fi"
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"
import { Link } from "react-router-dom"

const FooterLink = ({ href, children, external = false, className = "" }) => {
  const linkClasses = `text-gray-600 hover:text-red-600 transition-all duration-300 text-sm font-medium group ${className}`
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses}>{children}</a>
  }
  return <Link to={href} className={linkClasses}>{children}</Link>
}

const SocialIcon = ({ href, icon: Icon, label, className = "" }) => {
  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer"
      whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
      className={`w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </motion.a>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: "/", label: "Home", id: "home" },
    { href: "/productlist/all", label: "All Products", id: "all-products" },
    { href: "/productlist/all", label: "Clothing", id: "clothing" },
    { href: "/productlist/all", label: "Accessories", id: "accessories" },
    { href: "/productlist/all", label: "Sale", id: "sale" },
  ]

  const support = [
    { href: "/about", label: "Contact Us", id: "contact" },
    { href: "/about", label: "Help Center", id: "help" },
    { href: "/about", label: "Shipping Info", id: "shipping" },
    { href: "/about", label: "Returns", id: "returns" },
    { href: "/about", label: "Size Guide", id: "size-guide" },
  ]

  const company = [
    { href: "/about", label: "About Us", id: "about" },
    { href: "/about", label: "Careers", id: "careers" },
    { href: "/about", label: "Sustainability", id: "sustainability" },
    { href: "/about", label: "Blog", id: "blog" },
    { href: "/about", label: "Press", id: "press" },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 -left-12 w-24 h-24 bg-red-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-gray-200 rounded-full opacity-40"></div>
      </div>

      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="grid grid-cols-1 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Stay <span className="text-red-600">Connected</span></h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto lg:pr-[85px]">Subscribe to our newsletter for exclusive offers, style tips, and early access to new collections.</p>
              <p className="text-xs text-gray-500">Join 50,000+ fashion enthusiasts. Unsubscribe anytime.</p>
            </div>
            <div className="w-full sm:mt-0 mt-[15px] flex gap-x-2 sm:flex-col lg:px-[35px]">
              <input type="email" placeholder="Enter your email address"
                className="flex h-12 w-full sm:w-[280px] ml-auto rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-red-500 transition-all duration-300" />
              <div className="mt-[15px]"></div>
              <button className="text-[16px] font-[600] py-2 bg-red-600 rounded-[12px] ml-auto w-full sm:w-[280px] justify-center text-white flex items-center">
                <FiSend className="w-4 h-4 mr-2" /> Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
                <Link to="/" className="flex items-center">
                  <img src="/vite.svg" alt="DiObral" className="w-[55px] h-[55px]" />
                  <span className="text-2xl font-bold ml-[8px] text-red-700">DiObral</span>
                </Link>
                <p className="text-gray-600 leading-relaxed max-w-md">Your destination for premium fashion and lifestyle products.</p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600"><FiMapPin className="w-4 h-4 mr-3 text-red-500" /><span className="text-sm">123 Fashion Street, Style City, SC 12345</span></div>
                  <div className="flex items-center text-gray-600"><FiPhone className="w-4 h-4 mr-3 text-red-500" /><span className="text-sm">+1 (555) 123-4567</span></div>
                  <div className="flex items-center text-gray-600"><FiMail className="w-4 h-4 mr-3 text-red-500" /><span className="text-sm">hello@diobral.com</span></div>
                </div>
              </motion.div>
            </div>
            <div className="col-span-3 pl-4 grid grid-cols-3">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop</h3>
                <ul className="space-y-4">
                  {quickLinks.map((link) => (<li key={link.id}><FooterLink href={link.href}>{link.label}</FooterLink></li>))}
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Support</h3>
                <ul className="space-y-4">
                  {support.map((link) => (<li key={link.id}><FooterLink href={link.href}>{link.label}</FooterLink></li>))}
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Company</h3>
                <ul className="space-y-4">
                  {company.map((link) => (<li key={link.id}><FooterLink href={link.href}>{link.label}</FooterLink></li>))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm font-medium">Follow Us:</span>
              <div className="flex space-x-3">
                <SocialIcon href="https://twitter.com" icon={FaTwitter} label="Twitter" />
                <SocialIcon href="https://youtube.com" icon={FaYoutube} label="YouTube" />
                <SocialIcon href="https://facebook.com" icon={FaFacebook} label="Facebook" />
                <SocialIcon href="https://instagram.com" icon={FaInstagram} label="Instagram" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center space-x-6">
              <FooterLink href="/about">Privacy Policy</FooterLink>
              <FooterLink href="/about">Terms of Service</FooterLink>
              <FooterLink href="/about">Cookies</FooterLink>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center lg:text-right">
              <p className="text-gray-600 text-sm">&copy; {currentYear} <span className="text-red-700 font-[500]">DiObral</span>. All rights reserved.</p>
              <p className="text-gray-500 text-xs mt-1 flex items-center justify-center lg:justify-end">Made with <FiHeart className="inline w-3 h-3 text-red-500 mx-1" /> for fashion lovers</p>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}
