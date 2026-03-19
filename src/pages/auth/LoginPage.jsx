import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { useApiMutation } from "../../api/adapter";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiGift, FiTrendingUp, FiMinus } from "react-icons/fi";

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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const features = [
  { icon: FiShoppingBag, label: "Shop Categories", desc: "Browse hundreds of products across top brands" },
  { icon: FiTruck, label: "Fast Delivery", desc: "Real-time tracking from store to your doorstep" },
  { icon: FiShield, label: "Secure Payments", desc: "Protected transactions with multiple options" },
  { icon: FiGift, label: "Exclusive Deals", desc: "Member-only discounts and seasonal offers" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("bazil1854@gmail.com");
  const [password, setPassword] = useState("112233");
  const [showPw, setShowPw] = useState(false);

  const { mutate, isPending, error } = useApiMutation("/auth/login", "POST", {
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ email, password });
  };

  const continuousText = useLoopingTypewriter([
    "Discover the latest trends and styles curated just for you.",
    "Shop from top-rated stores with confidence and fast delivery.",
    "Your one-stop destination for quality products at great prices.",
  ], 30, 15, 2500);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white relative overflow-hidden">

      {/* Decorative Center Divider */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-4/5 bg-gradient-to-b from-transparent via-red-200 to-transparent origin-center z-10"
      >
        <motion.div
          animate={{ y: [-12, 12, -12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-red-200 shadow-sm flex items-center justify-center"
        >
          <FiMinus size={12} className="text-red-500" />
        </motion.div>
      </motion.div>

      {/* Left Column: Branding & Features */}
      <div className="hidden lg:flex px-16 xl:px-24 py-16 flex-col justify-between bg-gray-50/40 relative">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <img src="/logo.png" alt="DiObral" className="w-9 h-9 object-contain" />
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">DiObral</span>
        </motion.div>

        <div className="my-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
              Discover<br />something new.
            </h1>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed min-h-[48px] max-w-md">
              {continuousText}
              <span className="inline-block w-[2px] h-3.5 bg-red-500 ml-1 animate-pulse" />
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-10 space-y-3"
          >
            {features.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                variants={itemAnim}
                whileHover={{ y: -3, x: 4, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                  <Icon size={18} className="text-red-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-5 text-xs text-gray-400"
        >
          <span>&copy; 2026 DiObral</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1"><FiTrendingUp size={12} /> Customer Store</span>
        </motion.div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex items-center justify-center p-8 relative bg-white">

        {/* Soft Background Canvas Ambient Blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-100/40 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md px-4 sm:px-6 z-10"
        >
          {/* Mobile Only Header */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/diobral.png" alt="DiObral" className="w-8 h-8" />
            <span className="font-bold text-gray-800 text-lg">DiObral</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to continue shopping</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 border border-red-100 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error.response?.data?.message || "Invalid email or password"}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative group">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative group">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <><FiArrowRight size={16} /> Sign in</>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center"><span className="px-3 text-xs text-gray-400 bg-white">New to DiObral?</span></div>
            </div>

            <Link
              to="/signup"
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Create your account
            </Link>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
