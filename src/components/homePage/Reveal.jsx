import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from "motion/react";

const CountUp = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const from = 0;
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(from + (end - from) * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Reveal = ({
  text = `DiObral is a luxury fashion brand offering timeless, high-quality clothing with minimalist elegance. It blends sophistication and modern style, focusing on craftsmanship and clean design for confident self-expression.`,
}) => {
  const containerRef = useRef(null);
  const words = text.split(' ');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const SCROLL_END = 0.70;

  return (
    <div className="max-w-[1024px] mx-auto px-4 lg:py-32 relative">
      <div
        ref={containerRef}
        className="relative mx-auto text-[22px] lg:text-[37px] font-semibold leading-relaxed"
      >
        <div className="absolute inset-0 flex flex-wrap justify-center text-gray-400 opacity-40 pointer-events-none select-none">
          {words.map((word, i) => (
            <span key={`gray-${i}`} className="whitespace-pre mr-1">
              {word}
            </span>
          ))}
        </div>

        <div className="relative flex flex-wrap justify-center">
          {words.map((word, i) => {
            const start = (i / words.length) * SCROLL_END;
            const end = ((i + 1) / words.length) * SCROLL_END;

            const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
            const x = useTransform(scrollYProgress, [start, end], [-4, 0]);
            const scale = useTransform(scrollYProgress, [start, end], [0.8, 1]);

            return (
              <motion.span
                key={`motion-${i}`}
                style={{ opacity, x, scale }}
                className="inline-block text-center whitespace-pre mr-1 text-red-700"
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 mt-16 lg:mt-24 gap-6"
      >
        {[
          { value: 40000, label: "Delighted customers trust our brand", suffix: "+", icon: "users" },
          { value: 200000, label: "Elegant fashion pieces sold worldwide", suffix: "+", icon: "tag" },
          { value: 15, label: "Years crafting timeless luxury fashion", suffix: "+", icon: "star" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-500">
                  {stat.icon === "users" && (
                    <svg className="w-5 h-5 text-red-600 group-hover:text-white transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )}
                  {stat.icon === "tag" && (
                    <svg className="w-5 h-5 text-red-600 group-hover:text-white transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  )}
                  {stat.icon === "star" && (
                    <svg className="w-5 h-5 text-red-600 group-hover:text-white transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  )}
                </div>
              </div>

              <p className="text-3xl lg:text-4xl font-extrabold text-red-700 mb-1">
                <CountUp end={stat.value} suffix={stat.suffix} duration={2500} />
              </p>
              <p className="text-gray-500 text-sm leading-tight">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Reveal;
