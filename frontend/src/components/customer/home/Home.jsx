import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategory';
import TrendingProducts from './TrendingProduct';
import SummerCollections from './SummerCollection';
import WhyChooseUs from './WhyChooseUs';
import Testimonials from './Testimonials';
import Newsletter from './Newsletter';
import Footer from './Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <FeaturedCategories />
        <TrendingProducts />
        <SummerCollections />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
