import { createFileRoute, Link } from "@tanstack/react-router";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { products } from "../lib/products";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — SummerNest" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const items = [products[2], products[11], products[36], products[54]];
  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Saved</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Your Wishlist</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The pieces you're dreaming about — all in one place.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="space-y-4">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[80px_1fr_auto] items-center gap-4 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-black/5 sm:grid-cols-[100px_1fr_auto_auto]"
            >
              <img src={p.image} alt={p.name} className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.category}</p>
                <p className="truncate font-medium">{p.name}</p>
                <p className="mt-1 text-sm text-primary">${p.price}</p>
              </div>
              <button className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90 sm:inline-flex">
                <FiShoppingBag size={14} /> Add to Cart
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                <FiTrash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-5 py-2.5 text-sm hover:bg-foreground/5"
          >
            <FiHeart /> Discover more pieces
          </Link>
        </div>
      </section>
    </div>
  );
}

