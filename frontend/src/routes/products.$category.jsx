import { createFileRoute, notFound } from "@tanstack/react-router";
import ProductListing from "../components/ProductListing";
import { getCategory, getProductsByCategory } from "../lib/products";
import { getCategoryImage } from "../lib/images";

export const Route = createFileRoute("/products/$category")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.category.name} Collection — SummerNest`
          : "Collection — SummerNest",
      },
      {
        name: "description",
        content: loaderData
          ? `Shop the SummerNest ${loaderData.category.name} collection — ${loaderData.category.tagline.toLowerCase()}.`
          : "SummerNest collection.",
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const list = getProductsByCategory(category.slug);
  return (
    <ProductListing
      title={`${category.name} Collection`}
      description={category.tagline}
      banner={getCategoryImage(category.slug)}
      products={list}
      activeCategory={category.slug}
    />
  );
}

