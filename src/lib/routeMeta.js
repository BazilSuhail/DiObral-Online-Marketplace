export const PAGE_TITLES = {
  "/": "DiObral - Online Marketplace",
  "/about": "About Us - DiObral",
  "/productlist": "Products - DiObral",
  "/products": "Product Details - DiObral",
  "/bundles": "Bundles - DiObral",
  "/cart": "Shopping Cart - DiObral",
  "/checkout": "Checkout - DiObral",
  "/orders-tracking": "Order Tracking - DiObral",
  "/orders": "Order Details - DiObral",
  "/signin": "Sign In - DiObral",
  "/signup": "Sign Up - DiObral",
  "/stores": "Retailer Stores - DiObral",
  "/profile": "My Profile - DiObral",
  "/wishlist": "Wishlist - DiObral",
};

export const PAGE_META = {
  "/": {
    description: "Discover the best deals on DiObral online marketplace. Shop products, bundles, and more from trusted retailers.",
    keywords: ["online marketplace", "shopping", "deals", "products", "bundles"],
  },
  "/about": {
    description: "Learn more about DiObral, our mission, and how we connect buyers with trusted retailers.",
    keywords: ["about us", "company", "mission", "retailers"],
  },
  "/productlist": {
    description: "Browse our wide selection of products at the best prices. Find exactly what you need on DiObral.",
    keywords: ["products", "catalog", "shop", "buy"],
  },
  "/products": {
    description: "View detailed information, prices, and reviews for this product on DiObral.",
    keywords: ["product details", "price", "reviews"],
  },
  "/bundles": {
    description: "Explore exclusive bundles and save more. Get curated product packages at discounted prices on DiObral.",
    keywords: ["bundles", "deals", "packages", "discount"],
  },
  "/cart": {
    description: "Review items in your shopping cart before checkout on DiObral.",
    keywords: ["cart", "shopping cart", "checkout"],
  },
  "/checkout": {
    description: "Complete your purchase securely on DiObral. Fast and easy checkout.",
    keywords: ["checkout", "payment", "secure"],
  },
  "/orders-tracking": {
    description: "Track your orders and view order history on DiObral.",
    keywords: ["orders", "tracking", "history"],
  },
  "/orders": {
    description: "View detailed information about your order on DiObral.",
    keywords: ["order details", "tracking"],
  },
  "/signin": {
    description: "Sign in to your DiObral account to access your profile, orders, and wishlist.",
    keywords: ["sign in", "login", "account"],
  },
  "/signup": {
    description: "Create a new DiObral account and start shopping today.",
    keywords: ["sign up", "register", "account"],
  },
  "/stores": {
    description: "Discover trusted retailers and stores on DiObral.",
    keywords: ["stores", "retailers", "sellers"],
  },
  "/profile": {
    description: "Manage your DiObral account settings and preferences.",
    keywords: ["profile", "account", "settings"],
  },
  "/wishlist": {
    description: "View and manage your saved items in your DiObral wishlist.",
    keywords: ["wishlist", "saved items", "favorites"],
  },
};

const dynamicRoutePrefixes = ["/productlist", "/products", "/bundles/", "/orders/", "/stores/"];

export function getPageMeta(pathname) {
  const clean = pathname.split("?")[0];

  if (PAGE_TITLES[clean]) {
    return {
      title: PAGE_TITLES[clean],
      meta: PAGE_META[clean] || {},
    };
  }

  for (const prefix of dynamicRoutePrefixes) {
    if (clean.startsWith(prefix)) {
      const base = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
      return {
        title: PAGE_TITLES[base],
        meta: PAGE_META[base] || {},
      };
    }
  }

  return {
    title: PAGE_TITLES["/"],
    meta: PAGE_META["/"],
  };
}
