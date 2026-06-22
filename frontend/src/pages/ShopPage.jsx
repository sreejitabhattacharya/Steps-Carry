import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { products, priceRange } from '../data/products';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    subCategories: [],
    colors: [],
    sizes: [],
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    sortBy: 'popularity'
  });


  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const newParam = searchParams.get('new');

  const filteredProducts = useMemo(() => {
    let result = [...products];


    // Filter by category (Case-insensitive)
    const urlCategory = categoryParam?.toLowerCase();
    const sidebarCategories = filters.categories.map(c => c.toLowerCase());

    if (sidebarCategories.length > 0) {
      // If sidebar filters are active, they take precedence
      result = result.filter(p => sidebarCategories.includes(p.category.toLowerCase()));
    } else if (urlCategory) {
      // Otherwise use URL parameter
      result = result.filter(p => p.category.toLowerCase() === urlCategory);
    }

    // Search filter (Improved)
    if (searchParam) {
      const search = searchParam.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        (p.brand && p.brand.toLowerCase().includes(search)) ||
        // If searching for "shoe", include sneakers
        ((search === 'shoe' || search === 'shoes') && p.category.toLowerCase() === 'sneakers')
      );
    }


    if (newParam === 'true') {
      result = result.filter(p => p.isNew);
    }


    // These are handled above in the combined category logic

    if (filters.subCategories.length > 0) {
      result = result.filter(p => filters.subCategories.includes(p.subCategory));
    }

    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.colors.some(c => filters.colors.includes(c))
      );
    }

    if (filters.sizes.length > 0) {
      result = result.filter(p =>
        p.sizes.some(s => filters.sizes.includes(s))
      );
    }


    result = result.filter(p =>
      p.price >= filters.minPrice && p.price <= filters.maxPrice
    );


    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:

        break;
    }

    return result;
  }, [filters, categoryParam, searchParam, newParam]);

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900">
      { }
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Perfect Pair</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {filteredProducts.length} products available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          { }
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 bg-white dark:bg-gray-800 py-3 px-4 rounded-lg shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>

          { }
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={() => setShowFilters(false)}
            />
          </div>

          { }
          <div className="lg:w-3/4">
            { }
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-300">
                  Showing {filteredProducts.length} products
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 dark:text-gray-300">Sort by:</label>
                  <select
                    value={filters.sortBy}
                    onChange={handleSortChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#E63946] dark:bg-gray-700 dark:text-white"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            { }
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
