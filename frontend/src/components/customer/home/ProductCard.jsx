import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiEye, FiStar } from "react-icons/fi";
import { addToCart } from "../../../utils/cartService";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const productId = product._id ?? product.id;
  const { name, category, price, discount, oldPrice, image, stock } = product;
  const ratingValue = Number(
    // prefer single-number rating, then aggregated average, then 0
    product.rating ?? product.ratingAverage ?? (Array.isArray(product.ratings) && product.ratings.length ? product.ratings[0].rating : 0)
  ) || 0;

  const handleCardClick = () => {
    if (!user) {
      navigate('/register', { state: { from: `/product/${productId}` } });
      return;
    }
    navigate(`/product/${productId}`);
  };

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && handleCardClick()}
      className="group relative overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-black/5 cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow">
              -{discount}%
            </span>
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-foreground/70 backdrop-blur">
            {stock}
          </span>
        </div>

        <button
          aria-label="Wishlist"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground/70 shadow transition hover:bg-white hover:text-primary"
        >
          <FiHeart size={16} />
        </button>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                navigate('/register', { state: { from: `/product/${productId}` } });
                return;
              }
              addToCart({ ...product, id: productId });
              navigate('/cart');
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-xs font-semibold text-background transition hover:opacity-90"
          >
            <FiShoppingBag size={14} /> Add to Cart
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label="Quick view"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-foreground shadow hover:text-primary"
          >
            <FiEye size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{category}</p>
        <h3 className="mt-1 line-clamp-1 font-medium text-foreground">{name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <FiStar className="fill-primary text-primary" size={12} />
          <span className="font-medium text-foreground">{ratingValue.toFixed(1)}</span>
          <span>· {Array.isArray(product.ratings) ? product.ratings.length : '—'} reviews</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-semibold">${price}</span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through">${oldPrice}</span>
          )}
        </div>
      </div>
    </article>
  );
}

