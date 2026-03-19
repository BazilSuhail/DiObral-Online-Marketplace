import { useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from "motion/react"
import { Link } from "react-router-dom";

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const WordReveal = ({ words, className = "" }) => (
  <span className={className}>
    {words.map((w, i) => (
      <motion.span
        key={i}
        custom={i}
        variants={staggerItem}
        className="inline-block whitespace-pre"
      >
        {w}{" "}
      </motion.span>
    ))}
  </span>
);

const TiltImage = ({ src, className, delay }) => {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [4, -4]);
  const rotateY = useTransform(x, [0, 1], [-4, 4]);

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => { x.set(0.5); y.set(0.5); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={className}
    >
      <motion.div
        className="w-full h-full"
        style={{ rotateX, rotateY, perspective: 800 }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <img src={src} alt="" className="w-full h-full object-cover rounded-xl pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

const MagneticBtn = ({ children, className, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 8);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 8);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x, y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default function Hero() {
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04, delayChildren: 0.15 },
    },
  };

  const line1 = useMemo(() => "A place to Everyone's".split(" "), []);
  const line2 = useMemo(() => "Collection and Style.".split(" "), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
    >
      <motion.h1
        variants={container}
        initial="hidden"
        animate="visible"
        className="md:block hidden text-4xl md:text-6xl mb-12 mt-[-50px] font-[700] text-red-800 title-poppins leading-tight"
      >
        <WordReveal words={line1} />
        <br />
        <span className="text-red-800">
          <WordReveal words={["Collection"]} className="text-red-600" />
          <WordReveal words={["and"]} />
          <WordReveal words={["Style."]} className="text-red-600" />
        </span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="md:hidden block text-[38px] space-y-[-12px] mb-8 mt-[-90px] font-[700] text-red-800 title-poppins"
      >
        <p className="mb-[-12px]">A place to</p>
        <p><span className="text-red-600">Everyone's</span> Style</p>
        <p className="mt-0.5">and <span className="text-red-600">Collection.</span></p>
      </motion.div>

      <div className="relative w-full max-w-5xl mt-12 mb-20 md:mb-2">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute md:left-[18%] left-[7%] md:-rotate-[6deg] -rotate-[12deg] top-[-2rem] bg-red-700 text-white px-3 py-1 rounded-full text-[10px] md:text-sm font-semibold shadow-md"
        >
          @coplin
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute md:right-[18%] right-[7%] md:rotate-[6deg] rotate-[12deg] top-[-2rem] bg-red-200 text-red-700 px-3 py-1 rounded-full text-[10px] md:text-sm font-semibold shadow-md"
        >
          @andrea
        </motion.div>

        <div className="flex justify-center space-x-[-30px]">
          <TiltImage src="/categories/1.webp" delay={0.25} className="aspect-[3/4] w-32 md:w-50 md:h-52 rounded-xl border-[2px] border-gray-300 shadow-2xl translate-y-6 rotate-[-15deg] cursor-pointer" />
          <TiltImage src="/categories/2.webp" delay={0.30} className="aspect-[3/4] w-32 md:w-50 md:h-52 rounded-xl border-[2px] border-gray-300 shadow-2xl translate-y-5 rotate-[-6deg] cursor-pointer" />
          <TiltImage src="/categories/4.webp" delay={0.35} className="aspect-[3/4] w-32 md:w-50 md:h-52 rounded-xl border-[2px] border-gray-300 shadow-2xl -translate-y-4 rotate-[-2deg] cursor-pointer" />
          <TiltImage src="/categories/3.webp" delay={0.40} className="aspect-[3/4] w-32 z-10 md:w-62 md:h-65 rounded-xl border-[2px] border-gray-300 shadow-2xl md:-translate-y-12 -translate-y-6 rotate-[0deg] cursor-pointer" />
          <TiltImage src="/categories/5.webp" delay={0.45} className="aspect-[3/4] w-32 md:w-50 md:h-52 rounded-xl border-[2px] border-gray-300 shadow-2xl -translate-y-4 rotate-[2deg] cursor-pointer" />
          <TiltImage src="/categories/6.webp" delay={0.50} className="aspect-[3/4] w-32 md:w-50 md:h-52 rounded-xl border-[2px] border-gray-300 shadow-2xl translate-y-5 rotate-[6deg] cursor-pointer" />
          <TiltImage src="/categories/7.webp" delay={0.55} className="aspect-[3/4] w-32 md:w-50 md:h-52 rounded-xl border-[2px] border-gray-300 shadow-2xl translate-y-6 rotate-[12deg] cursor-pointer" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-gray-600 md:w-full w-[80%] mb-6"
      >
        Artists can display their masterpieces, and buyers can discover and
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex gap-4"
      >
        <Link to="/productlist/all">
          <MagneticBtn className="bg-red-700 text-white px-6 py-[4px] text-[14px] md:text-[15px] md:py-2 rounded-full font-medium">
            Shop Now
          </MagneticBtn>
        </Link>
        <motion.button
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          className="text-black underline font-medium"
        >
          Read more
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export const Slide1 = () => {
  return (
    <section className="relative bg-gray-50 h-screen w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col ">
        <img src="/home/3.png" alt="" className="lg:scale-[1.3] scale-[1.8] lg:mt-[120px] mt-[555px] lg:ml-[695px] " />
      </div>
      <div className="absolute inset-0 " />
      <div className="relative h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex pt-[50px] md:pt-[80px]">
        <div className="max-w-4xl">
          <div className="relative  mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">NEW ARRIVAL</h2>
            <div className="absolute -bottom-3 left-0 h-1 w-16 bg-red-700" />
          </div>
          <h1 className="text-5xl md:text-7xl font-[600] leading-tight text-gray-900 mb-6">
            <p className="font-[600] font-serif">Everyone's</p>
            <p className="font-serif">collection <span className="text-red-500">and</span> <span className="text-white">style</span></p>
          </h1>
          <p className="text-lg mt-[-45px] md:mt-[65px] md:text-md font-[600] border-l-[3px] border-gray-300 pl-[15px] text-gray-500 mb-8 max-w-lg">
            A collection of clothes with<br />
            contemporary styles and<br />
            trends that make you look
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2 bg-red-700 text-[14px] rounded-[6px] text-white font-medium hover:bg-red-900 transition-colors duration-300"
          >
            Shop Now
          </motion.button>
          <div className="absolute right-130 top-15 w-40 h-40 rounded-full border-4 border-red-600 opacity-30" />
          <div className="absolute right-175 top-8 w-30 h-30 rounded-full border-4 border-red-600 opacity-30" />
          <div className="absolute right-140 top-10 w-45 h-45 rounded-full bg-red-800/30" />
        </div>
      </div>
    </section>
  );
};

export const Slide2 = () => {
  return (
    <section className="relative bg-gray-50 h-screen w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col ">
        <img src="/home/2.png" alt="" className="lg:scale-[1.4] scale-[2.2] lg:mt-[100px] mt-[555px] ml-[105px] lg:ml-[785px] " />
      </div>
      <div className="absolute inset-0 " />
      <div className="relative h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex  pt-[50px] md:pt-[80px]">
        <div className="max-w-4xl">
          <div className="ml-auto relative  mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">NEW ARRIVAL</h2>
            <div className="absolute -bottom-3 left-0 h-1 w-16 bg-red-700" />
          </div>
          <h1 className="text-5xl md:text-7xl font-[600] leading-tight text-gray-900 mb-6">
            <p className="font-[600] font-serif">Everyone's</p>
            <p className="font-serif">collection <span className="text-red-500">and</span> <span className="text-white">style</span></p>
          </h1>
          <p className="text-lg mt-[-55px] md:mt-[65px] md:text-md font-[600] border-l-[3px] border-gray-300 pl-[15px] text-gray-500 mb-8 max-w-lg">
            A collection of clothes with<br />
            contemporary styles and<br />
            trends that make you look
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2 bg-red-700 text-[14px] rounded-[6px] text-white font-medium hover:bg-red-900 transition-colors duration-300"
          >
            Shop Now
          </motion.button>
          <div className="absolute right-20 top-2 w-40 h-40 rounded-full border-4 border-red-600 opacity-30" />
          <div className="absolute right-25 top-10 w-30 h-30 rounded-full bg-red-800 opacity-20" />
        </div>
      </div>
    </section>
  );
};

export const Slide3 = () => {
  return (
    <section className="relative bg-gray-50 h-screen w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col ">
        <img src="/home/4.png" alt="" className="lg:scale-[1.2] scale-[2.2] lg:mt-[150px] mt-[575px] ml-[105px] lg:ml-[585px] " />
      </div>
      <div className="absolute inset-0 " />
      <div className="relative h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex  pt-[50px] md:pt-[80px]">
        <div className="max-w-4xl">
          <div className="ml-auto relative  mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">NEW ARRIVAL</h2>
            <div className="absolute -bottom-3 left-0 h-1 w-16 bg-red-700" />
          </div>
          <h1 className="text-5xl md:text-7xl font-[600] leading-tight text-gray-900 mb-6">
            <p className="font-[600] font-serif">Everyone's</p>
            <p className="font-serif">collection <span className="text-red-500">and</span> <span className="text-white">style</span></p>
          </h1>
          <p className="text-lg mt-[-55px] md:mt-[65px] md:text-md font-[600] border-l-[3px] border-gray-300 pl-[15px] text-gray-500 mb-8 max-w-lg">
            A collection of clothes with<br />
            contemporary styles and<br />
            trends that make you look
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2 bg-red-700 text-[14px] rounded-[6px] text-white font-medium hover:bg-red-900 transition-colors duration-300"
          >
            Shop Now
          </motion.button>
          <div className="absolute right-20 top-2 w-40 h-40 rounded-full border-4 border-red-600 opacity-30" />
          <div className="absolute right-25 top-10 w-30 h-30 rounded-full bg-red-800 opacity-20" />
        </div>
      </div>
    </section>
  );
};
