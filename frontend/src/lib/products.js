// Realistic demo product data for SummerNest.
import { getProductImage } from "./images";

let idCounter = 1;
const perCategoryIndex = {};
const make = (category, name, price, discount, keywords, rating = 4.6, stock = "In Stock") => {
  const idx = (perCategoryIndex[category] = (perCategoryIndex[category] ?? -1) + 1);
  return {
    id: idCounter++,
    name,
    category,
    price,
    discount,
    oldPrice: discount ? Math.round(price / (1 - discount / 100)) : null,
    rating,
    stock,
    image: getProductImage(category, idx),
  };
};

export const categories = [
  { slug: "men", name: "Men", tagline: "Warm-weather essentials", keywords: "men summer fashion" },
  { slug: "women", name: "Women", tagline: "Effortless summer style", keywords: "women summer dress" },
  { slug: "kids", name: "Kids", tagline: "Playful & comfy", keywords: "kids summer clothing" },
  { slug: "footwear", name: "Footwear", tagline: "Step into summer", keywords: "sneakers sandals" },
  { slug: "accessories", name: "Accessories", tagline: "Finishing touches", keywords: "sunglasses accessories" },
  { slug: "travel-essentials", name: "Travel Essentials", tagline: "Pack the perfect trip", keywords: "travel luggage" },
  { slug: "beach-collection", name: "Beach Collection", tagline: "Sun, sea, style", keywords: "beach swimwear" },
];

