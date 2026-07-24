import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaPaypal, FaApplePay, FaGooglePay } from "react-icons/fa";
import { FiPlus, FiShield, FiLock } from "react-icons/fi";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — SummerNest" },
      { name: "description", content: "Manage your SummerNest payment methods and transactions." },
    ],
  }),
  component: PaymentsPage,
});

const methods = [
  { brand: "Visa", last: "4242", exp: "08/28", Icon: FaCcVisa, primary: true },
  { brand: "Mastercard", last: "5588", exp: "11/27", Icon: FaCcMastercard, primary: false },
  { brand: "Amex", last: "1004", exp: "02/26", Icon: FaCcAmex, primary: false },
];

const transactions = [
  { id: "TXN-2201", date: "Jul 08, 2026", desc: "Order SN-40218", amount: 189, method: "Visa •• 4242", status: "Paid" },
  { id: "TXN-2198", date: "Jul 04, 2026", desc: "Order SN-40195", amount: 249, method: "Apple Pay", status: "Paid" },
  { id: "TXN-2190", date: "Jun 28, 2026", desc: "Order SN-40170", amount: 89, method: "Mastercard •• 5588", status: "Pending" },
  { id: "TXN-2181", date: "Jun 20, 2026", desc: "Order SN-40144", amount: 65, method: "PayPal", status: "Refunded" },
];

const statusStyles = {
  Paid: "bg-[oklch(0.9_0.09_145)]",
  Pending: "bg-[oklch(0.94_0.11_95)]",
  Refunded: "bg-muted",
};

function PaymentsPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Payments & Wallet</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Add, manage and review every transaction — protected with bank-level encryption.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          {methods.map((m, i) => (
            <motion.div
              key={m.last}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-soft ${
                m.primary ? "bg-foreground" : "bg-gradient-to-br from-[oklch(0.3_0.05_260)] to-[oklch(0.2_0.03_260)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <m.Icon size={40} />
                {m.primary && (
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                    Primary
                  </span>
                )}
              </div>
              <p className="mt-10 font-mono text-lg tracking-widest">•••• •••• •••• {m.last}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/70">
                <span>{m.brand}</span>
                <span>Exp {m.exp}</span>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5" />
            </motion.div>
          ))}

          <button className="grid place-items-center rounded-3xl border-2 border-dashed border-foreground/15 p-6 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground">
            <div className="flex flex-col items-center gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
                <FiPlus />
              </span>
              Add new card
            </div>
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-black/5">
          <FiShield className="text-primary" />
          <p className="text-sm">
            <span className="font-medium">Protected checkout.</span>{" "}
            <span className="text-muted-foreground">
              All transactions are secured with PCI-DSS Level 1 encryption.
            </span>
          </p>
          <div className="ml-auto flex items-center gap-3 text-2xl text-muted-foreground">
            <FaPaypal />
            <FaApplePay />
            <FaGooglePay />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2 border-b border-foreground/5 px-6 py-4">
            <FiLock className="text-muted-foreground" />
            <h2 className="font-semibold">Recent transactions</h2>
          </div>
          <div className="divide-y divide-foreground/5">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.id} · {t.date}
                  </p>
                </div>
                <p className="hidden text-sm text-muted-foreground sm:block">{t.method}</p>
                <p className="hidden text-sm font-semibold sm:block">${t.amount}</p>
                <span
                  className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-medium sm:inline-block ${statusStyles[t.status]}`}
                >
                  {t.status}
                </span>
                <p className="text-right text-sm font-semibold sm:hidden">${t.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

