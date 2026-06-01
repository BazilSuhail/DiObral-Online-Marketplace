import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { useApiMutation } from "../../api/adapter";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiTruck, FiShield, FiGift, FiCheck, FiAlertCircle, FiLogIn, FiUserPlus, FiCheckCircle, FiStar } from "react-icons/fi";
import LoginArt from "../../components/auth/LoginArt";
import AuthShowcase from "../../components/auth/AuthShowcase";

function useLoopingTypewriter(phrases, typeSpeed = 50, deleteSpeed = 25, pause = 2500) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState("type");

  useEffect(() => {
    const phrase = phrases[i % phrases.length];
    let t;
    if (phase === "type") {
      if (text.length < phrase.length) {
        t = setTimeout(() => setText(text + phrase[text.length]), typeSpeed);
      } else {
        t = setTimeout(() => setPhase("delete"), pause);
      }
    } else if (text.length > 0) {
      t = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
    } else {
      setI((p) => p + 1);
      setPhase("type");
      return;
    }
    return () => clearTimeout(t);
  }, [text, phase, i, phrases, typeSpeed, deleteSpeed, pause]);

  return text;
}

const PHRASES = [
  "Your cart, wishlist and saved stores are right where you left them.",
  "Pick up new drops from the stores you follow.",
  "Track every order from checkout to your doorstep.",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
};

const perks = [
  { icon: FiTruck, label: "Live order tracking" },
  { icon: FiGift, label: "Member-only deals" },
  { icon: FiShield, label: "Secure checkout" },
];

