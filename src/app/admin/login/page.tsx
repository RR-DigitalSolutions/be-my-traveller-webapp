"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Please enter your email or username"),
  password: z.string().min(4, "Please enter your password"),
  // Invisible honeypot trap to catch automated bots
  _bmt_hp_trap: z.string().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

// 16 Real-world international flight routes across globe
const FLIGHT_ROUTES = [
  { id: "f1", from: "DEL", to: "DXB", d: "M 780,480 Q 740,450 700,480", color: "#f59e0b", dur: "13s", delay: "0s", planeColor: "#fbbf24" },
  { id: "f2", from: "DXB", to: "LHR", d: "M 700,480 Q 610,370 510,360", color: "#38bdf8", dur: "17s", delay: "2s", planeColor: "#38bdf8" },
  { id: "f3", from: "JFK", to: "LHR", d: "M 260,420 Q 380,310 510,360", color: "#f59e0b", dur: "18s", delay: "1s", planeColor: "#f59e0b" },
  { id: "f4", from: "LHR", to: "JFK", d: "M 510,360 Q 380,420 260,420", color: "#38bdf8", dur: "19s", delay: "5s", planeColor: "#60a5fa" },
  { id: "f5", from: "DEL", to: "SIN", d: "M 780,480 Q 845,540 890,620", color: "#10b981", dur: "15s", delay: "3s", planeColor: "#34d399" },
  { id: "f6", from: "SIN", to: "HND", d: "M 890,620 Q 960,510 980,430", color: "#f59e0b", dur: "16s", delay: "6s", planeColor: "#f59e0b" },
  { id: "f7", from: "DXB", to: "FRA", d: "M 700,480 Q 640,400 560,370", color: "#38bdf8", dur: "16s", delay: "4s", planeColor: "#38bdf8" },
  { id: "f8", from: "LHR", to: "DEL", d: "M 510,360 Q 660,390 780,480", color: "#f59e0b", dur: "18s", delay: "7s", planeColor: "#fbbf24" },
  { id: "f9", from: "MIA", to: "LHR", d: "M 280,520 Q 400,380 510,360", color: "#10b981", dur: "20s", delay: "8s", planeColor: "#10b981" },
  { id: "f10", from: "BOM", to: "DXB", d: "M 765,530 Q 730,490 700,480", color: "#f59e0b", dur: "12s", delay: "2.5s", planeColor: "#f59e0b" },
  { id: "f11", from: "CDG", to: "JFK", d: "M 535,385 Q 390,340 260,420", color: "#38bdf8", dur: "18s", delay: "9s", planeColor: "#38bdf8" },
  { id: "f12", from: "SIN", to: "SYD", d: "M 890,620 Q 940,710 970,780", color: "#f59e0b", dur: "17s", delay: "10s", planeColor: "#f59e0b" },
  { id: "f13", from: "FRA", to: "DEL", d: "M 560,370 Q 685,400 780,480", color: "#38bdf8", dur: "19s", delay: "11s", planeColor: "#38bdf8" },
  { id: "f14", from: "DXB", to: "SIN", d: "M 700,480 Q 800,560 890,620", color: "#10b981", dur: "15s", delay: "4.5s", planeColor: "#34d399" },
  { id: "f15", from: "HND", to: "DEL", d: "M 980,430 Q 890,430 780,480", color: "#f59e0b", dur: "17s", delay: "12s", planeColor: "#fbbf24" },
  { id: "f16", from: "LAX", to: "HND", d: "M 170,440 Q 550,220 980,430", color: "#38bdf8", dur: "24s", delay: "3.5s", planeColor: "#60a5fa" },
];

