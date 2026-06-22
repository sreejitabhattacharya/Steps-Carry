export const products = [
  {
    id: 1,
    name: "NIKE RS-X³ Puzzle",
    category: "Sneakers",
    subCategory: "Men",
    price: 2500,
    originalPrice: 12999,
    colors: ["#000000", "#FFFFFF", "#E63946"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.5,
    reviews: 234,
    isNew: true,
    image: "/products/black_shoe.png",
    colorImages: {
      "#000000": "/products/black_shoe.png",
      "#FFFFFF": "/products/white_shoe.png",
      "#E63946": "/products/red_shoe.png"
    },
    description: "The RS-X³ Puzzle brings bold colors and innovative design to your everyday style."
  },
  {
    id: 2,
    name: "PUMA Suede Classic XXI",
    category: "Sneakers",
    subCategory: "Men",
    price: 2000,
    originalPrice: 7999,
    colors: ["#000000", "#FFFFFF", "#1E3A8A"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.3,
    reviews: 189,
    isNew: false,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
    colorImages: {
      "#000000": "/products/puma_suede_black.png",
      "#FFFFFF": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
      "#1E3A8A": "/products/puma_suede_blue.png"
    },
    description: "A timeless classic with modern comfort and style."
  },
  {
    id: 3,
    name: "PUMA Future Rider",
    category: "Sneakers",
    subCategory: "Women",
    price: 1599,
    originalPrice: 9999,
    colors: ["#FF69B4"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.7,
    reviews: 312,
    isNew: true,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
    description: "Fresh design meets retro vibes for the modern woman."
  },
  {
    id: 4,
    name: "NIKE X-Ray Square",
    category: "Sneakers",
    subCategory: "Men",
    price: 3599,
    originalPrice: 14999,
    colors: ["#000000", "#808080", "#FFFFFF"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.4,
    reviews: 156,
    isNew: false,
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop",
    colorImages: {
      "#000000": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop",
      "#808080": "/products/nike_xray_gray.png",
      "#FFFFFF": "/products/nike_xray_white.png"
    },
    description: "Bold chunky design with maximum cushioning."
  },
  {
    id: 5,
    name: "PUMA Defender Bag",
    category: "Bags",
    subCategory: "Unisex",
    price: 1999,
    originalPrice: 3999,
    colors: ["#87CEEB", "#000000", "#FFFF00"],
    sizes: ["One Size"],
    rating: 4.6,
    reviews: 98,
    isNew: true,
    image: "/products/puma_defender_sky.png",
    colorImages: {
      "#87CEEB": "/products/puma_defender_sky.png",
      "#000000": "/products/puma_defender_black.png",
      "#FFFF00": "/products/puma_defender_yellow.png"
    },
    description: "Versatile backpack for all your needs."
  },
  {
    id: 6,
    name: "LADIES OFFICE BAG",
    category: "Bags",
    subCategory: "Women",
    price: 899,
    originalPrice: 2999,
    colors: ["#FFA500", "#E63946", "#FFD700"],
    sizes: ["One Size"],
    rating: 4.2,
    reviews: 76,
    isNew: false,
    image: "/products/ladies_office_bag_orange.jpg",
    colorImages: {
      "#FFA500": "/products/ladies_office_bag_orange.jpg",
      "#E63946": "/products/ladies_office_bag_red.jpg",
      "#FFD700": "/products/ladies_office_bag_gold.jpg"
    },
    description: "Elegant tote bag for everyday office use."
  },
  {
    id: 7,
    name: "NIKE Ultraride",
    category: "Sneakers",
    subCategory: "Men",
    price: 2999,
    originalPrice: 15999,
    colors: ["#FFFFFF", "#000000", "#E63946"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.8,
    reviews: 267,
    isNew: true,
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
    colorImages: {
      "#FFFFFF": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
      "#000000": "/products/nike_ultraride_black.png",
      "#E63946": "/products/nike_ultraride_red.png"
    },
    description: "Premium running shoes with advanced technology."
  },
  {
    id: 8,
    name: "NIKE Softride Enzo",
    category: "Sneakers",
    subCategory: "Women",
    price: 1999,
    originalPrice: 11999,
    colors: ["#FF69B4", "#000000", "#E63946"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.5,
    reviews: 198,
    isNew: false,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
    colorImages: {
      "#FF69B4": "/products/nike_enzo_pink.jpg",
      "#E63946": "/products/nike_enzo_red.jpg"
    },
    description: "Comfort meets style in this everyday favorite."
  },
  {
    id: 9,
    name: "PUMA Golf Cap",
    category: "Accessories",
    subCategory: "Unisex",
    price: 899,
    originalPrice: 1499,
    colors: ["#000000", "#FFFFFF", "#1E3A8A"],
    sizes: ["One Size"],
    rating: 4.1,
    reviews: 45,
    isNew: false,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
    colorImages: {
      "#000000": "/products/puma_golf_cap_black.png",
      "#FFFFFF": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      "#1E3A8A": "/products/puma_golf_cap_blue.jpg"
    },
    description: "Stylish golf cap for the sporty look."
  },
  {
    id: 25,
    name: "Woman Belt",
    category: "Accessories",
    subCategory: "Women",
    price: 799,
    originalPrice: 1499,
    colors: ["#000000"],
    sizes: ["One Size"],
    rating: 4.5,
    reviews: 38,
    isNew: true,
    image: "/products/woman_belt_black.png",
    colorImages: {
      "#000000": "/products/woman_belt_black.png"
    },
    description: "Stylish women's leather belt with elegant gold GG buckle. Perfect for office and casual wear."
  },
  {
    id: 11,
    name: "PUMA Ferrari Backpack",
    category: "Bags",
    subCategory: "Men",
    price: 999,
    originalPrice: 6999,
    colors: ["#000000", "#E63946", "#1E3A8A"],
    sizes: ["One Size"],
    rating: 4.9,
    reviews: 178,
    isNew: true,
    image: "/products/ferrari_backpack_black.png",
    colorImages: {
      "#000000": "/products/ferrari_backpack_black.png",
      "#E63946": "/products/ferrari_backpack_red.png",
      "#1E3A8A": "/products/ferrari_backpack_blue.png"
    },
    description: "Premium collaboration backpack with Ferrari branding."
  },
  {
    id: 12,
    name: "PUMA Carina Street",
    category: "Sneakers",
    subCategory: "Women",
    price: 3499,
    originalPrice: 8999,
    colors: ["#FFFFFF", "#FF69B4", "#000000", "#800080"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.6,
    reviews: 234,
    isNew: false,
    image: "/products/puma_carina_white_v2.png",
    colorImages: {
      "#FFFFFF": "/products/puma_carina_white_v2.png",
      "#FF69B4": "/products/puma_carina_pink.png",
      "#000000": "/products/puma_carina_black.png",
      "#800080": "/products/puma_carina_purple.png"
    },
    description: "Retro-inspired design with contemporary comfort."
  },
  {
    id: 13,
    name: "Men Ethnic Jutis",
    category: "Ethnic",
    subCategory: "Men",
    price: 3499,
    originalPrice: 4999,
    colors: ["#000000", "#D2B48C", "#800000"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.8,
    reviews: 124,
    isNew: true,
    image: "/products/ethnic_jutis_black.jpg",
    colorImages: {
      "#000000": "/products/ethnic_jutis_black.jpg",
      "#D2B48C": "/products/ethnic_jutis_beige.jpg",
      "#800000": "/products/ethnic_jutis_maroon.jpg"
    },
    description: "Premium velvet ethnic jutis with intricate gold floral embroidery. Perfect for weddings and special occasions."
  },
  {
    id: 14,
    name: "VENDO HIGH HEEL SHOES Sneakers For Women",
    category: "Sneakers",
    subCategory: "Women",
    price: 1999,
    originalPrice: 2999,
    colors: ["#8B4513", "#FF69B4", "#FFFFFF"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.7,
    reviews: 86,
    isNew: true,
    image: "/products/vendo_brown.png",
    colorImages: {
      "#8B4513": "/products/vendo_brown.png",
      "#FF69B4": "/products/vendo_pink.png",
      "#FFFFFF": "/products/vendo_white.png"
    },
    description: "Stylish high heel sneakers for women, combining height and comfort with a modern streetwear aesthetic."
  },
  {
    id: 15,
    name: "WOMAN ETHNIC",
    category: "Ethnic",
    subCategory: "Women",
    price: 1000,
    originalPrice: 1999,
    colors: ["#228B22", "#FFFF00", "#FFB6C1"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.9,
    reviews: 45,
    isNew: true,
    image: "/products/woman_ethnic_green.png",
    colorImages: {
      "#228B22": "/products/woman_ethnic_green.png",
      "#FFFF00": "/products/woman_ethnic_yellow.png",
      "#FFB6C1": "/products/woman_ethnic_pink.png"
    },
    description: "Elegant handcrafted women's ethnic jutis with detailed floral embroidery. Perfect for traditional wear and festivals."
  },
  {
    id: 16,
    name: "WOMAN ETHNIC JUITE",
    category: "Ethnic",
    subCategory: "Women",
    price: 1200,
    originalPrice: 1999,
    colors: ["#FF69B4"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.6,
    reviews: 29,
    isNew: true,
    image: "/products/woman_ethnic_jute.png",
    description: "Traditional women's ethnic jutis with colorful feather-style embroidery on a soft pink base."
  },
  {
    id: 17,
    name: "Froh Feet Women Heels Sandals",
    category: "Heels",
    subCategory: "Women",
    price: 1599,
    originalPrice: 2499,
    colors: ["#D2B48C", "#000000", "#FFFDD0"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.5,
    reviews: 62,
    isNew: true,
    image: "/products/froh_beige.png",
    colorImages: {
      "#D2B48C": "/products/froh_beige.png",
      "#000000": "/products/froh_black.png",
      "#FFFDD0": "/products/froh_cream.png"
    },
    description: "Elegant block heel sandals for women, featuring a comfortable platform and stylish straps. Perfect for parties and formal events."
  },
  {
    id: 18,
    name: "MIYOKO Women Heels",
    category: "Heels",
    subCategory: "Women",
    price: 999,
    originalPrice: 1499,
    colors: ["#800000"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.8,
    reviews: 45,
    isNew: true,
    image: "/products/miyoko_heels_maroon.png",
    colorImages: {
      "#800000": "/products/miyoko_heels_maroon.png"
    },
    description: "Elegant and stylish MIYOKO women heels in maroon color. Perfect for any occasion."
  },
  {
    id: 19,
    name: "Woman Boot",
    category: "Boot",
    subCategory: "Women",
    price: 2499,
    originalPrice: 4999,
    colors: ["#000000", "#8B4513"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.8,
    reviews: 56,
    isNew: true,
    image: "/products/boot_black.png",
    colorImages: {
      "#000000": "/products/boot_black.png",
      "#8B4513": "/products/boot_chocolate.png"
    },
    description: "Stylish woman's boot available in classic black and rich chocolate brown. Perfect for stepping out in style."
  },
  {
    id: 20,
    name: "Man Formal Boot",
    category: "Boot",
    subCategory: "Men",
    price: 1599,
    originalPrice: 2999,
    colors: ["#000000", "#8B4513", "#FFA500"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.7,
    reviews: 42,
    isNew: true,
    image: "/products/man_formal_boot_black.png",
    colorImages: {
      "#000000": "/products/man_formal_boot_black.png",
      "#8B4513": "/products/man_formal_boot_brown.png",
      "#FFA500": "/products/man_formal_boot_orange.png"
    },
    description: "Classic and elegant man formal boot available in Black, Brown, and Orange."
  },
  {
    id: 21,
    name: "Travel Bag",
    category: "Bags",
    subCategory: "Unisex",
    price: 1299,
    originalPrice: 2999,
    colors: ["#000000", "#8B4513"],
    sizes: ["One Size"],
    rating: 4.8,
    reviews: 64,
    isNew: true,
    image: "/products/travel_bag_black.png",
    colorImages: {
      "#000000": "/products/travel_bag_black.png",
      "#8B4513": "/products/travel_bag_chocolate.png"
    },
    description: "Stylish and spacious travel bag, perfect for your next trip. Available in classic Black and rich Chocolate colors."
  },
  {
    id: 22,
    name: "Woman Office Bag",
    category: "Bags",
    subCategory: "Women",
    price: 1099,
    originalPrice: 2499,
    colors: ["#1E3A8A", "#FF69B4"],
    sizes: ["One Size"],
    rating: 4.7,
    reviews: 84,
    isNew: true,
    image: "/products/woman_office_bag_blue.png",
    colorImages: {
      "#1E3A8A": "/products/woman_office_bag_blue.png",
      "#FF69B4": "/products/woman_office_bag_pink.png"
    },
    description: "Elegant and practical woman office bag featuring beautiful floral embroidery. Available in Blue and Pink."
  },
  {
    id: 23,
    name: "Woman Office Bag",
    category: "Bags",
    subCategory: "Women",
    price: 899,
    originalPrice: 1999,
    colors: ["#800000", "#FFA500"],
    sizes: ["One Size"],
    rating: 4.6,
    reviews: 58,
    isNew: true,
    image: "/products/woman_office_bag_v2_maroon.png",
    colorImages: {
      "#800000": "/products/woman_office_bag_v2_maroon.png",
      "#FFA500": "/products/woman_office_bag_v2_orange.png"
    },
    description: "Stylish and compact women's crossbody office bag. Available in classic Maroon and vibrant Orange."
  },
  {
    id: 24,
    name: "Woman office Heel",
    category: "Heels",
    subCategory: "Women",
    price: 950,
    originalPrice: 1999,
    colors: ["#FFFFFF", "#000000", "#8B4513"],
    sizes: [6, 7, 8, 9, 10],
    rating: 4.8,
    reviews: 72,
    isNew: true,
    image: "/products/woman_office_heel_white.png",
    colorImages: {
      "#FFFFFF": "/products/woman_office_heel_white.png",
      "#000000": "/products/woman_office_heel_black.png",
      "#8B4513": "/products/woman_office_heel_chocolate.png"
    },
    description: "Elegant and comfortable block heel sandals for office wear. Available in White, Black, and Chocolate."
  }
];

export const categories = [
  { id: 1, name: "Sneakers", icon: "👟" },
  { id: 2, name: "Bags", icon: "👜" },
  { id: 3, name: "Accessories", icon: "⌚" },
  { id: 4, name: "Ethnic", icon: "🥿" },
  { id: 5, name: "Heels", icon: "👠" },
  { id: 6, name: "Boot", icon: "👢" }
];

export const priceRange = {
  min: 700,
  max: 10000
};

export const colors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#E63946" },
  { name: "Pink", hex: "#FF69B4" },
  { name: "Blue", hex: "#1E3A8A" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Gray", hex: "#808080" },
  { name: "Beige", hex: "#D2B48C" },
  { name: "Maroon", hex: "#800000" },
  { name: "Green", hex: "#228B22" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Light Pink", hex: "#FFB6C1" },
  { name: "Cream", hex: "#FFFDD0" }
];

export const sizes = [6, 7, 8, 9, 10];
