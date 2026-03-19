import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { useApiMutation } from "../../api/adapter";
import {
  FiMail, FiLock, FiUser, FiPhone,
  FiCheck, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff,
  FiShoppingBag, FiHeart, FiStar, FiTrendingUp, FiMinus,
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

const steps = [
  { field: "email", icon: FiMail, label: "What's your email?", placeholder: "you@example.com", type: "email" },
  { field: "password", icon: FiLock, label: "Create a password", placeholder: "••••••••", type: "password" },
  { field: "fullName", icon: FiUser, label: "What's your name?", placeholder: "Jane Doe", type: "text" },
  { field: "contact", icon: FiPhone, label: "Contact number", placeholder: "+1234567890", type: "text", optional: true },
];

const perks = [
  { icon: FiShoppingBag, text: "Shop thousands of products", desc: "From top-rated stores" },
  { icon: FiHeart, text: "Save your favorites", desc: "Build your wishlist" },
  { icon: FiStar, text: "Exclusive member deals", desc: "Discounts and offers" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemAnim = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", contact: "" });
  const [showPw, setShowPw] = useState(false);

  const { mutate, isPending, error } = useApiMutation("/auth/register", "POST", {
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/");
    },
  });

  const current = steps[step];
  const value = form[current.field];
  const isLast = step === steps.length - 1;
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const canProceed = current.optional || (typeof value === "string" && value.trim().length > 0);

  const handleNext = () => {
    if (!canProceed) return;
    if (isLast) { mutate(form); return; }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && current.type !== "textarea") {
      e.preventDefault();
      handleNext();
    }
  };

  const continuousText = useLoopingTypewriter([
    "Join thousands of happy shoppers discovering amazing products.",
    "Create an account for faster checkout and order tracking.",
    "Unlock exclusive deals and a personalized shopping experience.",
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

      {/* Left Column: Branding & Perks */}
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
              Start your<br />shopping journey.
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
            {perks.map(({ icon: Icon, text, desc }) => (
              <motion.div
                key={text}
                variants={itemAnim}
                whileHover={{ y: -3, x: 4, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                  <Icon size={18} className="text-red-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{text}</p>
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
          <span className="flex items-center gap-1"><FiTrendingUp size={12} /> Free to join</span>
        </motion.div>
      </div>

      {/* Right Column: Multi-step Form Container */}
      <div className="flex items-center justify-center p-8 relative bg-white">

        {/* Soft Background Accent Blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-100/40 rounded-full blur-3xl"
          />
        </div>

        <div className="w-full max-w-lg px-4 z-10">
          {/* Mobile Header Only */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/diobral.png" alt="DiObral" className="w-8 h-8" />
            <span className="font-bold text-gray-800 text-lg">DiObral</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
            <p className="text-gray-400 text-sm mt-1.5">Join DiObral for a seamless shopping experience</p>
          </div>

          {/* Stepper Progress Bar Row */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.field} className="flex items-center gap-2 flex-1">
                <motion.div
                  animate={{
                    backgroundColor: i <= step ? "#FEF2F2" : "#F9FAFB",
                    borderColor: i <= step ? "#FCA5A5" : "#F3F4F6",
                  }}
                  className="w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
                >
                  {i < step ? (
                    <FiCheck size={18} className="text-red-600 font-bold" />
                  ) : (
                    <s.icon size={18} className={i === step ? "text-red-600" : "text-gray-400"} />
                  )}
                </motion.div>
                {i < steps.length - 1 && (
                  <motion.div
                    animate={{ backgroundColor: i < step ? "#FCA5A5" : "#E5E7EB" }}
                    className="h-0.5 flex-1 rounded transition-all"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">
              Step {step + 1} of {steps.length}
            </p>
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
                {error.response?.data?.message || "Registration failed"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sliding Fields Area */}
          <div className="min-h-[160px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{current.label}</h2>
                <p className="text-sm text-gray-400 mb-5">
                  {current.optional ? "Optional — you can skip this field safely" : "This field is required"}
                </p>

                {current.type === "password" ? (
                  <div className="relative group">
                    <current.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      name={current.field}
                      type={showPw ? "text" : "password"}
                      placeholder={current.placeholder}
                      value={value}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <current.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      name={current.field}
                      type={current.type || "text"}
                      placeholder={current.placeholder}
                      value={value}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Actions Footer Button Bar */}
          <div className="flex items-center gap-3 mt-3">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <FiArrowLeft size={15} />
                <span>Back</span>
              </motion.button>
            )}

            <motion.button
              whileHover={canProceed ? { scale: 1.01 } : {}}
              whileTap={canProceed ? { scale: 0.99 } : {}}
              onClick={handleNext}
              disabled={!canProceed && !current.optional}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:from-red-700 hover:to-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/15 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isLast ? (
                "Create Account"
              ) : (
                <><span className="pl-1">Next step</span><FiArrowRight size={15} /></>
              )}
            </motion.button>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center text-xs text-gray-400 mt-8">
            Already have an account?{" "}
            <Link to="/signin" className="text-red-600 font-semibold hover:text-red-700 transition-colors">Sign in</Link>
          </motion.p>
        </div>
      </div>

    </div>
  );
}
