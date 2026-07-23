import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import { heroImage } from "../lib/images";

export default function Hero() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-16 md:grid-cols-2 md:px-8 md:pb-32 md:pt-24">
        <div className="relative z-10 flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-4 py-1.5 text-xs font-medium backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Summer 2026 Collection — Now Live
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl"
          >
            Endless summer,{" "}
            <span className="italic text-primary">effortlessly</span> styled.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-5 max-w-lg text-lg text-muted-foreground"
          >
            Linen, light, and a little bit of ocean breeze. Discover a summer wardrobe designed for
            long days, salt air, and slow evenings.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background shadow-soft transition hover:opacity-90"
            >
              Shop Now
              <FiArrowRight className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white"
            >
              Explore Collection
            </Link>
          </motion.div>

          <div className="mt-14 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <p className="font-display text-2xl text-foreground">12k+</p>
              <p className="text-xs uppercase tracking-widest">Happy travelers</p>
            </div>
            <div className="h-8 w-px bg-foreground/10" />
            <div>
              <p className="font-display text-2xl text-foreground">4.9★</p>
              <p className="text-xs uppercase tracking-widest">Avg. rating</p>
            </div>
            <div className="h-8 w-px bg-foreground/10" />
            <div>
              <p className="font-display text-2xl text-foreground">70+</p>
              <p className="text-xs uppercase tracking-widest">New pieces</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-glow"
          >
            <img
              src={heroImage}
              alt="Family enjoying summer vacation in trendy fashion"
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Floating shapes */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 top-8 hidden h-24 w-24 rounded-3xl gradient-sun shadow-glow md:block"
          />
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 bottom-16 hidden h-28 w-28 rounded-full gradient-sky shadow-soft md:block"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass absolute -bottom-6 left-6 rounded-2xl p-4 shadow-soft"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bestseller</p>
            <p className="mt-1 font-medium">Breezy Linen Shirt</p>
            <p className="text-sm text-primary">$59 · Free shipping</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground md:flex"
      >
        Scroll <FiChevronDown />
      </motion.div>
    </section>
  );
}

