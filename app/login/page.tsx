"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Mock authentication bypass
    setTimeout(() => {
      if (email.trim() && password.length >= 6) {
        // Set mock cookie for Next.js middleware (cc_session = 1)
        document.cookie = "cc_session=1; path=/; SameSite=Strict";
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. Password must be at least 6 characters.");
        setLoading(false);
      }
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      document.cookie = "cc_session=1; path=/; SameSite=Strict";
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-zinc-100 antialiased selection:bg-zinc-800">
      {/* Decorative Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl relative">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-amber-500 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Constituency Connect
          </h1>
          <p className="text-sm text-zinc-400">
            WhatsApp-first Public Grievance Portal · MLA Dashboard
          </p>
        </div>

        {/* Status card / alert for demo info */}
        <div className="flex gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs text-amber-400/90">
          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Mock Demo Sandbox</p>
            <p className="mt-1 text-zinc-400">
              Sign in with any email and a password of at least 6 characters (e.g., <code className="text-amber-200">admin@kla.gov.in</code> / <code className="text-amber-200">password123</code>).
            </p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-colors disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-colors disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full py-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 transition-all font-semibold shadow-lg hover:shadow-zinc-100/10"
            disabled={loading}
          >
            {loading ? "Signing in..." : (
              <>
                Sign In with Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2 text-zinc-600">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase font-bold tracking-widest">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Google sign-in */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full py-5 border-zinc-800 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign In with Google
        </Button>

      </div>
    </div>
  );
}
