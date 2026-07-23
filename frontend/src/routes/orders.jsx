import { createFileRoute } from "@tanstack/react-router";
import { FiPackage, FiCheckCircle, FiTruck, FiClock } from "react-icons/fi";
import { getProductImage } from "../lib/images";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — SummerNest" },
      { name: "description", content: "Track your SummerNest orders and delivery status." },
    ],
  }),
  component: OrdersPage,
});

const orders = [
  {
    id: "SN-40218",
    date: "Jul 08, 2026",
    status: "Delivered",
    icon: FiCheckCircle,
    total: 189,
    items: [
      { name: "Breezy Linen Shirt", qty: 1, img: getProductImage("men", 2, 200, 200) },
      { name: "Leather Slide Sandals", qty: 1, img: getProductImage("footwear", 3, 200, 200) },
    ],
  },
  {
    id: "SN-40195",
    date: "Jul 04, 2026",
    status: "In Transit",
    icon: FiTruck,
    total: 249,
    items: [
      { name: "Weekender Duffel Bag", qty: 1, img: getProductImage("travel-essentials", 0, 200, 200) },
      { name: "Polarized Sunglasses", qty: 2, img: getProductImage("accessories", 0, 200, 200) },
    ],
  },
  {
    id: "SN-40170",
    date: "Jun 28, 2026",
    status: "Processing",
    icon: FiClock,
    total: 89,
    items: [{ name: "Tropical Swimwear", qty: 1, img: getProductImage("beach-collection", 1, 200, 200) }],
  },
];

const statusStyles = {
  Delivered: "bg-[oklch(0.9_0.09_145)] text-foreground",
  "In Transit": "bg-[oklch(0.9_0.09_230)] text-foreground",
  Processing: "bg-[oklch(0.94_0.11_95)] text-foreground",
};

function OrdersPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Your Orders</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Track every SummerNest package from checkout to doorstep.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="space-y-5">
          {orders.map((o, i) => (
            <motion.article
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-black/5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-sun">
                    <FiPackage />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">Order {o.id}</p>
                    <p className="text-xs text-muted-foreground">Placed {o.date}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusStyles[o.status]}`}
                >
                  <o.icon size={13} /> {o.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {o.items.map((it, k) => (
                  <div key={k} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                    <img src={it.img} alt={it.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4">
                <p className="text-sm text-muted-foreground">
                  Total <span className="ml-2 text-lg font-semibold text-foreground">${o.total}</span>
                </p>
                <div className="flex gap-2">
                  <button className="rounded-full border border-foreground/10 px-4 py-2 text-xs font-medium hover:bg-foreground/5">
                    Track
                  </button>
                  <button className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90">
                    View Invoice
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}

