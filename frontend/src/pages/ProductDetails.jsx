import { useState, useEffect } from 'react';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import ProductCard from '../components/ProductCard';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductReviewsQA from '../components/ProductReviewsQA';

const ProductDetails = () => {
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes[0]);
      setSelectedColor(foundProduct.colors[0]);
    }
  }, [id]);

  // Update selected image when color changes via the color palette
  useEffect(() => {
    if (product && selectedColor && product.colorImages) {
      // Find the index of this color among colors that have images
      const colorsWithImages = product.colors.filter(c => product.colorImages[c]);
      const colorIndex = colorsWithImages.indexOf(selectedColor);
      if (colorIndex !== -1) {
        setSelectedImage(colorIndex);
      }
    }
  }, [selectedColor, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 bg-[#E63946] text-white px-6 py-2 rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/cart');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };


  // Build the list of images from colorImages (one per color, in color order)
  const productImages = product.colorImages
    ? product.colors
        .filter(color => product.colorImages[color])
        .map(color => product.colorImages[color])
    : [product.image];

  // Build a reverse mapping: image URL -> color hex
  const imageToColor = {};
  if (product.colorImages) {
    product.colors.forEach(color => {
      if (product.colorImages[color]) {
        imageToColor[product.colorImages[color]] = color;
      }
    });
  }

  // When a thumbnail is clicked, update both the selected image AND the selected color
  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
    const clickedImage = productImages[index];
    if (imageToColor[clickedImage]) {
      setSelectedColor(imageToColor[clickedImage]);
    }
  };

  // When arrows are clicked, also update the selected color
  const handlePrevImage = () => {
    const newIndex = selectedImage === 0 ? productImages.length - 1 : selectedImage - 1;
    setSelectedImage(newIndex);
    const newImage = productImages[newIndex];
    if (imageToColor[newImage]) {
      setSelectedColor(imageToColor[newImage]);
    }
  };

  const handleNextImage = () => {
    const newIndex = selectedImage === productImages.length - 1 ? 0 : selectedImage + 1;
    setSelectedImage(newIndex);
    const newImage = productImages[newIndex];
    if (imageToColor[newImage]) {
      setSelectedColor(imageToColor[newImage]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        { }
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-[#E63946]">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-[#E63946]">Shop</button>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200">{product.name}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            { }
            <div className="space-y-6">
              {/* Main Image with Arrows */}
              <div className="relative group aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/20 scale-95'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            { }
            <div className="space-y-6">
              { }
              {product.isNew && (
                <span className="bg-[#E63946] text-white text-sm font-bold px-3 py-1 rounded-full">
                  NEW
                </span>
              )}

              { }
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>

              { }
              <div className="flex items-center gap-3">
                <div className="flex">{renderStars(product.rating)}</div>
                <span className="text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              { }
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-[#E63946]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              { }
              <p className="text-gray-600 dark:text-gray-400">{product.description}</p>

              { }
              {product.category === 'Sneakers' && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 dark:text-white">Select Size</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 border-2 rounded-lg font-medium transition-colors ${selectedSize === size
                          ? 'border-[#E63946] bg-[#E63946] text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#E63946]'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Select Color / Style: <span className="text-gray-900 dark:text-white">
                    {selectedColor === '#000000' ? 'Black' :
                      selectedColor === '#FFFFFF' ? 'White' :
                        selectedColor === '#E63946' ? 'Red' :
                          selectedColor === '#FF69B4' ? 'Pink' :
                            selectedColor === '#1E3A8A' ? 'Blue' :
                              selectedColor === '#8B4513' ? 'Brown' :
                                selectedColor === '#228B22' ? 'Green' :
                                  selectedColor === '#FFFF00' ? 'Yellow' :
                                    selectedColor === '#FFB6C1' ? 'Light Pink' :
                                      selectedColor === '#FFFDD0' ? 'Cream' : 'Gray'}
                  </span>
                </h3>
                <div className="flex gap-4">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        selectedColor === color
                          ? 'border-[#E63946] scale-110 shadow-lg'
                          : color.toUpperCase() === '#FFFFFF' 
                            ? 'border-gray-200 hover:scale-105' 
                            : 'border-transparent hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: selectedColor === color ? `0 0 20px ${color}40` : 'none'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              { }
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Quantity</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-600 shadow-sm transition-all text-xl font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-lg dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-600 shadow-sm transition-all text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-tight">Max 10 per order</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-[2] flex items-center justify-center gap-3 bg-[#1A1A1A] text-white py-5 rounded-2xl font-bold hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-[2] flex items-center justify-center gap-3 bg-[#E63946] text-white py-5 rounded-2xl font-bold hover:bg-[#D62839] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#E63946]/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
                <button
                  onClick={() => {
                    // Pass product with the currently selected color image
                    const colorImage = (product.colorImages && selectedColor && product.colorImages[selectedColor])
                      ? product.colorImages[selectedColor]
                      : product.image;
                    toggleWishlist({ ...product, image: colorImage });
                  }}
                  className={`flex-1 flex items-center justify-center rounded-2xl transition-all border-2 ${isInWishlist(product.id)
                      ? 'bg-red-50 border-[#E63946] text-[#E63946]'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:border-[#E63946] hover:text-[#E63946]'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              { }
              <div className="border-t dark:border-gray-700 pt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Category:</span> {product.category}</p>
                <p><span className="font-medium">Sub Category:</span> {product.subCategory}</p>
                <p><span className="font-medium">SKU:</span> PUM-{product.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        </div>

        { }
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate dark:text-gray-200">{relatedProduct.name}</h3>
                    <p className="text-[#E63946] font-bold mt-1">
                      ₹{relatedProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {/* Reviews & Q&A */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ProductReviewsQA productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;
