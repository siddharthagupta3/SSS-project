import React, { useEffect, useState } from 'react';
import ProductCard from '../components/products/ProductCard';
import api from '../api/client';

const NewArrivalsPage = () => {
  const [products, setProducts] = useState(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem('new_arrivals_cache') || 'null');
      return cached?.expiresAt > Date.now() ? cached.products : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => products.length === 0);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await api.get('/products/new-arrivals', {
          params: { limit: 12, page: 1 },
        });
        if (res.data.success) {
          const nextProducts = res.data.data || [];
          nextProducts.forEach((product) => {
            if (Array.isArray(product.images)) {
              product.images = product.images
                .filter((image) => typeof image === 'string' && image.trim())
                .map((image) => image.trim().replace(/^http:\/\//i, 'https://'));
            }
          });
          setProducts(nextProducts);
          sessionStorage.setItem('new_arrivals_cache', JSON.stringify({
            products: nextProducts,
            expiresAt: Date.now() + 10 * 1000,
          }));
        }
      } catch (err) {
        console.error('Failed to load new arrivals:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-4">
          New Arrivals
        </h1>
        <p className="text-sm text-white/50 max-w-2xl mx-auto">
          Discover the latest additions to our collection. Fresh styles just dropped.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/8 aspect-square rounded-2xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-white/50">No new arrivals found.</p>
        </div>
      )}
    </div>
  );
};

export default NewArrivalsPage;
