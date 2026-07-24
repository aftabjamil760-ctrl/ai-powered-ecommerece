import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Logo from "../components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — SummerNest" }] }),
  component: LoginPage,
});

function LoginPage() {
  return <AuthShell title="Welcome back." subtitle="Sign in to continue your summer." mode="login" />;
}

export function AuthShell({ title, subtitle, mode }) {
  const isLogin = mode === "login";
  return (
    <section className="grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&h=1600&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">SummerNest Members</p>
          <h3 className="mt-3 font-display text-4xl">
            Early drops. Free shipping. A softer summer.
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Logo />
          <h1 className="mt-8 font-display text-4xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/10 py-2.5 text-sm hover:bg-foreground/5">
              <FcGoogle /> Google
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/10 py-2.5 text-sm hover:bg-foreground/5">
              <FaApple /> Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-foreground/10" />
            or with email
            <span className="h-px flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
            {!isLogin && (
              <Field icon={<FiMail />} placeholder="Full name" type="text" />
            )}
            <Field icon={<FiMail />} placeholder="Email address" type="email" />
            <Field icon={<FiLock />} placeholder="Password" type="password" />
            {isLogin && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="accent-[oklch(0.72_0.17_55)]" />
                  Remember me
                </label>
                <a className="text-primary" href="#">Forgot password?</a>
              </div>
            )}
            <button className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition hover:opacity-90">
              {isLogin ? "Sign in" : "Create account"}
              <FiArrowRight className="transition group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "New to SummerNest?" : "Already have an account?"}{" "}
            <Link to={isLogin ? "/register" : "/login"} className="font-medium text-primary">
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ icon, ...rest }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-white px-4 py-3 focus-within:border-foreground/30">
      <span className="text-muted-foreground">{icon}</span>
      <input
        {...rest}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

