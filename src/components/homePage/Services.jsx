import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const services = [
  {
    title: "Manufacturing",
    description: "State-of-the-art manufacturing processes delivering products that exceed expectations in quality and design.",
    icon: (props) => (
      <svg viewBox="0 0 64 64" fill="none" {...props}>
        <motion.circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <motion.circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <motion.line x1="32" y1="10" x2="32" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.line x1="32" y1="50" x2="32" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.line x1="10" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.line x1="50" y1="32" x2="54" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    bgPattern: (props) => (
      <svg viewBox="0 0 200 200" {...props}>
        {[0, 40, 80, 120, 160].map((x) =>
          [0, 40, 80, 120, 160].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" className="fill-red-200/40" />
          ))
        )}
      </svg>
    ),
  },
  {
    title: "Sales",
    description: "Premium retail experience prioritizing customer needs and delivering exceptional service worldwide.",
    icon: (props) => (
      <svg viewBox="0 0 64 64" fill="none" {...props}>
        <motion.path d="M16 22h32l-4 22H20l-4-22z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <motion.path d="M22 28a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.path d="M30 28a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.path d="M20 16l4-6h16l4 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bgPattern: (props) => (
      <svg viewBox="0 0 200 200" {...props}>
        <path d="M0 100 Q50 0 100 100 Q150 200 200 100" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/30" />
        <path d="M0 120 Q50 20 100 120 Q150 220 200 120" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/20" />
      </svg>
    ),
  },
  {
    title: "Export",
    description: "Global export services maintaining honesty and transparency in all international dealings.",
    icon: (props) => (
      <svg viewBox="0 0 64 64" fill="none" {...props}>
        <motion.circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2.5" />
        <motion.ellipse cx="32" cy="32" rx="10" ry="20" stroke="currentColor" strokeWidth="2" />
        <motion.line x1="12" y1="32" x2="52" y2="32" stroke="currentColor" strokeWidth="2" />
        <motion.path d="M24 12l8 6 8-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <motion.path d="M24 52l8-6 8 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bgPattern: (props) => (
      <svg viewBox="0 0 200 200" {...props}>
        <circle cx="100" cy="100" r="80" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/20" strokeDasharray="8 8" />
        <circle cx="100" cy="100" r="50" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/15" strokeDasharray="4 6" />
      </svg>
    ),
  },
  {
    title: "Customization",
    description: "Utilizing cutting-edge technology to ensure high production standards and personalized solutions.",
    icon: (props) => (
      <svg viewBox="0 0 64 64" fill="none" {...props}>
        <motion.rect x="14" y="14" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <motion.rect x="36" y="14" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <motion.rect x="14" y="36" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <motion.rect x="36" y="36" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <motion.line x1="21" y1="28" x2="21" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <motion.line x1="43" y1="28" x2="43" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <motion.line x1="28" y1="21" x2="36" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <motion.line x1="28" y1="43" x2="36" y2="43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    bgPattern: (props) => (
      <svg viewBox="0 0 200 200" {...props}>
        {[0, 25, 50, 75, 100, 125, 150, 175].map((x) =>
          [0, 25, 50, 75, 100, 125, 150, 175].map((y) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" rx="2" className="fill-red-100/40" />
          ))
        )}
      </svg>
    ),
  },
  {
    title: "Design",
    description: "Crafting unique designs that reflect texleath, style, and contemporary fashion trends.",
    icon: (props) => (
      <svg viewBox="0 0 64 64" fill="none" {...props}>
        <motion.circle cx="40" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" />
        <motion.circle cx="16" cy="44" r="8" stroke="currentColor" strokeWidth="2.5" />
        <motion.circle cx="52" cy="48" r="6" stroke="currentColor" strokeWidth="2.5" />
        <motion.line x1="34" y1="30" x2="22" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <motion.line x1="44" y1="32" x2="46" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    bgPattern: (props) => (
      <svg viewBox="0 0 200 200" {...props}>
        <motion.circle cx="100" cy="100" r="90" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/20" />
        <motion.circle cx="100" cy="100" r="70" stroke="currentColor" fill="none" strokeWidth="0.5" className="text-red-200/15" />
        <motion.circle cx="100" cy="100" r="50" stroke="currentColor" fill="none" strokeWidth="0.5" className="text-red-200/10" />
      </svg>
    ),
  },
  {
    title: "Customer Support",
    description: "24/7 exceptional support ensuring complete customer satisfaction and seamless experience.",
    icon: (props) => (
      <svg viewBox="0 0 64 64" fill="none" {...props}>
        <motion.path d="M16 36a12 12 0 0 1 12-12h8a12 12 0 0 1 12 12v4a12 12 0 0 1-12 12H28a12 12 0 0 1-12-12v-4z" stroke="currentColor" strokeWidth="2.5" />
        <motion.path d="M28 40v8a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle cx="26" cy="48" r="2" fill="currentColor" />
        <motion.circle cx="38" cy="48" r="2" fill="currentColor" />
        <motion.path d="M22 24v-2a10 10 0 0 1 10-10h0a10 10 0 0 1 10 10v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    bgPattern: (props) => (
      <svg viewBox="0 0 200 200" {...props}>
        <path d="M40 180 Q60 120 100 140 Q140 160 160 100 Q180 40 200 80" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/25" />
        <path d="M0 160 Q30 100 70 120 Q110 140 130 80 Q150 20 200 60" stroke="currentColor" fill="none" strokeWidth="1" className="text-red-200/15" />
      </svg>
    ),
  },
];

const ServiceCard = ({ service, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const Icon = service.icon;
  const BgPattern = service.bgPattern;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -8, translateZ: 0 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
    >
      <div className="absolute inset-0 pointer-events-none">
        <BgPattern className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      <div className="relative p-8 lg:p-10 z-10">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center group-hover:from-red-500 group-hover:to-red-600 transition-all duration-500">
              <Icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-500" />
            </div>
            <motion.div
              className="absolute -inset-2 rounded-2xl border-2 border-red-200/0 group-hover:border-red-300/50"
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors duration-300">{service.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-600 transition-colors duration-300">{service.description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span>Learn more</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            What We <span className="text-red-600">Offer</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From manufacturing to global export, we provide comprehensive solutions that exceed expectations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
