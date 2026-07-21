import { Building2, Grid3X3, Image, LayoutGrid, LineChart, TrendingUp } from "lucide-react";

// Every entry here maps 1:1 to a real component on the storefront homepage —
// what you see in this list is exactly what's live, nothing more. If you
// don't see a section here, it doesn't exist as a manageable block on the
// site (it may be fixed page chrome, like the header search bar).
export const SECTION_TYPES = {
  BANNERS: {
    label: "Promotional Banners",
    description: "Rotating hero banner carousel",
    icon: Image,
    audiences: ["B2B", "B2C"],
    fields: [
      {
        name: "bannerIds",
        label: "Banners to show (pick a metal, then choose from its banners)",
        input: "bannersByMetal",
      },
    ],
  },
  RATE_BANNER: {
    label: "Today's Metal Rates",
    description: "Live gold & silver rate card",
    icon: LineChart,
    audiences: ["B2B", "B2C"],
    fields: [],
  },
  COLLECTIONS: {
    label: "Our Collections",
    description: "Curated product/category collections",
    icon: Grid3X3,
    audiences: ["B2B", "B2C"],
    fields: [
      {
        name: "collectionIds",
        label: "Collections to show on the homepage",
        input: "collections",
      },
      {
        name: "productsPerRow",
        label: "Product cards per row (for hand-picked-product collections)",
        input: "number",
      },
      {
        name: "productRows",
        label: "Rows of products to show before \"View All\"",
        input: "number",
      },
    ],
  },
  QUICK_CATEGORIES: {
    label: "Shop by Category",
    description: "Featured category shortcuts — required on every homepage",
    icon: LayoutGrid,
    audiences: ["B2B", "B2C"],
    fields: [
      {
        name: "showAllCategories",
        label: "Show every category automatically (skip the hand-picked list below)",
        input: "toggle",
      },
      {
        name: "categoryIds",
        label: "Categories to show (pick a metal, then choose from its categories)",
        input: "categoriesByMetal",
      },
      { name: "maxItems", label: "Max categories to show", input: "number" },
    ],
  },
  TRENDING_PRODUCTS: {
    label: "Top Picks for Your Business",
    description: "Featured product row",
    icon: TrendingUp,
    audiences: ["B2B"],
    fields: [{ name: "limit", label: "Max products to show", input: "number" }],
  },
  TRUST_SECTION: {
    label: "Why Partner With Us?",
    description: "Trust badges and business assurances",
    icon: Building2,
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
