# DiObral -> Expo / React Native: Port Map

Source: Vite + React 19 + react-router 7 + Tailwind 4 + zustand + TanStack Query + Stripe + motion. ~70 source files, 17 routes, 36 API endpoints. Generated from a 15-agent read-only exploration.

## 1. Screens (web route -> Expo Router)

| Web route | Expo Router | Notes |
|---|---|---|
| `/` | `(tabs)/index` | Home: slim native version (hero, partners marquee, featured from `/api/home`). Drop Lenis, tilt, hover cards, fake reviews, dead contact form |
| `/productlist/:urlCategory?` | `(tabs)/products` (`?category`) | Filter sheet, infinite scroll, server-side search |
| `/products/:id` | `products/[id]` | Gallery swipe, size picker, sticky Add-to-Cart bar, reviews, related |
| `/bundles`, `/bundles/:id` | `bundles/index`, `bundles/[id]` | Bundle = one cart line (`bundleId`) |
| `/stores`, `/stores/:slug` | `stores/index`, `stores/[slug]` | Follow button shared by both |
| `/cart` | `(tabs)/cart` | Replaces CartModal too |
| `/checkout` | `checkout` (modal) | Prefill from `/auth/profile` |
| `/orders-tracking`, `/orders/:id` | `orders/index`, `orders/[id]` | `justPlaced` becomes route params + nav reset |
| `/wishlist` | `(tabs)/wishlist` or stack | Products + followed stores |
| `/profile` | `(tabs)/profile` | |
| `/signin`, `/signup` | `(auth)/` | Signup is a 4-step wizard |
| `/about` | `about` | Static; footer content moves here |
| `/search` | redirect | Search = modal route |
| (none) | `+not-found` | web app has no 404 |

Tabs: Home, Catalog, Cart, Wishlist, Profile. Navbar becomes tab bar + headers, categories become chips. The AI assistant is a global overlay in root `_layout` (hidden on auth screens). Web has **no router-level auth guards**: add one.

## 2. Data layer

- One axios instance. Base URL `VITE_API_BASE_URL` (fallback `http://localhost:3001`) -> `EXPO_PUBLIC_API_BASE_URL`. Device needs LAN IP; Android emulator `10.0.2.2`.
- Bearer token interceptor; 401 -> logout; no refresh flow.
- **Keep API paths exactly**: some are `/api/*` (products, stores, bundles list, home), others are not (`/auth`, `/cart`, `/orders`, `/wishlist`, `/reviews`, `/categories`, `/bundles/public/:id`, `/checkout`, `/coupons/validate`, `/payment/verify`, `/store-reviews`, `/assistant`).
- Cart response may be `{items}` or `{cart:{items}}`: accept both.
- Stores: `authStore` (persisted, `diobral-auth-storage`), `cartStore` (server cart, local edits until `saveCart`), `wishlistStore` (id map). All port as-is except persistence.
- Token -> `expo-secure-store`; wait for hydration before first call; `atob` -> `jwt-decode`; remove direct `localStorage` reads in `client.js`/`logout`.
- React Query: staleTime 5 min, retry 1. Wire `focusManager` (AppState) + `onlineManager` (NetInfo). Numbered pagination -> `useInfiniteQuery`.
- Shared `buildImageUrl` (`API_BASE_URL/uploads/<img>`, `http*` passthrough, placeholder): currently copy-pasted in ~8 files. Make one helper + bundled placeholder.

## 3. Stack to install

expo-router, NativeWind v4, react-native-reanimated, gesture-handler, `@gorhom/bottom-sheet`, expo-image, `@expo/vector-icons` (Feather maps react-icons/fi), expo-linear-gradient, expo-blur, react-native-svg, `@shopify/react-native-skia` (orb), lottie (truck loader), expo-secure-store, async-storage, expo-clipboard, `@stripe/stripe-react-native`, `expo-speech`, `expo-speech-recognition`, `@expo-google-fonts/plus-jakarta-sans`.
**Needs a dev build (not Expo Go):** Stripe, speech recognition.

## 4. Design tokens (no token layer on web; stock Tailwind classes)

Font Plus Jakarta Sans. bg `#F6F7F9`, surface `#FFF`, primary red-600 `#DC2626` (pressed `#B91C1C`), tints red-50/100/200, accent rose-600 `#E11D48`, text gray-900/600/500/400, border gray-200/100/300, success green-600, warning amber-400. Radius mostly 12 (xl) and 16 (2xl); shadows sm-xl. Primitives: Button (6 variants, 3 sizes), Badge, Card, Input, ProfileInput, FadeIn, ServiceCard. Rewrite when porting: `hover:` (272), responsive prefixes (534), CSS grid (220), backdrop-blur, gradients (104), `cn`/`statusBadge` (class strings).

## 5. Hard parts, ranked

1. **Stripe**: web makes one PaymentIntent per store and confirms them in a loop via legacy CardElement. PaymentSheet takes one secret. Preferred: backend creates one intent per group; otherwise keep a `CardField` + loop.
2. **AI assistant ("Obi")**: chat logic is easy (plain `POST /assistant`, declarative actions). Voice moderate-hard, canvas orb hard (Skia; a simplified orb is fine). Server routes like `/products/:id` need a map to app screens. ~3-5 dev-days.
3. **Home page**: decorative web effects; rebuild slim.
4. Filter sheet, gallery, bottom sheets: moderate.

## 6. Bugs / issues to fix, not port

- `LoginPage.jsx:55-56` hardcodes a real-looking email + password as default form state. Remove (and consider rotating that password if real).
- `OrderDetail.jsx:97` `_` vs `_i`: ReferenceError on every order with items.
- OrderDetail hardcodes shipping Rs. 200 (checkout: free >= 2000).
- Add-to-cart not disabled at stock 0 (product); bundle out-of-stock check is dead code.
- Cart edits local until "Save Cart"; CartModal has no save; Cart mount refetch wipes edits; checkout charges the server cart.
- Payment loop: partial failure leaves earlier stores charged; closing PaymentModal leaves pending orders and a full cart (duplicates on retry).
- Coupon tried on every store, discounts summed; client total may differ from server.
- Mobile product filters broken on web (no panel); price slider has only a min thumb and hardcoded 1000-3200.
- SearchModal filters a single default page client-side. Use server `search`.
- Review star filter only filters the current page; stats fetched via `limit=1000`; helpful vote not persisted.
- Reviews/bundle/store reviews fine; store detail returns null if not found; store bundle cards not clickable.
- Mixed currency (`$`, `Rs.`, IDR in `utils.js`). Pick one; check Hermes `Intl` id-ID.
- Dead/placeholder: footer newsletter + links, contact form, `VITE_API_BASE_URL2`, `routeMeta` SEO meta, hardcoded fake reviews, "test payment" banner and card hint.
- Hotlinked gallery images on home from third-party sites.

## 7. Suggested build order

1. Expo scaffold + NativeWind + theme tokens + router skeleton + auth guard
2. API client, secure token, authStore, React Query, `buildImageUrl`
3. Auth screens, tabs, shared ProductCard/StarRating/Skeleton
4. Products list/detail, wishlist, stores, bundles
5. Cart -> checkout -> Stripe -> orders (decide Stripe backend approach first)
6. Reviews, profile, home, about
7. Assistant (chat first, then voice, then orb)

## 8. Open decisions

- Stripe: one intent per group (backend change) vs per-store loop?
- Styling: NativeWind (recommended; keeps ~500 class strings) vs StyleSheet?
- Is there a guest browse mode, or require login for cart (web requires it)?
- Single currency/locale?
