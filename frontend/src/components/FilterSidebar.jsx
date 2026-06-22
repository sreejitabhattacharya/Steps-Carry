import { useState } from 'react';
import { categories, colors, sizes, priceRange } from '../data/products';

const FilterSidebar = ({ filters, setFilters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceValues, setPriceValues] = useState({
    min: filters.minPrice || priceRange.min,
    max: filters.maxPrice || priceRange.max
  });

  const handleCategoryChange = (category) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const handleColorChange = (color) => {
    const newColors = localFilters.colors.includes(color)
      ? localFilters.colors.filter(c => c !== color)
      : [...localFilters.colors, color];
    setLocalFilters({ ...localFilters, colors: newColors });
  };

  const handleSizeChange = (size) => {
    const newSizes = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter(s => s !== size)
      : [...localFilters.sizes, size];
    setLocalFilters({ ...localFilters, sizes: newSizes });
  };

  const handleSubCategoryChange = (subCategory) => {
    const newSubCategories = localFilters.subCategories.includes(subCategory)
      ? localFilters.subCategories.filter(s => s !== subCategory)
      : [...localFilters.subCategories, subCategory];
    setLocalFilters({ ...localFilters, subCategories: newSubCategories });
  };

  const handleApply = () => {
    setFilters({
      ...localFilters,
      minPrice: priceValues.min,
      maxPrice: priceValues.max
    });
    onApplyFilters();
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      subCategories: [],
      colors: [],
      sizes: [],
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy: 'popularity'
    };
    setLocalFilters(resetFilters);
    setPriceValues({ min: priceRange.min, max: priceRange.max });
    setFilters(resetFilters);
    onApplyFilters();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-[#E63946] hover:underline"
        >
          Reset All
        </button>
      </div>

      {}
      <div className="mb-6">
        <h4 className="font-medium mb-3 dark:text-gray-200">Products</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.categories.includes(category.name)}
                onChange={() => handleCategoryChange(category.name)}
                className="w-4 h-4 text-[#E63946] border-gray-300 dark:border-gray-600 rounded focus:ring-[#E63946]"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{category.icon} {category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {}
      <div className="mb-6">
        <h4 className="font-medium mb-3 dark:text-gray-200">Price Range</h4>
        <div className="space-y-3">
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={priceValues.max}
            onChange={(e) => setPriceValues({ ...priceValues, max: parseInt(e.target.value) })}
            className="w-full accent-[#E63946]"
          />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>₹{priceValues.min.toLocaleString('en-IN')}</span>
            <span>₹{priceValues.max.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {}
      <div className="mb-6">
        <h4 className="font-medium mb-3 dark:text-gray-200">Colour</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorChange(color.hex)}
              className={`w-8 h-8 rounded-full border-2 ${
                localFilters.colors.includes(color.hex)
                  ? 'border-[#E63946] ring-2 ring-[#E63946] ring-offset-2'
                  : color.hex.toUpperCase() === '#FFFFFF'
                    ? 'border-gray-300'
                    : 'border-gray-200 shadow-sm'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {}
      <div className="mb-6">
        <h4 className="font-medium mb-3 dark:text-gray-200">Size</h4>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`py-2 px-3 text-sm border rounded-lg transition-colors ${
                localFilters.sizes.includes(size)
                  ? 'bg-[#E63946] text-white border-[#E63946]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-[#E63946]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="mb-6">
        <h4 className="font-medium mb-3 dark:text-gray-200">Category</h4>
        <div className="space-y-2">
          {['Men', 'Women', 'Unisex'].map((subCategory) => (
            <label key={subCategory} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.subCategories.includes(subCategory)}
                onChange={() => handleSubCategoryChange(subCategory)}
                className="w-4 h-4 text-[#E63946] border-gray-300 dark:border-gray-600 rounded focus:ring-[#E63946]"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{subCategory}</span>
            </label>
          ))}
        </div>
      </div>

      {}
      <button
        onClick={handleApply}
        className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg font-medium hover:bg-[#E63946] transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
