// 'use client';
// import { useRef } from 'react';
// import { motion, useScroll, useTransform } from "motion/react";
// import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaImage } from 'react-icons/fa';

// const ScrollWordReveal = ({
//   text = `DiObral is a premium fashion brand committed to delivering high-quality, timeless clothing with a modern edge. Rooted in sophistication and minimalism, DiObral blends luxury with everyday wear, empowering individuals to express confidence through elegant, understated style. The brand celebrates craftsmanship, clean design, and detail-driven aesthetics — all reflected in its sleek, intuitive web experience built to match the identity of the label.`,
// }) => {
//   const containerRef = useRef(null);
//   const words = text.split(' ');

//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ['start end', 'end start'],
//   });

//   const SCROLL_END = 0.65;

//   return (
//   <div className="max-w-6xl mx-auto p-6 font-sans">
//       {/* Testimonial Text */}
//       <div className="mb-6">
//         <p className="text-gray-700 text-lg leading-relaxed italic">
//           "We loved was the freedom it gave us. I can now launch a campaign in a new city by
//           creating visuals in just 5 minutes, simply by adding new data to a template — no more
//           back-and-forth with the design team"
//         </p>
//       </div>

//       {/* Author Info */}
//       <div className="flex items-center mb-8">
//         <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
//           <span className="text-blue-600 font-bold">JW</span>
//         </div>
//         <div>
//           <p className="font-semibold text-gray-800">Jenny Wilson • Marketing Manager</p>
//           <div className="flex items-center text-gray-500 text-sm">
//             <FaMapMarkerAlt className="mr-1" />
//             <span>docusign</span>
//           </div>
//         </div>
//       </div>

//       {/* Read more link */}
//       <div className="mb-8">
//         <a href="#" className="text-blue-600 font-medium hover:underline flex items-center">
//           Read full case study
//           <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//           </svg>
//         </a>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-3 gap-x-12">
//         <div className="bg-gray-50 p-4 rounded-lg">

//           <p className="text-2xl font-bold text-red-700">78h</p>
//           <p className="text-xs text-gray-500">(cost of a designer in Paris)</p>
//         </div>

//         <div className="bg-gray-50 p-4 rounded-lg scale-[1.1]">
//           <p className="text-2xl font-bold text-red-800">1490$</p>
//           <p className="text-xs text-gray-500">of Paris located designer.</p>
//         </div>

//         <div className="bg-gray-50 p-4 rounded-lg">

//           <p className="text-2xl font-bold text-red-700">390</p>
//           <p className="text-xs text-gray-500">4 templates</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ScrollWordReveal;

'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from "motion/react";

const ScrollWordReveal = ({
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
    <div className="max-w-[1024px] mx-auto px-4 lg:py-32">
      <div
        ref={containerRef}
        className="relative mx-auto text-[22px] lg:text-[37px] font-semibold leading-relaxed"
      >
        {/* Gray background layer (static) */}
        <div className="absolute inset-0 flex flex-wrap justify-center text-gray-400 opacity-40 pointer-events-none select-none">
          {words.map((word, i) => (
            <span key={`gray-${i}`} className="whitespace-pre mr-1">
              {word}
            </span>
          ))}
        </div>

        {/* Animated foreground layer */}
        <div className="relative flex flex-wrap justify-center">
          {words.map((word, i) => {
            const start = (i / words.length) * SCROLL_END;
            const end = ((i + 1) / words.length) * SCROLL_END;

            const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
            const x = useTransform(scrollYProgress, [start, end], [-2, 0]);

            return (
              <motion.span
                key={`motion-${i}`}
                style={{ opacity, x }}
                className="inline-block text-center whitespace-pre mr-1 text-red-700"
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      </div>

    <div className="grid grid-cols-1 md:grid-cols-3 mt-16 lg:mt-24 gap-y-6 gap-x-12">
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-2xl lg:text-4xl font-bold text-red-700">40k+</p>
    <p className="text-xs lg:text-[15px] mt-2 ml-1 text-gray-500">
      Over 40,000 delighted customers trust our brand.
    </p>
  </div>

  <div className="bg-gray-50 shad p-4 rounded-lg lg:scale-[1.1]">
    <p className="text-2xl lg:text-4xl font-bold text-red-800">200k+</p>
    <p className="text-xs lg:text-[15px] mt-2 ml-1 text-gray-500">
      200,000+ elegant fashion pieces sold worldwide.
    </p>
  </div>

  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-2xl lg:text-4xl font-bold text-red-700">15+</p>
    <p className="text-xs lg:text-[15px] mt-2 ml-1 text-gray-500">
      15+ years crafting timeless luxury fashion.
    </p>
  </div>
</div>

    </div>
  );
};

export default ScrollWordReveal;
