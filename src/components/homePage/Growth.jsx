import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const CircularProgress = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.02 }}
      className="flex flex-col items-center py-3 rounded-3xl bg-slate-50 border border-gray-300 shadow-[8px_8px_10px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,0.9)] transition-all duration-300"
    >
      <div className="relative flex items-center justify-center p-3 rounded-full bg-slate-100 shadow-[inset_5px_5px_10px_rgba(0,0,0,0.06),inset_-5px_-5px_10px_rgba(255,255,255,0.9)]">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <g transform="rotate(-90 45 45)">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#ffe4e6" strokeWidth="6" />
            <motion.circle
              cx="45" cy="45" r={radius}
              fill="none" stroke="#e11d48"
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset: offset } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </g>
          <motion.text
            x="45" y="47"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-rose-700 text-2xl font-black tracking-tight"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {value}%
          </motion.text>
        </svg>
      </div>
      <p className="text-gray-700 mt-4 text-sm font-semibold text-center leading-tight tracking-wide">{label}</p>
    </motion.div>
  );
};

const GrowthGraph = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const data = [
    { year: 2019, revenue: 20 },
    { year: 2020, revenue: 35 },
    { year: 2021, revenue: 55 },
    { year: 2022, revenue: 85 },
    { year: 2023, revenue: 140 },
    { year: 2024, revenue: 220 },
  ];

  const W = 600;
  const H = 230;
  const padX = 45;
  const padY = 25;
  const maxVal = 220;

  const pathD = "M" + data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2);
    const y = H - padY - (d.revenue / maxVal) * (H - padY * 2);
    return `${x},${y}`;
  }).join(" L");

  const areaD = pathD + ` L ${W - padX},${H - padY} L ${padX},${H - padY} Z`;

  return (
    <div ref={ref} className="relative p-4 rounded-2xl bg-rose-950/40 shadow-[inset_4px_4px_10px_rgba(40,0,10,0.6),inset_-4px_-4px_10px_rgba(255,255,255,0.15)] border border-rose-500/20">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="roseGraphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill="url(#roseGraphGradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.4 }}
        />

        {data.map((d, i) => {
          const x = padX + (i / (data.length - 1)) * (W - padX * 2);
          const y = H - padY - (d.revenue / maxVal) * (H - padY * 2);
          return (
            <g key={d.year}>
              <line x1={x} y1={padY} x2={x} y2={H - padY} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={x} y={H - padY + 20} textAnchor="middle" className="fill-white/80 text-[12px] font-semibold">{d.year}</text>
              <motion.text
                x={x} y={y - 12}
                textAnchor="middle"
                className="fill-white text-[12px] font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}
              >${d.revenue}k</motion.text>
            </g>
          );
        })}

        <motion.path
          d={pathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {data.map((d, i) => {
          const x = padX + (i / (data.length - 1)) * (W - padX * 2);
          const y = H - padY - (d.revenue / maxVal) * (H - padY * 2);
          return (
            <motion.g
              key={`dot-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
            >
              <circle cx={x} cy={y} r="10" className="fill-rose-900 stroke-white/60" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="6" className="fill-white" />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

const FloatIcon = ({ children, delay = 0, x = 0, y = 0 }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay }}
  >
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
      className="text-red-300/60"
    >
      {children}
    </motion.div>
  </motion.div>
);

const DecoCircle = ({ size, x, y, delay = 0, rotate = false }) => (
  <motion.div
    className="absolute rounded-full border border-red-200/40 pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1, delay }}
  >
    <motion.div
      className="w-full h-full"
      animate={rotate ? { rotate: [0, 360] } : {}}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="text-red-400" />
      </svg>
    </motion.div>
  </motion.div>
);

const DotGrid = () => {
  const dots = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 10; col++) {
      dots.push({ x: 5 + col * 10, y: 5 + row * 18, delay: (row * 10 + col) * 0.03 });
    }
  }
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-red-300/20"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: d.delay }}
        />
      ))}
    </div>
  );
};

const Growth = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      <DotGrid />

      <DecoCircle size={180} x={-4} y={5} delay={0.3} rotate />
      <DecoCircle size={120} x={92} y={30} delay={0.5} />
      <DecoCircle size={80} x={-2} y={45} delay={0.7} rotate />
      <DecoCircle size={100} x={95} y={70} delay={0.4} />

      <FloatIcon x={3} y={12} delay={0.2}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
      </FloatIcon>
      <FloatIcon x={96} y={8} delay={0.6}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      </FloatIcon>
      <FloatIcon x={5} y={80} delay={0.4}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
      </FloatIcon>
      <FloatIcon x={95} y={85} delay={0.8}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
      </FloatIcon>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-red-600">Growth</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From humble beginnings to a global fashion destination — track our journey.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white shadow-[12px_12px_28px_rgba(150,20,45,0.35),-8px_-8px_20px_rgba(255,255,255,0.7)] border border-rose-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">Annual Revenue</h3>
                <p className="text-xs text-rose-100/80 mt-0.5">Year-over-year expansion in USD</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/40 border border-rose-400/30">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-semibold text-white">Orders (USD)</span>
              </div>
            </div>
            <GrowthGraph />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <CircularProgress value={98} label="Delivery" />
              <CircularProgress value={95} label="Satisfaction" />
              <CircularProgress value={92} label="Repeat" />
              <CircularProgress value={88} label="On-Time" />
            </div>
          </motion.div>
        </div>

        {/* Neumorphic Key Statistics Cards: Light BG with Red/Rose Foreground */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "500K+", label: "Orders Delivered", icon: "truck" },
            { value: "200K+", label: "Happy Customers", icon: "users" },
            { value: "50+", label: "Countries Reached", icon: "globe" },
            { value: "15+", label: "Years of Excellence", icon: "star" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-slate-50 rounded-3xl p-6 lg:p-8 shadow-[8px_8px_18px_rgba(0,0,0,0.06),-8px_-8px_18px_rgba(255,255,255,0.9)] text-center border border-white/80 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mx-auto mb-4 border border-white/60">
                {stat.icon === "truck" && (
                  <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                )}
                {stat.icon === "users" && (
                  <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                )}
                {stat.icon === "globe" && (
                  <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                )}
                {stat.icon === "star" && (
                  <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                )}
              </div>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.15, type: "spring", stiffness: 100 }}
                className="text-3xl lg:text-4xl font-extrabold text-rose-700 mb-1"
              >
                {stat.value}
              </motion.p>
              <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Growth;
