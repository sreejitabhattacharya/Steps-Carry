import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    calculateTotals(cart);
    localStorage.setItem('sc_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, selectedSize, selectedColor, quantity = 1) => {
    // Use the color-specific image if available, otherwise fall back to default
    const colorImage = (product.colorImages && selectedColor && product.colorImages[selectedColor])
      ? product.colorImages[selectedColor]
      : product.image || (product.images && product.images[0]) || '';

    const cartItem = {
      id: product.id || product._id,
      _id: product._id,
      name: product.name,
      price: product.price,
      image: colorImage,
      selectedSize,
      selectedColor,
      quantity,
      maxQuantity: 10
    };

    const existingItemIndex = cart.findIndex(
      item => item.id === cartItem.id &&
              item.selectedSize === cartItem.selectedSize &&
              item.selectedColor === cartItem.selectedColor
    );

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity = Math.min(
        updatedCart[existingItemIndex].quantity + quantity, 10
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, cartItem]);
    }
  };

  const removeFromCart = (itemId, size, color) => {
    const updatedCart = cart.filter(
      item => !(item.id === itemId && item.selectedSize === size && item.selectedColor === color)
    );
    setCart(updatedCart);
  };

  const updateQuantity = (itemId, size, color, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    const updatedCart = cart.map(item => {
      if (item.id === itemId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    setCartCount(0);
    setCartTotal(0);
    localStorage.removeItem('sc_cart');
  };

  const calculateTotals = (cartItems) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartTotal(total);
    setCartCount(count);
  };

  const deliveryFee = cartTotal > 500 ? 0 : 50;
  const platformFee = 10;
  const handlingFee = 5;
  const discount = cartTotal > 10000 ? 500 : cartTotal > 5000 ? 250 : 0;
  const finalTotal = cartTotal + deliveryFee + platformFee + handlingFee - discount;

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      deliveryFee, platformFee, handlingFee, discount, finalTotal,
      addToCart, removeFromCart, updateQuantity, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
