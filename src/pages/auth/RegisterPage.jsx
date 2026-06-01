import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { useApiMutation } from "../../api/adapter";
import SignupArt from "../../components/auth/SignupArt";
import AuthShowcase from "../../components/auth/AuthShowcase";
import {
  FiMail, FiLock, FiUser, FiPhone,
  FiCheck, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff,
  FiShoppingBag, FiHeart, FiStar, FiTrendingUp, FiAlertCircle, FiUserCheck, FiLogIn,
  FiShield, FiInfo,
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
  { field: "email", icon: FiMail, label: "What's your email?", short: "Email", hint: "We'll send order updates and receipts here.", placeholder: "you@example.com", type: "email" },
  { field: "password", icon: FiLock, label: "Create a password", short: "Password", hint: "Mix letters, numbers and a symbol for a stronger key.", placeholder: "••••••••", type: "password" },
  { field: "fullName", icon: FiUser, label: "What's your name?", short: "Name", hint: "This appears on your member card and deliveries.", placeholder: "Jane Doe", type: "text" },
  { field: "contact", icon: FiPhone, label: "Contact number", short: "Contact", hint: "Helps couriers reach you. You can skip this.", placeholder: "+1234567890", type: "text", optional: true },
];

const perks = [
  { icon: FiShoppingBag, text: "Thousands of products" },
  { icon: FiHeart, text: "Wishlists that sync" },
  { icon: FiStar, text: "Member-only deals" },
];

