require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const staticProducts = [
  { name: "NIKE RS-X³ Puzzle", brand: "NIKE", price: 2500, originalPrice: 12999, category: "Sneakers", gender: "Unisex", sizes: ["6","7","8","9","10"], colors: ["Black","White","Red"], images: ["/products/black_shoe.png"], stock: 50, description: "The RS-X³ Puzzle brings bold colors and innovative design to your everyday style." },
  { name: "PUMA Suede Classic XXI", brand: "PUMA", price: 2000, originalPrice: 7999, category: "Sneakers", gender: "Men", sizes: ["6","7","8","9","10"], colors: ["Black","White","Blue"], images: ["/products/puma_suede_black.png"], stock: 50, description: "A timeless classic with modern comfort and style." },
  { name: "PUMA Future Rider", brand: "PUMA", price: 1599, originalPrice: 9999, category: "Sneakers", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Pink"], images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop"], stock: 50, description: "Fresh design meets retro vibes for the modern woman." },
  { name: "NIKE X-Ray Square", brand: "NIKE", price: 3599, originalPrice: 14999, category: "Sneakers", gender: "Men", sizes: ["6","7","8","9","10"], colors: ["Black","Gray","White"], images: ["https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop"], stock: 50, description: "Bold chunky design with maximum cushioning." },
  { name: "PUMA Defender Bag", brand: "PUMA", price: 1999, originalPrice: 3999, category: "Bags", gender: "Unisex", sizes: ["One Size"], colors: ["Sky Blue","Black","Yellow"], images: ["/products/puma_defender_sky.png"], stock: 50, description: "Versatile backpack for all your needs." },
  { name: "LADIES OFFICE BAG", brand: "", price: 899, originalPrice: 2999, category: "Bags", gender: "Women", sizes: ["One Size"], colors: ["Orange","Red","Gold"], images: ["/products/ladies_office_bag_orange.jpg"], stock: 50, description: "Elegant tote bag for everyday office use." },
  { name: "NIKE Ultraride", brand: "NIKE", price: 2999, originalPrice: 15999, category: "Sneakers", gender: "Men", sizes: ["6","7","8","9","10"], colors: ["White","Black","Red"], images: ["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop"], stock: 50, description: "Premium running shoes with advanced technology." },
  { name: "NIKE Softride Enzo", brand: "NIKE", price: 1999, originalPrice: 11999, category: "Sneakers", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Pink","Black","Red"], images: ["/products/nike_enzo_pink.jpg"], stock: 50, description: "Comfort meets style in this everyday favorite." },
  { name: "PUMA Golf Cap", brand: "PUMA", price: 899, originalPrice: 1499, category: "Accessories", gender: "Unisex", sizes: ["One Size"], colors: ["Black","White","Blue"], images: ["/products/puma_golf_cap_black.png"], stock: 50, description: "Stylish golf cap for the sporty look." },
  { name: "Woman Belt", brand: "", price: 799, originalPrice: 1499, category: "Accessories", gender: "Women", sizes: ["One Size"], colors: ["Black"], images: ["/products/woman_belt_black.png"], stock: 50, description: "Stylish women's leather belt with elegant gold GG buckle." },
  { name: "PUMA Ferrari Backpack", brand: "PUMA", price: 999, originalPrice: 6999, category: "Bags", gender: "Men", sizes: ["One Size"], colors: ["Black","Red","Blue"], images: ["/products/ferrari_backpack_black.png"], stock: 50, description: "Premium collaboration backpack with Ferrari branding." },
  { name: "PUMA Carina Street", brand: "PUMA", price: 3499, originalPrice: 8999, category: "Sneakers", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["White","Pink","Black","Purple"], images: ["/products/puma_carina_white_v2.png"], stock: 50, description: "Retro-inspired design with contemporary comfort." },
  { name: "Men Ethnic Jutis", brand: "", price: 3499, originalPrice: 4999, category: "Ethnic", gender: "Men", sizes: ["6","7","8","9","10"], colors: ["Black","Beige","Maroon"], images: ["/products/ethnic_jutis_black.jpg"], stock: 50, description: "Premium velvet ethnic jutis with intricate gold floral embroidery." },
  { name: "VENDO HIGH HEEL SHOES Sneakers For Women", brand: "VENDO", price: 1999, originalPrice: 2999, category: "Sneakers", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Brown","Pink","White"], images: ["/products/vendo_brown.png"], stock: 50, description: "Stylish high heel sneakers for women." },
  { name: "WOMAN ETHNIC", brand: "", price: 1000, originalPrice: 1999, category: "Ethnic", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Green","Yellow","Pink"], images: ["/products/woman_ethnic_green.png"], stock: 50, description: "Elegant handcrafted women's ethnic jutis with detailed floral embroidery." },
  { name: "WOMAN ETHNIC JUITE", brand: "", price: 1200, originalPrice: 1999, category: "Ethnic", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Pink"], images: ["/products/woman_ethnic_jute.png"], stock: 50, description: "Traditional women's ethnic jutis with colorful feather-style embroidery." },
  { name: "Froh Feet Women Heels Sandals", brand: "Froh Feet", price: 1599, originalPrice: 2499, category: "Heels", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Beige","Black","Cream"], images: ["/products/froh_beige.png"], stock: 50, description: "Elegant block heel sandals for women." },
  { name: "MIYOKO Women Heels", brand: "MIYOKO", price: 999, originalPrice: 1499, category: "Heels", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Maroon"], images: ["/products/miyoko_heels_maroon.png"], stock: 50, description: "Elegant and stylish MIYOKO women heels in maroon color." },
  { name: "Woman Boot", brand: "", price: 2499, originalPrice: 4999, category: "Boot", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["Black","Brown"], images: ["/products/boot_black.png"], stock: 50, description: "Stylish woman's boot available in classic black and rich chocolate brown." },
  { name: "Man Formal Boot", brand: "", price: 1599, originalPrice: 2999, category: "Boot", gender: "Men", sizes: ["6","7","8","9","10"], colors: ["Black","Brown","Orange"], images: ["/products/man_formal_boot_black.png"], stock: 50, description: "Classic and elegant man formal boot available in Black, Brown, and Orange." },
  { name: "Travel Bag", brand: "", price: 1299, originalPrice: 2999, category: "Bags", gender: "Unisex", sizes: ["One Size"], colors: ["Black","Brown"], images: ["/products/travel_bag_black.png"], stock: 50, description: "Stylish and spacious travel bag, perfect for your next trip." },
  { name: "Woman Office Bag", brand: "", price: 1099, originalPrice: 2499, category: "Bags", gender: "Women", sizes: ["One Size"], colors: ["Blue","Pink"], images: ["/products/woman_office_bag_blue.png"], stock: 50, description: "Elegant and practical woman office bag featuring beautiful floral embroidery." },
  { name: "Woman Office Bag v2", brand: "", price: 899, originalPrice: 1999, category: "Bags", gender: "Women", sizes: ["One Size"], colors: ["Maroon","Orange"], images: ["/products/woman_office_bag_v2_maroon.png"], stock: 50, description: "Stylish and compact women's crossbody office bag." },
  { name: "Woman office Heel", brand: "", price: 950, originalPrice: 1999, category: "Heels", gender: "Women", sizes: ["6","7","8","9","10"], colors: ["White","Black","Brown"], images: ["/products/woman_office_heel_white.png"], stock: 50, description: "Elegant and comfortable block heel sandals for office wear." },
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding products...');

  let added = 0, skipped = 0;
  for (const p of staticProducts) {
    const exists = await Product.findOne({ name: p.name });
    if (exists) {
      skipped++;
      console.log(`  ⏭️  Already exists: ${p.name}`);
    } else {
      await Product.create({ ...p, isActive: true });
      added++;
      console.log(`  ✅ Added: ${p.name}`);
    }
  }

  console.log(`\n✅ Done! Added: ${added}, Skipped (already exist): ${skipped}`);
  process.exit(0);
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
