import { motion, useInView } from "motion/react" 
import { useRef } from "react"
import {
  FiShoppingBag, 
  FiUsers,
  FiTruck,
  FiSettings,
  FiHeart,
  FiShield,
  FiAward,
  FiTarget,
  FiZap,
  FiGlobe,
  FiTrendingUp,
  FiArrowRight,
  FiPlay,
} from "react-icons/fi" 

// // Custom Components
const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
    outline: "border-2 border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-xl",
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

const AnimatedSection = ({ children, className = "" }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const ServiceCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  )
}

const TeamMember = ({ name, role, description, image, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center"
    >
      <div className="relative w-24 h-24 mx-auto mb-6">
        <img
          src={image || "/placeholder.svg?height=96&width=96"}
          alt={name}
          fill
          className="rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <p className="text-red-600 font-medium mb-3">{role}</p>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

const ValueCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      className="group text-center"
    >
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
        <Icon className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-red-100 leading-relaxed">{description}</p>
    </motion.div>
  )
}

export default function AboutPage() { 

  const services = [
    {
      icon: FiSettings,
      title: "Manufacturing",
      description:
        "State-of-the-art manufacturing processes delivering products that exceed expectations in quality and design.",
    },
    {
      icon: FiShoppingBag,
      title: "Sales",
      description:
        "Premium retail experience prioritizing customer needs and delivering exceptional service worldwide.",
    },
    {
      icon: FiGlobe,
      title: "Export",
      description: "Global export services maintaining honesty and transparency in all international dealings.",
    },
    {
      icon: FiZap,
      title: "Customization",
      description: "Utilizing cutting-edge technology to ensure high production standards and personalized solutions.",
    },
    {
      icon: FiTrendingUp,
      title: "Design",
      description: "Crafting unique designs that reflect texleath, style, and contemporary fashion trends.",
    },
    {
      icon: FiUsers,
      title: "Customer Support",
      description: "24/7 exceptional support ensuring complete customer satisfaction and seamless experience.",
    },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Visionary leader guiding DiObral with passion for innovation and excellence in fashion industry.",
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      name: "Michael Chen",
      role: "Head of Design",
      description: "Creative director ensuring each product reflects our commitment to style, quality, and innovation.",
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      name: "Emily Rodriguez",
      role: "Chief Marketing Officer",
      description: "Strategic marketing leader building the DiObral brand and connecting with customers globally.",
      image: "/placeholder.svg?height=150&width=150",
    },
  ]

  const values = [
    {
      icon: FiAward,
      title: "Excellence",
      description: "Pursuing the highest standards in everything we do, from design to customer service.",
    },
    {
      icon: FiHeart,
      title: "Passion",
      description: "Driven by genuine love for fashion and commitment to creating beautiful products.",
    },
    {
      icon: FiShield,
      title: "Integrity",
      description: "Maintaining honesty, transparency, and ethical practices in all our business dealings.",
    },
    {
      icon: FiTarget,
      title: "Innovation",
      description: "Continuously evolving and embracing new technologies to stay ahead of trends.",
    },
  ]

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "200K+", label: "Products Sold" },
    { number: "25+", label: "Countries Served" },
    { number: "8+", label: "Years Experience" },
  ]

  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 -left-24 w-48 h-48 bg-red-200 rounded-full opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
                About
                <span className="block text-red-600">DiObral</span>
              </h1>
              <p className="text-md sm:text-xl text-gray-600 leading-relaxed mb-8">
                We are a leading name in the world of premium fashion. Our dedication to quality and innovation sets us
                apart in clothing sales, manufacturing, and global export services.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-10">
                Founded on principles of quality and customer satisfaction, we deliver products that exceed expectations
                through expert craftsmanship and timeless style.
              </p>
              <div className="flex gap-4">
                <Button size="lg">
                  <FiArrowRight className="mr-2" />
                  Our Story
                </Button>
                <Button variant="outline" size="lg">
                  <FiPlay className="mr-2" />
                  Watch Video
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://i.ytimg.com/vi/p-hCu7Obi4k/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBpccFKH9jT-ZQE-BV0r_mwVHbwiQ"
                  alt="About DiObral" 
                  className="rounded-3xl shadow-2xl min-h-[260px] md:min-h-[480px]"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Services Section */}
      <AnimatedSection className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              What We <span className="text-red-600">Offer</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              From manufacturing to global export, we provide comprehensive solutions that exceed expectations in every
              aspect of the fashion industry.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={service.title} {...service} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Free Delivery Section */}
      <AnimatedSection className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8"
            >
              <FiTruck className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold text-white mb-4"
            >
              FREE DELIVERY
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl lg:text-3xl text-red-100 font-medium"
            >
              ON <span className="text-white font-bold">$100</span> OR ABOVE
            </motion.p>
          </div>
        </div>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Meet Our <span className="text-red-600">Team</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Our team of dedicated professionals brings wealth of experience and passion for excellence to make our
              vision a reality.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <TeamMember key={member.name} {...member} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Values Section */}
      <AnimatedSection className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-950"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500/20 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Our <span className="text-red-400">Values</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              These core values are the cornerstone of our business, guiding our actions and defining our commitment to
              excellence.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ValueCard key={value.title} {...value} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ready to Experience <span className="text-red-600">DiObral</span>?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Discover our latest collections and experience the difference that quality, style, and exceptional service
              can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <FiShoppingBag className="mr-2" />
                Shop Now
              </Button>
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  )
}