const MESH = [
  { cls: "top-[-10%] left-[-10%] w-[34rem] h-[34rem] bg-red-100/50", a: { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }, d: 16 },
  { cls: "bottom-[-15%] left-[20%] w-[30rem] h-[30rem] bg-white/80", a: { x: [0, -40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }, d: 18 },
  { cls: "top-[10%] right-[-12%] w-[28rem] h-[28rem] bg-red-200/30", a: { x: [0, -50, 0], y: [0, 50, 0], scale: [1.1, 1, 1.1] }, d: 20 },
  { cls: "bottom-[5%] right-[10%] w-[18rem] h-[18rem] bg-gray-200/80", a: { x: [0, 30, 0], y: [0, -40, 0] }, d: 12 },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const navTimer = useRef(null);

  useEffect(() => () => clearTimeout(navTimer.current), []);

  const { mutate, isPending, error } = useApiMutation("/auth/login", "POST", {
    onSuccess: (data) => {
      login(data.token, data.user);
      // Let the door swing open, then go.
      setDoorOpen(true);
      navTimer.current = setTimeout(() => navigate("/"), reduce ? 0 : 750);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ email, password });
  };

  const continuousText = useLoopingTypewriter(PHRASES, 30, 15, 2500);
  const btnState = doorOpen ? "done" : isPending ? "pending" : "idle";

  return (
    <MotionConfig reducedMotion="user">
      <div className="soft-page min-h-screen -mt-21 -md:mt-20 relative overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {MESH.map((m, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full blur-3xl ${m.cls}`}
              animate={reduce ? undefined : m.a}
              transition={{ duration: m.d, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#D1D5DB_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[auto_1fr] gap-x-12 gap-y-8 items-start">
          {/* Hero: heading + illustration */}
          <motion.section
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-start-1 lg:row-start-1"
          >
            <motion.div variants={itemAnim} className="flex items-center gap-3">
              <img src="/diobral.webp" alt="DiObral" className="w-9 h-9 object-contain" />
              <span className="text-xl font-semibold text-gray-900">DiObral</span>
              <span className="soft-badge soft-badge-sale ml-1 hidden sm:inline-flex">
                <FiStar className="h-3 w-3" /> Members
              </span>
            </motion.div>

            <motion.h1 variants={itemAnim} className="mt-6 text-3xl sm:text-4xl xl:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
              Welcome back,{" "}
              <span className="relative inline-block text-red-600">
                shopper.
                <motion.svg
                  viewBox="0 0 200 12"
                  className="absolute left-0 -bottom-2 w-full h-3"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M2 9 C 50 2, 150 2, 198 8"
                    fill="none"
                    stroke="#FCA5A5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.9, ease: "easeInOut" }}
                  />
                </motion.svg>
              </span>
            </motion.h1>
            <motion.p variants={itemAnim} className="text-gray-500 text-sm sm:text-base mt-4 leading-relaxed min-h-[48px] max-w-lg">
              {continuousText}
              <span className="inline-block w-[2px] h-4 bg-red-500 ml-1 align-middle animate-pulse" />
            </motion.p>

            <motion.div
              variants={itemAnim}
              className="mt-4 mx-auto max-w-md sm:max-w-lg lg:max-w-none"
            >
              <LoginArt keyTurned={pwFocused || doorOpen} doorOpen={doorOpen} />
            </motion.div>
          </motion.section>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-28 w-full max-w-md mx-auto"
          >
            <div className="soft-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <motion.div
                aria-hidden="true"
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-red-50"
                animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-7">
                  <motion.span
                    className="soft-icon-tile"
                    animate={pwFocused && !reduce ? { rotate: [0, -12, 12, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiLock className="h-5 w-5 text-red-600" />
                  </motion.span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Sign in</h2>
                    <p className="text-gray-500 text-sm">Unlock your cart and continue shopping</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, x: 0 }}
                      animate={{ opacity: 1, x: reduce ? 0 : [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.45 }}
                      className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5 ring-1 ring-red-100 shadow-soft-xs flex items-center gap-2"
                    >
                      <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error.response?.data?.message || "Invalid email or password"}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form onSubmit={handleSubmit} className="space-y-5" variants={container} initial="hidden" animate="show">
                  <motion.div variants={itemAnim}>
                    <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                    <div className="relative group">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-focus-within:bg-red-50 group-focus-within:text-red-600 transition-colors">
                        <FiMail size={15} />
                      </span>
                      <input
                        id="login-email"
                        className="soft-input w-full pl-12 pr-10"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                      <AnimatePresence>
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                          >
                            <FiCheckCircle size={16} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div variants={itemAnim}>
                    <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative group">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-focus-within:bg-red-50 group-focus-within:text-red-600 transition-colors">
                        <FiLock size={15} />
                      </span>
                      <input
                        id="login-password"
                        className="soft-input w-full pl-12 pr-11"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPwFocused(true)}
                        onBlur={() => setPwFocused(false)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={showPw ? "off" : "on"}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="block"
                          >
                            {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemAnim} className="pt-1">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="soft-btn soft-btn-primary soft-btn-lg w-full disabled:opacity-70 relative overflow-hidden group"
                      disabled={isPending || doorOpen}
                    >
                      {!reduce && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/25 skew-x-[-20deg] translate-x-0 group-hover:translate-x-[420%] transition-transform duration-700 ease-out"
                        />
                      )}
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={btnState}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.18 }}
                          className="relative flex items-center justify-center gap-2"
                        >
                          {btnState === "pending" && (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Unlocking...
                            </>
                          )}
                          {btnState === "done" && (<><FiCheck size={16} /> Welcome back!</>)}
                          {btnState === "idle" && (
                            <>
                              <FiLogIn size={16} /> Sign in
                              <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                </motion.form>

                {/* Perks */}
                <motion.ul variants={container} initial="hidden" animate="show" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {perks.map(({ icon: Icon, label }, i) => (
                    <motion.li
                      key={label}
                      variants={itemAnim}
                      whileHover={{ y: -3 }}
                      className="soft-card-inset rounded-2xl px-3 py-2.5 flex items-center gap-2 text-xs text-gray-600"
                    >
                      <motion.span
                        className="soft-icon-tile soft-icon-tile-sm flex-shrink-0"
                        animate={reduce ? undefined : { y: [0, -3, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                      >
                        <Icon className="h-3.5 w-3.5 text-red-600" />
                      </motion.span>
                      {label}
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center"><span className="px-3 text-xs text-gray-500 bg-white">New to DiObral?</span></div>
                </div>

                <Link to="/signup" className="soft-btn soft-btn-ghost w-full group">
                  <FiUserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />Create your account
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="lg:col-start-1 lg:row-start-2 min-w-0"
          >
            <AuthShowcase variant="login" />
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
