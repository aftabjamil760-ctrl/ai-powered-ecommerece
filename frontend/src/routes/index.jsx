import { createFileRoute } from "@tanstack/react-router";
import Hero from "../components/Hero";
import FeaturedCategories from "../components/FeaturedCategories";
import TrendingProducts from "../components/TrendingProducts";
import SummerCollections from "../components/SummerCollections";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <TrendingProducts />
      <SummerCollections />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}

