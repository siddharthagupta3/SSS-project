import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/products/ProductCard';
import { FilterIcon, CloseIcon } from '../components/common/Icons';

const CATEGORIES = [
  'All',
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Cargo Pants',
  'Jackets',
  'Hoodies',
  'Shoes',
  'Watches',
  'Accessories',
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const keywordParam = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = Number(searchParams.get('page')) || 1;

  // Local state
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (keywordParam) query.append('keyword', keywordParam);
        if (categoryParam && categoryParam !== 'All') query.append('category', categoryParam);
        if (sortParam) query.append('sort', sortParam);
        query.append('page', pageParam);
        query.append('limit', 12);

        const res = await api.get(`/products?${query.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data.products || []);
          setTotalPages(res.data.data.pages || 1);
          setTotalProducts(res.data.data.totalProducts || 0);
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [keywordParam, categoryParam, sortParam, pageParam]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900">
            {categoryParam !== 'All' ? categoryParam : 'All Products'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing {products.length} of {totalProducts} products
            {keywordParam && ` for "${keywordParam}"`}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500 text-xs hidden sm:inline">Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-neutral-100 border-none rounded-full px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-black outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block col-span-1 border border-neutral-200 rounded-2xl p-6 bg-white h-fit space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-neutral-900">Filters</h2>
            {(categoryParam !== 'All' || keywordParam || sortParam !== 'newest') && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2 border-t border-neutral-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Categories</h3>
            <div className="flex flex-col space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition ${
                    categoryParam === cat
                      ? 'bg-black text-white font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="col-span-1 md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-neutral-200 aspect-3/4 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 p-8">
              <h3 className="text-lg font-bold text-neutral-800">No products match your criteria</h3>
              <p className="text-sm text-neutral-500 mt-2">Try clearing your filters or searching for something else.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-black text-white px-6 py-2 rounded-full text-xs font-semibold hover:bg-neutral-800"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-6">
                  <button
                    onClick={() => handlePageChange(pageParam - 1)}
                    disabled={pageParam <= 1}
                    className="border border-neutral-300 text-neutral-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-neutral-100 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-full text-xs font-semibold ${
                            pageParam === pageNum
                              ? 'bg-black text-white'
                              : 'text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pageParam + 1)}
                    disabled={pageParam >= totalPages}
                    className="border border-neutral-300 text-neutral-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-neutral-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs md:hidden">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="font-bold text-lg text-neutral-900">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)}>
                <CloseIcon className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Categories</h3>
              <div className="flex flex-col space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      updateFilter('category', cat);
                      setMobileFilterOpen(false);
                    }}
                    className={`text-left text-sm py-2 px-3 rounded-lg ${
                      categoryParam === cat
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
              className="w-full bg-neutral-200 text-neutral-800 py-2.5 rounded-full text-sm font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
