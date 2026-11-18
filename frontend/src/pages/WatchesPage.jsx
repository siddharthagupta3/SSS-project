import React, { useEffect, useState } from 'react';
import ProductCard from '../components/products/ProductCard';
import api from '../api/client';

const WatchesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const params = new URLSearchParams({
          category: 'Watches',
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          sort: sortBy,
          limit: 50,
        });

        const res = await api.get(`/products?${params}`);
        if (res.data.success) {
          setProducts(res.data.data?.products || []);
        }
      } catch (err) {
        console.error('Failed to load watches:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, [priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-4">
          Watches Collection
        </h1>
        <p className="text-sm text-neutral-500 max-w-2xl mx-auto">
          Discover our premium timepieces. From classic elegance to modern smartwatches.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="bg-neutral-100 text-sm px-4 py-2 rounded-lg w-32"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="bg-neutral-100 text-sm px-4 py-2 rounded-lg w-32"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-100 text-sm px-4 py-2 rounded-lg"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-200 aspect-square rounded-2xl" />
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
          <p className="text-neutral-500">No watches found.</p>
        </div>
      )}
    </div>
  );
};

export default WatchesPage;
