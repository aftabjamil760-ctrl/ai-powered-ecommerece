import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import SectionHeader from "./SectionHeader";
import { collectionImages } from "../lib/images";

const banners = [
  {
    title: "Men's Summer Collection",
    subtitle: "Linen, chinos, and easy tailoring",
    slug: "men",
    keywords: "man summer beach linen shirt",
    span: "md:col-span-2",
  },
  {
    title: "Women's Summer Collection",
    subtitle: "Floral, flowy, and full of sun",
    slug: "women",
    keywords: "woman summer dress vacation",
    span: "md:col-span-1",
  },
  {
    title: "Kids Summer Collection",
    subtitle: "Made for adventures & ice-cream days",
    slug: "kids",
    keywords: "kids summer vacation beach",
    span: "md:col-span-3",
  },
];

export default function SummerCollections() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <SectionHeader
        eyebrow="Summer Collections"
        title="Three moods. One perfect season."
        description="Curated edits for every member of the family — designed to travel light."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {banners.map((b) => (
          <div key={b.title} className={b.span}>
            <Link
              to={`/products?category=${b.slug}`}
              className="group relative block h-72 overflow-hidden rounded-3xl shadow-soft ring-1 ring-black/5 md:h-96"
            >
              <img src={collectionImages[b.slug]} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">Shop the edit</p>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl">{b.title}</h3>
                  <p className="mt-1 max-w-xs text-sm text-white/80">{b.subtitle}</p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <FiArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