export const products = [
  // Men (10)
  make("men", "Linen Summer Shorts", 49, 20, "men linen shorts"),
  make("men", "Cotton Crew T-Shirt", 29, 15, "men white tshirt"),
  make("men", "Breezy Linen Shirt", 79, 25, "men linen shirt"),
  make("men", "Utility Cargo Shorts", 65, 10, "men cargo shorts"),
  make("men", "Tailored Chino Pants", 89, 0, "men chino pants"),
  make("men", "Tropical Beach Shirt", 59, 30, "men hawaiian shirt"),
  make("men", "Classic Polo Shirt", 45, 0, "men polo shirt"),
  make("men", "Coastal Running Shoes", 129, 20, "men running shoes"),
  make("men", "Leather Slide Sandals", 55, 0, "men leather sandals"),
  make("men", "Aviator Sunglasses", 89, 15, "men aviator sunglasses"),

  // Women (10)
  make("women", "Cotton Summer Kurti", 69, 20, "women kurti"),
  make("women", "Floral Midi Dress", 99, 25, "women floral dress"),
  make("women", "Boxy Cotton Top", 39, 10, "women cotton top"),
  make("women", "Oversized Linen Shirt", 79, 15, "women linen shirt"),
  make("women", "High-Waist Denim Shorts", 59, 0, "women denim shorts"),
  make("women", "Wide-Leg Summer Pants", 89, 20, "women summer pants"),
  make("women", "Braided Sandals", 75, 15, "women braided sandals"),
  make("women", "Soft Ballet Flats", 65, 0, "women ballet flats"),
  make("women", "Woven Straw Handbag", 95, 10, "straw handbag"),
  make("women", "Oversized Sunglasses", 79, 20, "women sunglasses"),

  // Kids (10)
  make("kids", "Kids Graphic T-Shirt", 22, 15, "kids tshirt"),
  make("kids", "Kids Play Shorts", 25, 0, "kids shorts"),
  make("kids", "Kids Linen Shirt", 32, 10, "kids shirt"),
  make("kids", "Kids Cotton Pants", 29, 0, "kids pants"),
  make("kids", "Kids Summer Sneakers", 45, 20, "kids sneakers"),
  make("kids", "Kids Beach Sandals", 28, 15, "kids sandals"),
  make("kids", "Kids Bucket Cap", 19, 0, "kids cap"),
  make("kids", "Kids Adventure Backpack", 39, 10, "kids backpack"),
  make("kids", "Kids Water Bottle", 15, 0, "kids water bottle"),
  make("kids", "Kids Round Sunglasses", 18, 20, "kids sunglasses"),

  // Footwear (10)
  make("footwear", "Cloud Runner Shoes", 139, 15, "running shoes"),
  make("footwear", "Everyday Casual Shoes", 99, 0, "casual shoes"),
  make("footwear", "Pool Slides", 39, 20, "pool slides"),
  make("footwear", "Leather Sandals", 79, 10, "leather sandals"),
  make("footwear", "Retro Sneakers", 119, 25, "retro sneakers"),
  make("footwear", "Classic Flip Flops", 19, 0, "flip flops"),
  make("footwear", "Beach Sandals", 45, 15, "beach sandals"),
  make("footwear", "Trail Sports Shoes", 149, 20, "sports shoes"),
  make("footwear", "Canvas Low-Tops", 69, 0, "canvas shoes"),
  make("footwear", "Suede Slip-Ons", 89, 10, "slip on shoes"),

  // Accessories (10)
  make("accessories", "Polarized Sunglasses", 89, 15, "polarized sunglasses"),
  make("accessories", "Baseball Cap", 25, 0, "baseball cap"),
  make("accessories", "Wide-Brim Sun Hat", 45, 10, "sun hat"),
  make("accessories", "Minimalist Watch", 149, 20, "minimalist watch"),
  make("accessories", "Weekend Travel Bag", 129, 25, "travel bag"),
  make("accessories", "City Backpack", 99, 0, "city backpack"),
  make("accessories", "Woven Leather Belt", 55, 15, "leather belt"),
  make("accessories", "Bifold Wallet", 65, 0, "leather wallet"),
  make("accessories", "Insulated Water Bottle", 29, 10, "water bottle"),
  make("accessories", "Turkish Beach Towel", 39, 20, "beach towel"),

  // Travel Essentials (10)
  make("travel-essentials", "Weekender Duffel Bag", 139, 20, "duffel bag"),
  make("travel-essentials", "Memory Foam Neck Pillow", 29, 15, "neck pillow"),
  make("travel-essentials", "Leather Passport Holder", 35, 0, "passport holder"),
  make("travel-essentials", "Cable & Travel Organizer", 25, 10, "travel organizer"),
  make("travel-essentials", "Carry-On Backpack", 149, 25, "carry on backpack"),
  make("travel-essentials", "Hanging Toiletry Bag", 45, 0, "toiletry bag"),
  make("travel-essentials", "Cooling Travel Towel", 22, 15, "cooling towel"),
  make("travel-essentials", "Compact Travel Umbrella", 35, 0, "travel umbrella"),
  make("travel-essentials", "Collapsible Water Bottle", 25, 10, "collapsible water bottle"),
  make("travel-essentials", "Lightweight Travel Shoes", 109, 20, "travel shoes"),

  // Beach Collection (10)
  make("beach-collection", "Quick-Dry Beach Shorts", 45, 15, "beach shorts"),
  make("beach-collection", "Tropical Swimwear", 65, 20, "swimwear"),
  make("beach-collection", "Linen Beach Shirt", 69, 10, "beach shirt"),
  make("beach-collection", "Vacation Flip Flops", 22, 0, "flip flops beach"),
  make("beach-collection", "Woven Beach Hat", 39, 15, "beach hat"),
  make("beach-collection", "Round Beach Sunglasses", 55, 20, "beach sunglasses"),
  make("beach-collection", "Woven Beach Bag", 79, 10, "beach bag"),
  make("beach-collection", "Striped Beach Towel", 35, 0, "striped beach towel"),
  make("beach-collection", "Chilled Water Bottle", 29, 15, "insulated water bottle"),
  make("beach-collection", "Sunscreen Care Kit", 49, 20, "sunscreen"),
];

export const getProductsByCategory = (slug) =>
  products.filter((p) => p.category === slug);

export const getCategory = (slug) => categories.find((c) => c.slug === slug);

export const testimonials = [
  {
    name: "Isabella Moreno",
    role: "Traveler",
    text: "Every piece from SummerNest feels like it was made for my vacations. The linen shirt is a dream.",
    rating: 5,
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    name: "Daniel Carter",
    role: "Photographer",
    text: "Premium quality, fast shipping and packaging that feels like a gift. This is my go-to summer store.",
    rating: 5,
    avatar: "https://i.pravatar.cc/120?img=12",
  },
  {
    name: "Amelia Chen",
    role: "Designer",
    text: "The fit, the colors, the details — everything is thoughtful. It's rare to find a brand this polished.",
    rating: 5,
    avatar: "https://i.pravatar.cc/120?img=32",
  },
  {
    name: "Marcus Lee",
    role: "Founder",
    text: "SummerNest nails the balance between minimal design and playful summer energy. Absolutely obsessed.",
    rating: 5,
    avatar: "https://i.pravatar.cc/120?img=15",
  },
];

