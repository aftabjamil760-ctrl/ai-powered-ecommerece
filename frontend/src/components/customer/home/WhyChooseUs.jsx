import { FiAward, FiTruck, FiShield, FiRotateCcw } from "react-icons/fi";
import SectionHeader from "./SectionHeader";

const features = [
  {
    icon: FiAward,
    title: "Premium Quality",
    desc: "Small-batch fabrics, hand-finished details, tested by real travelers.",
    tint: "gradient-sun",
  },
  {
    icon: FiTruck,
    title: "Fast Delivery",
    desc: "Carbon-neutral shipping in 2–4 days, tracked door to door.",
    tint: "gradient-sky",
  },
  {
    icon: FiShield,
    title: "Secure Payments",
    desc: "Encrypted checkout with every major card, Apple Pay & Klarna.",
    tint: "gradient-sun",
  },
  {
    icon: FiRotateCcw,
    title: "Easy Returns",
    desc: "30 days, free return label. No questions, no fuss.",
    tint: "gradient-sky",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <SectionHeader
        eyebrow="Why SummerNest"
        title="Designed for the way you travel."
        description="Every piece — and every experience — built around the little joys of summer."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-black/5">
            <span className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${f.tint} text-foreground`}>
              <f.icon size={20} />
            </span>
            <h3 className="font-display text-xl">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