const typewriterPhrases = [
  "Join thousands of happy shoppers discovering amazing products.",
  "Create an account for faster checkout and order tracking.",
  "Unlock exclusive deals and a personalized shopping experience.",
];

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#E5E7EB", "#FCA5A5", "#F87171", "#EF4444", "#DC2626"];

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  return pw.length < 6 ? Math.min(score, 1) : score;
}

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 48, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (dir) => ({ opacity: 0, x: dir * -48, filter: "blur(4px)" }),
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } } };
const itemAnim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } };

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

  const continuousText = useLoopingTypewriter(typewriterPhrases, 30, 15, 2500);

  const strength = passwordStrength(form.password);
  const celebrate = isPending || (isLast && form.contact.trim().length > 0);
  const progress = celebrate ? 1 : (step + (value.trim() ? 0.5 : 0)) / steps.length;
  const InputIcon = current.icon;

  return (
    <MotionConfig reducedMotion="user">
    <div className="soft-page min-h-screen -mt-21 -md:mt-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] relative overflow-hidden">

      {/* Left Column: Illustration hero */}
      <div className="hidden lg:flex px-12 xl:px-20 py-14 flex-col bg-gray-200/60 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img src="/diobral.webp" alt="DiObral" className="w-9 h-9 object-contain" />
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">DiObral</span>
          </div>
          <span className="soft-badge soft-badge-neutral"><FiTrendingUp className="h-3 w-3" />Free to join</span>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center max-w-xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.1 }}
          >
            <SignupArt step={step} values={form} celebrate={celebrate} className="max-w-[540px] mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-2"
          >
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
              Start your <span className="text-red-600">shopping journey.</span>
            </h1>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed min-h-[44px] max-w-md">
              {continuousText}
              <span className="inline-block w-[2px] h-3.5 bg-red-500 ml-1 animate-pulse" />
            </p>
          </motion.div>

          <motion.div variants={container} initial="hidden" animate="show" className="mt-5 flex flex-wrap gap-2">
            {perks.map(({ icon: Icon, text }) => (
              <motion.span key={text} variants={itemAnim} whileHover={{ y: -2 }} className="soft-chip">
                <Icon className="h-3.5 w-3.5 text-red-600" />{text}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8"
          >
            <AuthShowcase variant="signup" />
          </motion.div>
        </div>

        <p className="text-xs text-gray-400 mt-6">&copy; 2026 DiObral</p>
      </div>

      {/* Right Column: Multi-step Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:p-8 relative bg-gray-100">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-100/40 rounded-full blur-3xl"
          />
        </div>

        <div className="w-full max-w-lg z-10">
          {/* Mobile header + compact hero art */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <img src="/diobral.png" alt="DiObral" className="w-8 h-8" />
            <span className="font-semibold text-gray-800 text-lg">DiObral</span>
          </div>
          <div className="lg:hidden mb-4 -mx-2">
            <SignupArt step={step} values={form} celebrate={celebrate} className="max-w-[380px] mx-auto" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 16 }}
            className="soft-card rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Create an account</h2>
                <p className="text-gray-500 text-sm mt-1">Join DiObral for a seamless shopping experience</p>
              </div>
              <span className="soft-icon-tile flex-shrink-0"><FiUserCheck className="h-5 w-5" /></span>
            </div>

            {/* Step progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">
                  Step {step + 1} of {steps.length}
                </p>
                <p className="text-xs text-gray-400">{current.short}</p>
              </div>
              <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-400 to-red-600"
                  initial={false}
                  animate={{ width: `${Math.max(progress, 0.04) * 100}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                />
                <motion.div
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ x: ["-4rem", "34rem"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {steps.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <div key={s.field} className="flex flex-col items-center gap-1.5">
                      <motion.div
                        animate={{
                          backgroundColor: done ? "#DC2626" : active ? "#FEF2F2" : "#FFFFFF",
                          scale: active ? 1.08 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 220, damping: 16 }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-soft-sm ring-1 ${active ? "ring-red-300" : done ? "ring-red-600" : "ring-gray-200"}`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {done ? (
                            <motion.span key="done" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                              <FiCheck size={16} className="text-white" />
                            </motion.span>
                          ) : (
                            <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <s.icon size={16} className={active ? "text-red-600" : "text-gray-400"} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <span className={`text-[11px] ${active ? "text-red-600 font-semibold" : "text-gray-400"}`}>{s.short}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5 ring-1 ring-red-100 shadow-soft-xs flex items-center gap-2"
                >
                  <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error.response?.data?.message || "Registration failed"}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sliding Fields Area */}
            <div className="min-h-[190px] relative">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">{current.label}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                    <FiInfo className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {current.optional ? "Optional, you can skip this field safely" : current.hint}
                  </p>

                  <div className="relative group">
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 soft-icon-tile soft-icon-tile-sm group-focus-within:bg-red-600 group-focus-within:text-white transition-colors">
                      <InputIcon className="h-4 w-4" />
                    </span>
                    {current.type === "password" ? (
                      <>
                        <input
                          name={current.field}
                          type={showPw ? "text" : "password"}
                          placeholder={current.placeholder}
                          value={value}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="soft-input w-full h-12 pl-12 pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          aria-label={showPw ? "Hide password" : "Show password"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </>
                    ) : (
                      <input
                        name={current.field}
                        type={current.type || "text"}
                        placeholder={current.placeholder}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="soft-input w-full h-12 pl-12 pr-4"
                      />
                    )}
                  </div>

                  {current.type === "password" && (
                    <div className="mt-3">
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n} className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              initial={false}
                              animate={{
                                width: strength >= n ? "100%" : "0%",
                                backgroundColor: strengthColors[strength],
                              }}
                              transition={{ duration: 0.35, delay: (n - 1) * 0.05 }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <FiShield className="h-3 w-3" />Password strength
                        </span>
                        <motion.span
                          key={strength}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={strength >= 3 ? "text-red-600 font-semibold" : "text-gray-500"}
                        >
                          {form.password ? strengthLabels[strength] : ""}
                        </motion.span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-2">
              <AnimatePresence initial={false}>
                {step > 0 && (
                  <motion.button
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleBack}
                    className="soft-btn soft-btn-ghost overflow-hidden whitespace-nowrap"
                  >
                    <FiArrowLeft size={15} />
                    <span>Back</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={canProceed ? { scale: 1.01 } : {}}
                whileTap={canProceed ? { scale: 0.98 } : {}}
                onClick={handleNext}
                disabled={!canProceed && !current.optional}
                className="soft-btn soft-btn-primary soft-btn-lg flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : isLast ? (
                  <><FiUserCheck size={16} />Create Account</>
                ) : (
                  <><span className="pl-1">Next step</span><FiArrowRight size={15} /></>
                )}
              </motion.button>
            </div>

            <div className="soft-divider my-6" />

            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <Link to="/signin" className="inline-flex items-center gap-1 text-red-600 font-semibold hover:text-red-700 transition-colors"><FiLogIn size={12} />Sign in</Link>
            </p>
          </motion.div>

          <div className="lg:hidden mt-6">
            <AuthShowcase variant="signup" />
          </div>
        </div>
      </div>

    </div>
    </MotionConfig>
  );
}
