import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import CategoryCard from "./CategoryCard";
import { categories } from "../lib/products";
import SectionHeader from "./SectionHeader";

export default function FeaturedCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <SectionHeader
        eyebrow="Featured Categories"
        title="Shop by moment."
        description="From city strolls to seaside escapes — every category, curated for the season."
        action={
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-foreground/10 px-5 py-2.5 text-sm font-medium transition hover:bg-foreground hover:text-background md:self-auto"
          >
            View all <FiArrowRight className="transition group-hover:translate-x-1" />
          </Link>
        }
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c, i) => (
          <CategoryCard key={c.slug} category={c} index={i} />
        ))}
      </div>
    </section>
  );
}

