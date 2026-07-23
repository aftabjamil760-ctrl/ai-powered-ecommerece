import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { getCategoryImage } from "../lib/images";

export default function CategoryCard({ category, index = 0 }) {
  const bg = getCategoryImage(category.slug, 800, 1000);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={`/products?category=${category.slug}`}
        className="group relative block overflow-hidden rounded-3xl shadow-soft ring-1 ring-black/5"
      >
        <div className="aspect-[4/5] w-full overflow-hidden">
          <motion.img
            src={bg}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            whileHover={{ scale: 1.18 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">{category.tagline}</p>
            <h3 className="font-display text-2xl">{category.name}</h3>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            <FiArrowUpRight size={18} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

