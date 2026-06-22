import { useState, useEffect, useRef } from 'react';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useUser } from '../context/UserContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { products } from '../data/products';

const heroSlides = [
  {
    tag: 'NEW COLLECTION 2026',
    title: 'Footwear',
    subtitle: 'and Bags',
    desc: 'Discover the latest trends in footwear and accessories. Premium quality meets unmatched style.',
    shopLink: '/shop',
    exploreLink: '/shop?category=Sneakers',
    exploreLabel: 'Explore Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    imageAlt: 'Featured Sneaker',
    badge: '50% OFF',
  },
  {
    tag: 'PREMIUM COLLECTION',
    title: 'Designer',
    subtitle: 'Bags',
    desc: 'Carry your world in style. Handcrafted bags for every occasion — office, travel, and beyond.',
    shopLink: '/shop?category=Bags',
    exploreLink: '/shop?category=Bags',
    exploreLabel: 'Explore Bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    imageAlt: 'Featured Bag',
    badge: 'New Arrivals',
  },
];

const HomePage = () => {
  const { recentlyViewed } = useRecentlyViewed();
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const [subEmail, setSubEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const { user } = useUser();
  const [showWelcome, setShowWelcome] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroAnimating, setHeroAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToSlide = (idx) => {
    if (heroAnimating) return;
    setHeroAnimating(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setHeroAnimating(false);
    }, 350);
  };

  const prevSlide = () => goToSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => goToSlide((heroIndex + 1) % heroSlides.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    if (user?.isLoggedIn) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [user?.isLoggedIn]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subEmail.trim() || !subEmail.includes('@')) {
      setSubMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setSubLoading(true);

    setTimeout(() => {
      setSubMsg({ type: 'success', text: `✅ Thank you! A confirmation has been sent to ${subEmail}` });
      setSubEmail('');
      setSubLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {showWelcome && (
        <div className="bg-[#E63946] text-white text-center py-3 px-4 font-bold text-sm shadow-md transition-all duration-500">
          🎉 Welcome back, {user?.name || 'User'}! Ready to step into new styles?
        </div>
      )}
      {/* Hero Carousel Section */}
      <section 
        className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* Slides */}
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10"
          style={{ transition: 'opacity 0.35s ease', opacity: heroAnimating ? 0 : 1 }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <p className="text-[#E63946] font-semibold mb-2 tracking-wider">{heroSlides[heroIndex].tag}</p>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                {heroSlides[heroIndex].title}<br />{heroSlides[heroIndex].subtitle}
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">{heroSlides[heroIndex].desc}</p>
              <div className="flex flex-wrap gap-4">
                <Link to={heroSlides[heroIndex].shopLink} className="bg-[#E63946] text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg">Shop Now</Link>
                <Link to={heroSlides[heroIndex].exploreLink} className="bg-white dark:bg-gray-700 dark:text-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">{heroSlides[heroIndex].exploreLabel}</Link>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative hidden md:block">
              <img
                key={heroIndex}
                src={heroSlides[heroIndex].image}
                alt={heroSlides[heroIndex].imageAlt}
                className="w-full h-auto object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                style={{ minHeight: '350px', maxHeight: '480px', objectFit: 'cover' }}
              />
              <div className="absolute -bottom-10 -left-10 bg-white text-gray-900 p-6 rounded-xl shadow-xl">
                <p className="text-2xl font-bold text-[#E63946]">{heroSlides[heroIndex].badge}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prev / Next Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all shadow-lg"
          aria-label="Previous slide"
        >&#8249;</button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all shadow-lg"
          aria-label="Next slide"
        >&#8250;</button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === heroIndex
                  ? 'bg-[#E63946] w-8 h-3'
                  : 'bg-white/50 hover:bg-white/80 w-3 h-3'
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      { }
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹500' },
              { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy' },
              { icon: '🛡️', title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: '💬', title: '24/7 Support', desc: 'Always here to help' }
            ].map((f, i) => (
              <div key={i} className="text-center p-4">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      { }
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Check out our most popular selections</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop" className="inline-block border-2 border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1A1A1A] dark:hover:bg-white dark:hover:text-gray-900 hover:text-white transition-colors">View All Products</Link>
          </div>
        </div>
      </section>

      { }
      <section className="py-16 px-4 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl group">
              <img src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop" alt="Sneakers"
                className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Sneakers</h3>
                <p className="text-gray-300 mb-4">Comfort meets style</p>
                <Link to="/shop?category=Sneakers" className="bg-[#E63946] text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Shop Now</Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl group">
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop" alt="Bags"
                className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Bags</h3>
                <p className="text-gray-300 mb-4">Carry your style</p>
                <Link to="/shop?category=Bags" className="bg-[#E63946] text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Shop Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      { }
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">New Arrivals</h2>
              <p className="text-gray-600 dark:text-gray-400">Fresh styles just dropped</p>
            </div>
            <Link to="/shop?new=true" className="text-[#E63946] font-medium hover:underline">View All New</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      { }
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Stay Updated</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Subscribe with your email and get exclusive offers and latest updates delivered to your inbox</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={subEmail}
              onChange={(e) => { setSubEmail(e.target.value); setSubMsg(''); }}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946] dark:bg-gray-700 dark:text-white"
              required
            />
            <button type="submit" disabled={subLoading}
              className="bg-[#E63946] text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 whitespace-nowrap">
              {subLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {subMsg && (
            <p className={`mt-4 text-sm font-medium ${subMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {subMsg.text}
            </p>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">👁️ Recently Viewed</h2>
            <button
              onClick={() => { localStorage.removeItem('sc_recently_viewed'); window.location.reload(); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
