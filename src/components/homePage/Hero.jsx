import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  FaTruckFast,
  FaBoxOpen,
  FaGlobe,
  FaRobot,
  FaBagShopping,
  FaWandMagicSparkles,
  FaHeart,
  FaTag,
  FaGem,
} from 'react-icons/fa6';
import { BiShield } from 'react-icons/bi';

// --- CONFIG DATA FOR REUSABILITY ---
const METRIC_BADGES = [
  {
    icon: <FaTruckFast className="text-rose-600 text-xs sm:text-sm" />,
    text: 'AI Agent · 24/7',
    className: 'absolute top-[14%] left-3 sm:left-8 lg:left-32 -rotate-6',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, -10, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.1 }, y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 } },
  },
  {
    icon: <FaGlobe className="text-rose-600 text-xs sm:text-sm" />,
    text: 'Free Global Ship',
    className: 'absolute top-[4%] right-3 sm:right-8 lg:right-36 rotate-6',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, -12, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.25 }, y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 } },
  },
  {
    icon: <FaHeart className="text-rose-600 text-sm" />,
    text: '40K+ Happy Buyers',
    className: 'hidden lg:flex absolute top-[46%] left-24 -rotate-3',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, 10, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.3 }, y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } },
  },
  {
    icon: <FaTag className="text-rose-600 text-sm" />,
    text: 'New Drops Weekly',
    className: 'hidden lg:flex absolute top-[38%] right-24 rotate-3',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, -10, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.35 }, y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.0 } },
  },
  {
    icon: <FaBoxOpen className="text-black text-xs sm:text-sm" />,
    text: '1.2M+ Orders',
    className: 'absolute bottom-[16%] left-3 sm:left-8 lg:left-24 rotate-3',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, 12, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.4 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } },
  },
  {
    icon: <FaGem className="text-rose-600 text-sm" />,
    text: 'Handcrafted',
    className: 'hidden lg:flex absolute bottom-[16%] left-[38%] -rotate-2',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, 8, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.45 }, y: { duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 0.9 } },
  },
  {
    icon: <BiShield className="text-black text-xs sm:text-sm" />,
    text: 'Secure Checkout',
    className: 'absolute bottom-[16%] right-3 sm:right-8 lg:right-24 -rotate-3',
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: [0, 10, 0] },
    transition: { opacity: { duration: 0.6, delay: 0.55 }, y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 } },
  },
];

const SHOWCASE_CARDS = [
  {
    src: '/home/home3.webp',
    alt: "Men's casual shirt",
    styleKey: 'leftOuterX',
    className: 'absolute -ml-52 sm:-ml-56 lg:-ml-96 z-10 w-36 sm:w-48 lg:w-64 aspect-square rounded-2xl overflow-hidden shadow-xl border-2 border-rose-300 bg-gray-200 translate-y-3',
    rotate: -8,
    delay: 0.2,
  },
  {
    src: '/home/home4.webp',
    alt: "Men's tailored suit",
    styleKey: 'leftInnerX',
    className: 'absolute -ml-12 sm:-ml-28 rounded-xl overflow-hidden lg:-ml-40 z-30 w-42 sm:w-52 lg:w-72 border-4 border-rose-500',
    rotate: -2,
    delay: 0.3,
    isInnerMain: true,
  },
  {
    src: '/home/home1.webp',
    alt: "Men's streetwear",
    styleKey: 'rightInnerX',
    className: 'absolute ml-12 sm:ml-28 lg:ml-40 z-20 w-42 sm:w-52 lg:w-72 aspect-square rounded-2xl overflow-hidden shadow-xl border-2 border-rose-300 bg-gray-200 translate-y-2',
    rotate: 4,
    delay: 0.4,
  },
  {
    src: '/home/home2.webp',
    alt: "Men's fashion model",
    styleKey: 'rightOuterX',
    className: 'absolute ml-52 sm:ml-56 lg:ml-96 z-10 w-36 sm:w-48 lg:w-64 aspect-square rounded-2xl overflow-hidden shadow-xl border-2 border-rose-300 bg-gray-200 translate-y-5',
    rotate: 10,
    delay: 0.5,
  },
];

export default function Hero() {
  const sectionRef = useRef(null);

  // Scroll progress relative to the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Scroll Transforms
  const leftOuterX = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const rightOuterX = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const leftInnerX = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const rightInnerX = useTransform(scrollYProgress, [0, 1], [0, 220]);

  const transformMap = {
    leftOuterX,
    rightOuterX,
    leftInnerX,
    rightInnerX,
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen text-gray-900 flex flex-col justify-center items-center px-4 overflow-hidden"
    >
      {/* BACKGROUND GLOW GRADIENT */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[250px] sm:h-[300px] bg-rose-200/50 blur-[120px] rounded-full pointer-events-none" />

      {/* --- FLOATING METRIC BADGES --- */}
      <div className="absolute inset-0 pointer-events-none">
        {METRIC_BADGES.map((badge, idx) => (
          <motion.div
            key={idx}
            initial={badge.initial}
            animate={badge.animate}
            transition={badge.transition}
            className={`absolute bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2.5 shadow-lg ${badge.className}`}
          >
            {badge.icon}
            <span className="text-[10px] sm:text-xs font-semibold text-gray-800">{badge.text}</span>
          </motion.div>
        ))}
      </div>

      {/* --- CENTER HERO CONTENT --- */}
      <div className="relative z-10 max-w-4xl text-center -mt-35 md:-mt-25 mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] sm:text-xs font-medium mb-4 sm:mb-5"
        >
          <FaWandMagicSparkles className="text-[10px] sm:text-xs" />
          <span>Meet AURA - Your AI Menswear Stylist</span>
        </motion.div>

        {/* TITLE — Desktop stays single line (`whitespace-nowrap`), mobile splits nicely */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-5xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-gray-900 lg:whitespace-nowrap"
        >
          <span className="block sm:inline">Wear Standard,</span>{' '}
          <span className="text-rose-600 block sm:inline">Not Trend</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed font-normal px-2"
        >
          Tailored shirts, sports and streetwear — crafted for the modern man. Plus, an AI agent inside the app that listens and places orders for you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-300/50 cursor-pointer flex items-center justify-center gap-2"
          >
            <FaRobot className="text-sm sm:text-base" />
            <span>Start Shopping with AI</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FaBagShopping className="text-rose-600 text-sm sm:text-base" />
            <span>Browse Collection</span>
          </motion.button>
        </motion.div>
      </div>

      {/* --- SQUARE IMAGE CARDS SHOWCASE --- */}
      <div className="relative z-10 w-full max-w-5xl mt-8 sm:-mt-15 flex justify-center items-end flex-shrink-0">
        <div className="relative flex items-end justify-center w-full min-h-[180px] sm:min-h-[280px] lg:min-h-[400px]">
          {SHOWCASE_CARDS.map((card, idx) => (
            <motion.div
              key={idx}
              style={{ x: transformMap[card.styleKey] }}
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: card.rotate }}
              transition={{ duration: 0.8, delay: card.delay, ease: 'easeOut' }}
              className={card.className}
            >
              {card.isInnerMain ? (
                <div className="w-full h-full overflow-hidden">
                  <img src={card.src} alt={card.alt} className="w-full h-full object-cover" />
                </div>
              ) : (
                <img src={card.src} alt={card.alt} className="w-full h-full object-cover" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}