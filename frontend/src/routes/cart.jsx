import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiTag } from "react-icons/fi";
import { products } from "../lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — SummerNest" }] }),
  component: CartPage,
});

function CartPage() {
  const items = [
    { ...products[2], qty: 1 },
    { ...products[36], qty: 2 },
    { ...products[54], qty: 1 },
  ];
  const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0);
  const shipping = subtotal > 75 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bag</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Your Summer Bag</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[90px_1fr_auto] items-center gap-4 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-black/5"
            >
              <img src={p.image} alt={p.name} className="h-24 w-24 rounded-2xl object-cover" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.category}</p>
                <p className="truncate font-medium">{p.name}</p>
                <div className="mt-2 inline-flex items-center rounded-full border border-foreground/10">
                  <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-foreground/5">
                    <FiMinus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{p.qty}</span>
                  <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-foreground/5">
                    <FiPlus size={13} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-lg font-semibold">${p.price * p.qty}</p>
                <button className="text-muted-foreground hover:text-foreground">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <aside className="h-fit rounded-3xl bg-card p-6 shadow-soft ring-1 ring-black/5 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Summary</h2>
          <div className="mt-5 space-y-2 text-sm">
            <Row label="Subtotal" value={`$${subtotal}`} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping}`} />
            <Row label="Est. tax" value="Calculated at checkout" muted />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm">
            <FiTag className="text-primary" />
            <input placeholder="Promo code" className="flex-1 bg-transparent outline-none" />
            <button className="text-xs font-semibold text-primary">Apply</button>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl">${total}</span>
          </div>
          <button className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition hover:opacity-90">
            Checkout <FiArrowRight className="transition group-hover:translate-x-1" />
          </button>
          <Link
            to="/products"
            className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Continue shopping
          </Link>
        </aside>
      </section>
    </div>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}