// Major Worldwide Airport Hubs
const AIRPORT_HUBS = [
  { code: "DEL", name: "Delhi", x: 780, y: 480, color: "#f59e0b" },
  { code: "DXB", name: "Dubai", x: 700, y: 480, color: "#38bdf8" },
  { code: "LHR", name: "London", x: 510, y: 360, color: "#f59e0b" },
  { code: "JFK", name: "New York", x: 260, y: 420, color: "#38bdf8" },
  { code: "HND", name: "Tokyo", x: 980, y: 430, color: "#10b981" },
  { code: "SIN", name: "Singapore", x: 890, y: 620, color: "#f59e0b" },
  { code: "CDG", name: "Paris", x: 535, y: 385, color: "#38bdf8" },
  { code: "FRA", name: "Frankfurt", x: 560, y: 370, color: "#f59e0b" },
  { code: "SYD", name: "Sydney", x: 970, y: 780, color: "#10b981" },
  { code: "BOM", name: "Mumbai", x: 765, y: 530, color: "#f59e0b" },
  { code: "MIA", name: "Miami", x: 280, y: 520, color: "#38bdf8" },
  { code: "LAX", name: "Los Angeles", x: 170, y: 440, color: "#38bdf8" },
];

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Security state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // 3D Card Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      _bmt_hp_trap: "",
    },
  });

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Gentle 3D Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = -((y / rect.height) - 0.5) * 8;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const onSubmit = async (data: LoginForm) => {
    // Silent Honeypot Defense
    if (data._bmt_hp_trap && data._bmt_hp_trap.trim().length > 0) {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 2000));
      setIsLoading(false);
      setError("Authentication failed. Request blocked.");
      return;
    }

    if (lockoutRemaining > 0) {
      setError(`Access throttled. Please wait ${lockoutRemaining}s.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email.trim(),
        password: data.password.trim(),
        redirect: false,
      });

      setIsLoading(false);

      if (result?.error) {
        const next = failedAttempts + 1;
        setFailedAttempts(next);

        if (next >= MAX_FAILED_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_SECONDS);
          setError(`Multiple failed attempts. Access locked for ${LOCKOUT_SECONDS}s.`);
        } else {
          setError("Invalid email/username or password. Please try again.");
        }
        return;
      }

      setFailedAttempts(0);
      router.replace(callbackUrl);
    } catch {
      setIsLoading(false);
      setError("A connection error occurred. Please try again.");
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#050811] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Background Starfield / Cosmic Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-amber-500/[0.04] blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full bg-sky-500/[0.07] blur-[150px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-600/[0.04] blur-[130px]" />
      </div>

      {/* Top Header / Brand Bar (Slim) */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Internal Operations Network
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono text-[11px] bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-slate-400">
            SSL 256-BIT ENCRYPTED
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT: 12-COLUMN SPLIT GRID (4 Col Form + 8 Col Globe)             */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto my-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT: 4 COLUMNS -> PROFESSIONAL LOGIN FORM                            */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-center lg:justify-start w-full">
            <div className="w-full max-w-[420px] [perspective:1200px]">
              <div
                ref={cardRef}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)",
                  transformStyle: "preserve-3d",
                }}
                className="relative rounded-3xl bg-slate-900/90 border border-slate-700/60 p-6 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/10"
              >
                {/* Upper Subtle Glow Accent */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-amber-500/20 via-transparent to-transparent pointer-events-none" />

                {/* BE MY TRAVELLER LOGO */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-3.5 group">
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/25 to-amber-600/25 blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
                    <div className="relative w-[190px] h-[48px] sm:w-[210px] sm:h-[52px] px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 flex items-center justify-center shadow-md">
                      <Image
                        src="/Logo for website PNG.webp"
                        alt="Be My Traveller"
                        width={210}
                        height={52}
                        priority
                        className="object-contain max-h-full drop-shadow-sm"
                      />
                    </div>
                  </div>

                  <h1 className="text-lg font-bold text-white tracking-tight">
                    Admin & Staff Portal
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authorized Personnel Access Only
                  </p>
                </div>

                {/* ANTI-BRUTE FORCE LOCKOUT NOTIFICATION */}
                {lockoutRemaining > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs shadow-md">
                    <div className="font-bold mb-0.5">⚠️ Security Lockout</div>
                    <p className="text-[11px] text-rose-300">
                      Too many attempts. Access suspended for{" "}
                      <span className="font-mono font-bold text-white">{lockoutRemaining}s</span>.
                    </p>
                  </div>
                )}

                {/* LOGIN FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* INVISIBLE BOT HONEYPOT */}
                  <div
                    className="opacity-0 absolute -left-[9999px] top-0 pointer-events-none h-0 w-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor="_bmt_hp_trap">Leave blank</label>
                    <input
                      id="_bmt_hp_trap"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...register("_bmt_hp_trap")}
                    />
                  </div>

                  {/* Email / Username */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Staff Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="login-email"
                        type="text"
                        autoComplete="username"
                        disabled={isLoading || lockoutRemaining > 0}
                        {...register("email")}
                        placeholder="Enter your email or username"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-rose-400 font-medium">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isLoading || lockoutRemaining > 0}
                        {...register("password")}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm font-sans transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || lockoutRemaining > 0}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-[11px] text-rose-400 font-medium">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading || lockoutRemaining > 0}
                    className="relative w-full group overflow-hidden py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:via-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Sign In</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 -rotate-45 transition-transform"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT: 8 COLUMNS -> DEDICATED FULLY VISIBLE 3D EARTH GLOBE            */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7 xl:col-span-8 flex items-center justify-center relative w-full overflow-visible py-4 sm:py-6 lg:py-0">
            {/* Atmospheric Outer Corona Glow */}
            <div
              className="absolute w-[80%] max-w-[620px] aspect-square rounded-full bg-gradient-to-tr from-sky-600/20 via-amber-500/10 to-indigo-600/20 blur-[90px] pointer-events-none animate-pulse"
              style={{ animationDuration: "9s" }}
            />

            {/* Live Global Operations Status Badge */}
            <div className="absolute top-2 right-4 sm:right-8 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-[11px] text-slate-300 shadow-lg pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider">LIVE</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">16 Active Global Corridors</span>
            </div>

            {/* SVG Globe Viewport (Scales fluidly, fits laptops and desktops <= 78vh) */}
            <div className="relative w-full max-w-[680px] xl:max-w-[760px] aspect-square max-h-[78vh] flex items-center justify-center">
              <svg
                viewBox="0 0 1200 1200"
                className="w-full h-full drop-shadow-[0_0_60px_rgba(14,165,233,0.25)] select-none"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Globe Sphere Mask (Radius 440) */}
                  <clipPath id="largeGlobeMask">
                    <circle cx="600" cy="600" r="440" />
                  </clipPath>

                  {/* 3D Spherical Sunlight & Terminator Shading */}
                  <radialGradient id="largeGlobeShading" cx="28%" cy="28%" r="76%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                    <stop offset="35%" stopColor="#0f2b48" stopOpacity="0.12" />
                    <stop offset="68%" stopColor="#030814" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#02040a" stopOpacity="0.97" />
                  </radialGradient>

                  {/* Deep Ocean Spherical Gradient */}
                  <radialGradient id="largeOceanGrad" cx="36%" cy="36%" r="72%">
                    <stop offset="0%" stopColor="#15365c" />
                    <stop offset="55%" stopColor="#0c1e36" />
                    <stop offset="100%" stopColor="#040c18" />
                  </radialGradient>

                  {/* Glow Filter */}
                  <filter id="flightGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Outer Atmospheric Aura Rings */}
                <circle cx="600" cy="600" r="448" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.38" filter="url(#flightGlow)" />
                <circle cx="600" cy="600" r="468" fill="none" stroke="#f59e0b" strokeWidth="0.9" opacity="0.25" strokeDasharray="8 10" />

                {/* 3D GLOBE SPHERE BODY */}
                <circle cx="600" cy="600" r="440" fill="url(#largeOceanGrad)" />

                {/* Continents & Landmasses - Clipped to Globe Sphere and Rotating */}
                <g clipPath="url(#largeGlobeMask)">
                  {/* Latitude Parallels */}
                  <g stroke="#38bdf8" strokeWidth="0.75" opacity="0.15" fill="none">
                    <ellipse cx="600" cy="600" rx="440" ry="380" />
                    <ellipse cx="600" cy="600" rx="440" ry="270" />
                    <ellipse cx="600" cy="600" rx="440" ry="140" />
                    <line x1="160" y1="600" x2="1040" y2="600" strokeWidth="1.2" stroke="#f59e0b" opacity="0.24" />
                  </g>

                  {/* Seamless Horizontally Rotating Continents Landmass Group */}
                  <g className="animate-[rotateContinents_42s_linear_infinite]">
                    {/* Tile 1 Continents */}
                    <g fill="#16395b" stroke="#2563eb" strokeWidth="0.9" opacity="0.92">
                      {/* Asia / India / Middle East */}
                      <path d="M 680,440 Q 760,370 850,420 Q 940,360 1020,440 Q 980,550 900,580 Q 840,640 800,580 Q 720,540 680,440 Z" />
                      <circle cx="780" cy="510" r="22" fill="#1e4d78" /> {/* India */}
                      {/* Europe */}
                      <path d="M 540,360 Q 640,330 670,390 Q 620,460 560,440 Q 520,400 540,360 Z" />
                      {/* Africa */}
                      <path d="M 570,470 Q 680,460 700,550 Q 680,680 620,720 Q 550,660 540,560 Z" />
                      {/* Americas */}
                      <path d="M 160,340 Q 280,310 320,410 Q 250,500 190,470 Z" />
                      <path d="M 230,520 Q 320,550 290,690 Q 220,730 190,620 Z" />
                      {/* Australia */}
                      <path d="M 940,620 Q 1030,600 1050,680 Q 970,720 930,670 Z" />
                    </g>

                    {/* Tile 2 Continents (Identical Offset +1100 for Infinite Smooth Rotation) */}
                    <g transform="translate(1100, 0)" fill="#16395b" stroke="#2563eb" strokeWidth="0.9" opacity="0.92">
                      <path d="M 680,440 Q 760,370 850,420 Q 940,360 1020,440 Q 980,550 900,580 Q 840,640 800,580 Q 720,540 680,440 Z" />
                      <circle cx="780" cy="510" r="22" fill="#1e4d78" />
                      <path d="M 540,360 Q 640,330 670,390 Q 620,460 560,440 Q 520,400 540,360 Z" />
                      <path d="M 570,470 Q 680,460 700,550 Q 680,680 620,720 Q 550,660 540,560 Z" />
                      <path d="M 160,340 Q 280,310 320,410 Q 250,500 190,470 Z" />
                      <path d="M 230,520 Q 320,550 290,690 Q 220,730 190,620 Z" />
                      <path d="M 940,620 Q 1030,600 1050,680 Q 970,720 930,670 Z" />
                    </g>
                  </g>

                  {/* 3D Sphere Shading Overlay */}
                  <circle cx="600" cy="600" r="440" fill="url(#largeGlobeShading)" />
                </g>

                {/* 16 ACTIVE FLIGHT TRAJECTORIES (Arcs Across the Globe) */}
                <g opacity="0.88">
                  {FLIGHT_ROUTES.map((route) => (
                    <path
                      key={route.id}
                      d={route.d}
                      fill="none"
                      stroke={route.color}
                      strokeWidth="1.8"
                      strokeDasharray="5 7"
                      opacity="0.8"
                      className="animate-[dash_30s_linear_infinite]"
                    />
                  ))}
                </g>

                {/* WORLDWIDE AIRPORT HUB BEACONS */}
                <g>
                  {AIRPORT_HUBS.map((hub) => (
                    <g key={hub.code} transform={`translate(${hub.x}, ${hub.y})`}>
                      <circle r="4" fill={hub.color} filter="url(#flightGlow)" />
                      <circle
                        r="14"
                        fill="none"
                        stroke={hub.color}
                        strokeWidth="0.9"
                        opacity="0.4"
                        className="animate-ping"
                        style={{ animationDuration: "3.5s" }}
                      />
                      <text
                        x="8"
                        y="4"
                        fill="#f1f5f9"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity="0.85"
                      >
                        {hub.code}
                      </text>
                    </g>
                  ))}
                </g>

                {/* 16 ANIMATED FLIGHTS (Airplanes flying across all routes with auto-rotation) */}
                {FLIGHT_ROUTES.map((route) => (
                  <g
                    key={`plane-${route.id}`}
                    style={{
                      offsetPath: `path("${route.d}")`,
                      offsetRotate: "auto",
                      animation: `multiFlightFly ${route.dur} ease-in-out infinite`,
                      animationDelay: route.delay,
                    }}
                  >
                    {/* Rotated 90deg so airplane nose faces forward along tangent */}
                    <g transform="rotate(90) scale(0.9) translate(-12, -12)">
                      <path
                        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                        fill={route.planeColor}
                        filter="url(#flightGlow)"
                      />
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* PROFESSIONAL FOOTER (Single Watermark Attribution)                       */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-sans border-t border-slate-800/40">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          <span>Operational</span>
          <span className="text-slate-700">·</span>
          <span>Be My Traveller © {new Date().getFullYear()}</span>
        </div>

        {/* Single Indirect Watermark */}
        <div className="text-slate-500/80 font-mono text-[10px] tracking-wide">
          Powered by <span className="text-slate-400 font-semibold">RRDS V8 Travel Engine</span> <span className="text-slate-600">v3.1.1</span>
        </div>
      </footer>

      {/* CSS Keyframes & Dark Mode Autofill Styles */}
      <style jsx global>{`
        /* Browser Autofill Dark Mode Correction (Removes white autofill box) */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #020617 inset !important;
          box-shadow: 0 0 0px 1000px #020617 inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }

        @keyframes rotateContinents {
          0% {
            transform: translateX(0px);
          }
          100% {
            transform: translateX(-1100px);
          }
        }

        @keyframes multiFlightFly {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          6% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#050811] flex items-center justify-center text-slate-400">
          <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
