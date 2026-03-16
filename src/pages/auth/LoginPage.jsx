import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useMarketplaceStore } from "../../lib/marketplaceStore";
import { post } from "../../api/client";
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight,
  FiShoppingBag, FiWatch, FiHeadphones, FiCamera, FiSmartphone,
  FiMonitor, FiTrendingUp, FiStar, FiHeart,
} from "react-icons/fi";

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

const categories = [
  { icon: FiShoppingBag, name: "Fashion", items: "240+ Products", gradient: "from-violet-500 to-purple-600", price: "From $9" },
  { icon: FiWatch, name: "Accessories", items: "180+ Products", gradient: "from-amber-500 to-orange-600", price: "From $15" },
  { icon: FiHeadphones, name: "Electronics", items: "320+ Products", gradient: "from-cyan-500 to-blue-600", price: "From $29" },
  { icon: FiCamera, name: "Photography", items: "95+ Products", gradient: "from-emerald-500 to-teal-600", price: "From $49" },
  { icon: FiSmartphone, name: "Mobile", items: "150+ Products", gradient: "from-rose-500 to-pink-600", price: "From $199" },
  { icon: FiMonitor, name: "Computers", items: "110+ Products", gradient: "from-indigo-500 to-blue-700", price: "From $399" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useMarketplaceStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const continuousText = useLoopingTypewriter([
    "Discover the latest trends and styles curated just for you.",
    "Shop from top-rated stores with confidence and fast delivery.",
    "Your one-stop destination for quality products at great prices.",
  ], 30, 15, 2500);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white relative overflow-hidden">

      {/* Left Column */}
      <div className="hidden lg:flex px-16 xl:px-24 py-16 flex-col justify-between bg-gradient-to-br from-gray-50 via-white to-red-50/30 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 z-10"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
            <FiShoppingBag size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">DiObral</span>
        </motion.div>

        <div className="my-auto max-w-lg z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 mb-5">
              <FiHeart size={12} className="text-red-500" />
              <span className="text-xs font-medium text-red-600">Trusted by 10k+ shoppers</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Discover<br />something<span className="text-red-600"> new</span>
            </h1>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed min-h-[48px] max-w-md">
              {continuousText}
              <span className="inline-block w-[2px] h-3.5 bg-red-500 ml-1 animate-pulse" />
            </p>
          </motion.div>

          <div className="mt-10 overflow-hidden -mx-4 px-4">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                className="flex gap-4 w-max"
              >
                {[...categories, ...categories].map((cat, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-44 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                  >
                    <div className={`h-20 bg-gradient-to-br ${cat.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
                      <cat.icon size={28} className="text-white/90 group-hover:scale-110 transition-transform" />
                      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <span className="text-[10px] font-bold text-white">{cat.price}</span>
                      </div>
                    </div>
                    <div className="bg-white px-3.5 py-3">
                      <p className="text-sm font-bold text-gray-800">{cat.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{cat.items}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-5 text-xs text-gray-400 z-10"
        >
          <span>&copy; 2026 DiObral</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1"><FiStar size={12} /> 4.8 avg rating</span>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="flex items-center justify-center p-8 relative bg-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
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
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <FiShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">DiObral</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to your account to continue shopping</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 border border-red-100 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

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
                disabled={isLoading}
              >
                {isLoading ? (
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
