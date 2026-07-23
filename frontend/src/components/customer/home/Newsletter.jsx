import { FiMail, FiArrowRight } from "react-icons/fi";

export default function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero px-8 py-16 text-center shadow-soft ring-1 ring-black/5 md:px-16">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The Nest Letter
          </p>
          <h2 className="font-display text-4xl md:text-5xl">
            Sunlit stories, straight to your inbox.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Early drops, travel guides, and 10% off your first order. No noise, ever.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-5 py-3 shadow-soft">
              <FiMail className="text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@summer.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90">
              Subscribe
              <FiArrowRight className="transition group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full gradient-sun opacity-70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full gradient-sky opacity-70 blur-2xl" />
      </div>
    </section>
  );
}

