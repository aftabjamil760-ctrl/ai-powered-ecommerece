import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/customer/CustomerLayout';
import ProductListing from '../../components/customer/home/ProductListing';
import { getAllProducts } from '../../utils/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <CustomerLayout>
      <ProductListing
        title="The full summer wardrobe."
        description="70+ pieces across men, women, kids, footwear, accessories, travel and beach — all in one place."
        banner="https://images.unsplash.com/photo-1483985988355-763728e1935-763728e1935?auto=format&fit=crop&w=1200&h=900&q=80"
        products={products}
        loading={loading}
      />
    </CustomerLayout>
  );
};

export default Products;
