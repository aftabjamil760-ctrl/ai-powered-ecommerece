import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";
import { products } from "../lib/products";

export default function TrendingProducts() {
  // Pick a diverse selection across categories
  const trending = [
    products.find((p) => p.name === "Breezy Linen Shirt"),
    products.find((p) => p.name === "Floral Midi Dress"),
    products.find((p) => p.name === "Retro Sneakers"),
    products.find((p) => p.name === "Woven Straw Handbag"),
    products.find((p) => p.name === "Weekender Duffel Bag"),
    products.find((p) => p.name === "Kids Summer Sneakers"),
    products.find((p) => p.name === "Polarized Sunglasses"),
    products.find((p) => p.name === "Tropical Swimwear"),
  ].filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <SectionHeader
        eyebrow="Trending Now"
        title="Loved this week."
        description="The pieces our community can't stop styling — restocked and ready to travel."
        action={
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 md:self-auto"
          >
            Shop all <FiArrowRight className="transition group-hover:translate-x-1" />
          </Link>
        }
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trending.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

