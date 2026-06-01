// Content for the auth pages' showcase + backdrop (AuthShowcase / AuthBackdrop).

export const showcaseCopy = {
  login: {
    eyebrow: "Welcome back",
    title: "Your favourite stores missed you",
    subtitle:
      "Pick up where you left off: saved carts, followed stores and fresh deals picked just for you.",
    highlight: "New drops since your last visit",
  },
  register: {
    eyebrow: "Join DioBral",
    title: "One account, hundreds of verified stores",
    subtitle:
      "Create your free account to unlock member prices, faster checkout and order tracking from every store.",
    highlight: "Member-only prices from day one",
  },
};

export const stats = [
  { id: "customers", label: "Happy customers", value: 48000, suffix: "+", decimals: 0 },
  { id: "stores", label: "Verified stores", value: 1200, suffix: "+", decimals: 0 },
  { id: "orders", label: "Orders delivered", value: 215000, suffix: "+", decimals: 0 },
  { id: "rating", label: "Average rating", value: 4.8, suffix: "/5", decimals: 1 },
];

export const testimonials = [
  {
    id: "t1",
    name: "Ayesha K.",
    city: "Lahore",
    rating: 5,
    quote: "Ordered on Monday, wore it on Wednesday. Packaging was neat and returns were painless.",
    tag: "Fashion",
  },
  {
    id: "t2",
    name: "Hamza R.",
    city: "Karachi",
    rating: 5,
    quote: "Love following my favourite stores. I get their new drops before anyone else.",
    tag: "Sneakers",
  },
  {
    id: "t3",
    name: "Sana M.",
    city: "Islamabad",
    rating: 4,
    quote: "Checkout is quick and secure. Free delivery over Rs. 2000 keeps me coming back.",
    tag: "Home",
  },
  {
    id: "t4",
    name: "Bilal A.",
    city: "Faisalabad",
    rating: 5,
    quote: "Bundles saved me a lot on gifts. Every store I bought from was legit and fast.",
    tag: "Bundles",
  },
];

export const trustBadges = [
  { id: "secure", title: "Secure checkout", text: "Encrypted payments" },
  { id: "delivery", title: "Free delivery", text: "On orders over Rs. 2000" },
  { id: "returns", title: "Easy returns", text: "7-day hassle-free" },
  { id: "verified", title: "Verified stores", text: "Every seller reviewed" },
];

export const partnerLogos = [
  { id: "nike", name: "Nike", src: "/logos/nike.png" },
  { id: "adidas", name: "Adidas", src: "/logos/adidas.png" },
  { id: "levi", name: "Levi's", src: "/logos/levi.png" },
  { id: "boss", name: "Boss", src: "/logos/boss.png" },
  { id: "ck", name: "Calvin Klein", src: "/logos/ck.png" },
];

export const floatingProducts = [
  { id: "bag", kind: "bag", name: "Tote Bag", price: "Rs. 3,490", was: "Rs. 4,990", sale: "-30%", depth: 18 },
  { id: "sneaker", kind: "sneaker", name: "Street Runner", price: "Rs. 7,200", was: "Rs. 9,000", sale: "-20%", depth: 30 },
  { id: "headphones", kind: "headphones", name: "Studio Buds", price: "Rs. 5,599", was: "Rs. 7,999", sale: "-30%", depth: 12 },
];

const authData = { showcaseCopy, stats, testimonials, trustBadges, partnerLogos, floatingProducts };
export default authData;
