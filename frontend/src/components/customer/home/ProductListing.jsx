import { useMemo, useState } from "react";
import { FiSearch, FiSliders, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";
import { categories } from "../lib/products";

const PAGE_SIZE = 8;

export default function ProductListing({
  title,
  description,
  banner,
  products,
  activeCategory = null,
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(activeCategory ?? "all");
  const [maxPrice, setMaxPrice] = useState(200);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        p.price <= maxPrice &&
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, cat, maxPrice, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            SummerNest · Shop
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {description}
            </p>
          )}
          {banner && (
            <div className="pointer-events-none absolute -right-10 top-10 hidden aspect-square w-80 overflow-hidden rounded-[2.5rem] shadow-glow md:block">
              <img src={banner} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft ring-1 ring-black/5 md:max-w-md">
            <FiSearch className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search this collection..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:inline">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-foreground/10 bg-white px-4 py-2.5 text-sm shadow-soft outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-3xl bg-card p-6 shadow-soft ring-1 ring-black/5 lg:sticky lg:top-24">
            <div className="mb-6 flex items-center gap-2 text-sm font-semibold">
              <FiSliders /> Filters
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Category
              </h4>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={cat === "all"} onClick={() => { setCat("all"); setPage(1); }}>
                  All
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c.slug}
                    active={cat === c.slug}
                    onClick={() => { setCat(c.slug); setPage(1); }}
                  >
                    {c.name}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span>Max Price</span>
                <span className="text-foreground">${maxPrice}</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-[oklch(0.72_0.17_55)]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>$10</span>
                <span>$200</span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl gradient-sun p-4 text-sm text-foreground/80">
              <p className="font-semibold">Free shipping</p>
              <p className="mt-1 text-xs">
                On orders over $75 — every summer piece delivered carbon-neutral.
              </p>
            </div>
          </aside>

          {/* Grid */}
          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{current.length}</span> of{" "}
              {filtered.length} pieces
            </p>
            {current.length === 0 ? (
              <div className="grid place-items-center rounded-3xl border border-dashed border-foreground/10 py-24 text-muted-foreground">
                No pieces match your filters yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {current.map((p, i) => (
                  <ProductCard key={p._id ?? p.id} product={p} index={i} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <FiChevronLeft />
                </PageBtn>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PageBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </PageBtn>
                ))}
                <PageBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <FiChevronRight />
                </PageBtn>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterChip({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/10 bg-white hover:bg-foreground/5"
      }`}
    >
      {children}
    </button>
  );
}

function PageBtn({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={`grid h-10 min-w-10 place-items-center rounded-full border text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/10 bg-white hover:bg-foreground/5"
      }`}
    >
      {children}
    </button>
  );
}

