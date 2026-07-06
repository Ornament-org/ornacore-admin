import {
  Building2,
  Flame,
  Gift,
  Grid3X3,
  Headphones,
  Image,
  LayoutGrid,
  LineChart,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  ToggleLeft,
  TrendingUp,
} from "lucide-react";

export const SECTION_TYPES = {
  SEARCH_BAR: {
    label: "Search Bar",
    description: "Global search for products, designs, SKU",
    icon: Search,
    audiences: ["B2B", "B2C"],
    fields: [{ name: "placeholder", label: "Placeholder Text", input: "text" }],
  },
  METAL_SWITCHER: {
    label: "Metal Switcher",
    description: "Switch between Gold, Silver, Diamond",
    icon: ToggleLeft,
    audiences: ["B2B", "B2C"],
    fields: [],
  },
  RATE_BANNER: {
    label: "Gold Rate Banner",
    description: "Today's gold rate and market update",
    icon: LineChart,
    audiences: ["B2B", "B2C"],
    fields: [{ name: "showChange", label: "Show daily change", input: "toggle" }],
  },
  HERO_BANNER: {
    label: "Hero Banner",
    description: "Large promotional hero banner",
    icon: Image,
    audiences: ["B2C"],
    fields: [
      { name: "imageUrl", label: "Image URL", input: "text" },
      { name: "ctaText", label: "CTA Text", input: "text" },
      { name: "ctaTarget", label: "CTA Target", input: "text" },
    ],
  },
  FESTIVAL_BANNER: {
    label: "Festival Banner",
    description: "Seasonal or festival campaign banner",
    icon: Sparkles,
    audiences: ["B2C"],
    fields: [
      { name: "imageUrl", label: "Image URL", input: "text" },
      { name: "ctaText", label: "CTA Text", input: "text" },
    ],
  },
  QUICK_CATEGORIES: {
    label: "Quick Categories",
    description: "Top categories shortcuts",
    icon: LayoutGrid,
    audiences: ["B2B", "B2C"],
    fields: [{ name: "maxItems", label: "Max Items", input: "number" }],
  },
  TRENDING_PRODUCTS: {
    label: "Trending Products",
    description: "Popular and trending products",
    icon: TrendingUp,
    audiences: ["B2B"],
    fields: [{ name: "limit", label: "Product Limit", input: "number" }],
  },
  POPULAR_PRODUCTS: {
    label: "Popular Products",
    description: "Best selling products for customers",
    icon: Flame,
    audiences: ["B2C"],
    fields: [{ name: "limit", label: "Product Limit", input: "number" }],
  },
  RECENTLY_ADDED: {
    label: "Recently Added",
    description: "Newest catalog additions",
    icon: Star,
    audiences: ["B2B", "B2C"],
    fields: [{ name: "limit", label: "Product Limit", input: "number" }],
  },
  COLLECTIONS: {
    label: "Collections",
    description: "Curated product collections",
    icon: Grid3X3,
    audiences: ["B2C"],
    fields: [],
  },
  RECOMMENDED_PRODUCTS: {
    label: "Recommended Products",
    description: "Personalized recommendations",
    icon: ShoppingBag,
    audiences: ["B2C"],
    fields: [{ name: "limit", label: "Product Limit", input: "number" }],
  },
  OFFERS: {
    label: "Offers",
    description: "Active offers and discounts",
    icon: Gift,
    audiences: ["B2C"],
    fields: [],
  },
  TRUST_SECTION: {
    label: "Trust Section",
    description: "Our business trust and assurance",
    icon: Building2,
    audiences: ["B2B", "B2C"],
    fields: [],
  },
  SUPPORT_SECTION: {
    label: "Support Section",
    description: "Help & support information",
    icon: Headphones,
    audiences: ["B2B", "B2C"],
    fields: [],
  },
};

export const sectionTypeMeta = (sectionType) =>
  SECTION_TYPES[sectionType] ?? {
    label: sectionType,
    description: "Custom section",
    icon: LayoutGrid,
    audiences: ["B2B", "B2C", "GLOBAL"],
    fields: [],
  };

export const sectionTypesForAudience = (audience) =>
  Object.entries(SECTION_TYPES)
    .filter(([, meta]) => meta.audiences.includes(audience))
    .map(([type, meta]) => ({ type, ...meta }));
