import { createFileRoute } from "@tanstack/react-router";
import ProductListing from "../components/ProductListing";
import { products } from "../lib/products";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Products — SummerNest" },
      {
        name: "description",
        content: "Every SummerNest piece in one place — filter by category, price and rating.",
      },
    ],
  }),
  component: ProductsAll,
});

function ProductsAll() {
  return (
    <ProductListing
      title="The full summer wardrobe."
      description="70+ pieces across men, women, kids, footwear, accessories, travel and beach — all in one place."
      banner="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&h=900&q=80"
      products={products}
    />
  );
}

