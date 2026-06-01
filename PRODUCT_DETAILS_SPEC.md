# Product Details Page — Redesign Spec

Target: `src/pages/products/ProductDetails.jsx` (+ `src/components/productDetails/*`). Stack: React 19, Tailwind 4, `motion/react`, `react-icons/fi`. Currency: `Rs.` (match Cart.jsx). Keep: `useApiQuery('/api/products/${id}')`, `addToCart({id, quantity, size})`, `toggleWishlist`/`checkWishlist`, `copyLink` (with textarea fallback), auth gating (`navigate('/signin')`), the Full Details modal markup (unchanged), `<ReviewSection productId={id} modal={false} />`.

## A. Research-backed decisions (Baymard PDP studies, Zara/Nike/ASOS/Amazon)
1. **Thumbnail rail + always-visible arrows + swipe** — Baymard: 50%+ of users miss hover-only controls; touch has no hover. Arrows always visible (desktop 40px, mobile hidden, swipe + dots instead).
2. **Hover zoom-lens on desktop, tap-to-fullscreen hint** — users inspect fabric/texture; Baymard lists insufficient zoom as a top PDP failure.
3. **Image counter + dots** signal more images exist (ASOS/Nike pattern).
4. **No pre-selected size** — pre-selecting causes wrong-size orders (Baymard). Require selection; CTA reads "Select a size" and shakes the size group if clicked without one.
5. **Size guide link next to size label** — Baymard: 67% of apparel sites lack a findable size guide; adjacency is key.
6. **Low-stock urgency only when true (≤5)** — honest scarcity raises conversion; fake urgency erodes trust.
7. **Price block: sale price in red, struck original in gray, "Save Rs. X (Y%)" chip** — Amazon/ASOS: absolute + relative savings both read faster.
8. **Free-shipping progress (Rs. 2000 threshold)** — Amazon/ASOS: threshold messaging lifts AOV; show remaining amount for current qty.
9. **Delivery estimate as a date range** ("Arrives Thu, 20 Nov – Mon, 24 Nov") — Baymard: dates beat "3–5 business days".
10. **Trust row (secure checkout, easy returns, delivery) near CTA** — reassurance at the decision point, not the footer.
11. **Sticky add-to-cart bar on mobile/desktop after primary CTA scrolls off** — Nike/Zara; reduces scroll-back on long pages.
12. **Rating summary links to reviews anchor** (`#reviews`, smooth scroll) — users trust reviews more than copy; one-tap path.
13. **Clear add-to-cart feedback** (button morph + fly-to-cart + toast with "View cart") — Baymard: missing confirmation causes double-adds.

## B. Page anatomy
Page bg `bg-gray-100`. Container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8 pb-28`.

**Desktop (lg, 12-col grid, gap-10):**
1. Breadcrumb: Home › Products › {category.name} › {name} (truncate). FiHome icon on Home.
2. Left `col-span-7`, `lg:sticky lg:top-24`: `Gallery` = vertical thumb rail (w-20, left, max 6 visible, scroll) + main image (aspect-4/5, rounded-3xl) with sale badge TL, wishlist heart + share TR (stacked), arrows L/R, counter BR, "Hover to zoom" hint pill BL (FiZoomIn, fades after first hover).
3. Right `col-span-5`, stacked white cards (`rounded-3xl`):
   - **InfoCard**: category chip (FiTag) + stock pill; H1 name; rating row (stars, "4.3 · 12 reviews" link → #reviews; if 0: "No reviews yet — be the first"); `PriceBlock`; short description (3-line clamp) + "Read full details" (FiMaximize2, opens existing modal).
   - **PurchaseCard**: `SizeSelector` (label "Size: M", "Size guide" link w/ animated ruler opening a small inline popover table S/M/L/XL chest/length cm — static generic table); `QuantityStepper` + `AddToCartButton` (flex-1, h-14) — this row is the IntersectionObserver target; stock message (`StockNotice`); `ShippingProgress`; `DeliveryEstimate`.
   - **StoreCard**: avatar initial (red bg, rounded-2xl), storeName, "Visit store" (FiArrowRight) link `/stores/${slug}`; fallback "DiObral Marketplace".
   - **TrustGrid**: `grid-cols-3` with 3 items: Secure checkout (ShieldSvg), Easy 7-day returns (ReturnsSvg), Fast delivery (TruckSvg).
4. Full width: `DetailsAccordion` row (Description / Shipping & Returns) — description shows full text, also keeps modal button.
5. `#reviews` card: heading + `<ReviewSection productId={id} modal={false} />` (scroll-mt-24).
6. `RelatedCarousel`: horizontal snap scroller (`snap-x`, card w-[46%] sm:w-[30%] lg:w-[23%]), prev/next buttons top-right, "Explore all" link.
7. `StickyCartBar` (fixed bottom).

**Mobile (<lg), single column order:** breadcrumb (1 line, scroll-x) → gallery (full-bleed `-mx-4`, rounded-b-3xl, swipe via `drag="x"`, dots below instead of rail, no lens; tap opens nothing new) → InfoCard → PurchaseCard → TrustGrid (`grid-cols-3`, compact, icons 32px, labels text-[11px]) → StoreCard → accordion → reviews → related → StickyCartBar (always shown once CTA leaves viewport; safe-area `pb-[env(safe-area-inset-bottom)]`). Tap targets ≥44px.

## C. Visual style
- Backgrounds ONLY `bg-white`, `bg-gray-100`, `bg-gray-200` (no slate/rose/emerald tints). Accent: `red-600` (#DC2626), hover `red-700`, soft accents `red-50`/`red-100` allowed only as text/badge fills on white → use `bg-red-600 text-white` or `text-red-600` + `ring-red-200` instead of red bg tints where possible.
- Cards: `bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] p-5 sm:p-7`, no hard borders. Inner wells: `bg-gray-100 rounded-2xl`.
- Chips/buttons: `rounded-2xl`; pills `rounded-full`. Primary CTA `bg-red-600 text-white shadow-lg shadow-red-600/25`.
- Type: H1 `text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900`; price `text-3xl font-black`; labels `text-xs font-semibold text-gray-500 uppercase tracking-wider`.
- Icons (fi): FiHome, FiChevronRight/Left, FiTag, FiStar, FiHeart, FiShare2, FiZoomIn, FiMaximize2, FiShoppingBag, FiCheck, FiPlus, FiMinus, FiTruck, FiShield, FiRotateCcw, FiClock, FiAlertCircle, FiPackage, FiArrowRight, FiCalendar, FiInfo, FiChevronDown, FiX.
- Stock semantic colors: in stock `text-gray-700` w/ red dot pulse when low; out of stock gray. No green backgrounds.

## D. Animation spec (motion/react)
Shared: `const EASE = [0.22, 1, 0.36, 1]`; `const SPRING = { type: "spring", stiffness: 500, damping: 30 }`. `const reduce = useReducedMotion()` — when true: all durations → 0 / opacity-only, no lens, no particles, no fly-to-cart, no number roll (plain swap), sticky bar fades.

1. **Image crossfade**: `AnimatePresence mode="popLayout"` keyed by index; enter `{opacity:0, scale:1.02, x: dir*24}` → `{opacity:1, scale:1, x:0}`, 0.35s EASE; exit opacity 0, 0.2s. Track `dir` (+1/-1).
2. **Zoom lens (desktop, `pointer: fine`)**: on pointermove over main image set CSS vars `--x,--y` (%); overlay a 2.2x scaled copy `transform-origin: var(--x) var(--y)` fading in (0.2s). Lens ring: 120px circle `ring-2 ring-white/80 shadow-xl` following pointer via `useMotionValue` + `useSpring({stiffness:400,damping:40})`. Leave → fade out.
3. **Swipe (mobile)**: `drag="x" dragConstraints={{left:0,right:0}} dragElastic={0.2}`; onDragEnd if `offset.x < -60 || velocity.x < -400` next, mirror for prev.
4. **Thumb active indicator**: `motion.span layoutId="thumb-ring"` absolute `inset-0 rounded-2xl ring-2 ring-red-600` inside active thumb, SPRING. Dots on mobile: active dot `layoutId="dot"` pill w-5.
5. **Size chip select**: selected bg `motion.span layoutId="size-pill"` (bg-gray-900 rounded-2xl) behind label, SPRING; `whileTap={{scale:0.92}}`. Missing-size error: size group `animate={{x:[0,-8,8,-5,5,0]}}` 0.4s + red helper text "Please select a size".
6. **Quantity roll**: number in `overflow-hidden h-6`; `AnimatePresence mode="popLayout" initial={false}` keyed by qty; enter `y: dir*100%`→0, exit `y: -dir*100%`, 0.25s EASE. Buttons disabled at 1 / at stock (opacity-40).
7. **AddToCart state machine** `'idle'|'adding'|'added'|'error'`: click → `adding` (label crossfades to 18px spinner: SVG circle `strokeDasharray` rotating 0.8s linear infinite; button `width` locked). Await `addToCart()` (returns boolean). true → `added`: bg tween red-600→gray-900 0.3s, check icon draws via `motion.path pathLength 0→1` 0.4s EASE, label "Added to cart"; after 1600ms → `idle`. false → `error`: shake + "Try again" 1600ms → idle. Disabled while not idle.
8. **Fly-to-cart**: on success, portal a 56px rounded-2xl clone of current image at main-image rect center; target = `document.querySelector('[data-cart-target]')` rect (worker: add `data-cart-target` to both Navbar cart buttons, lines ~231 and ~294 of `src/components/layout/Navbar.jsx`, the only allowed Navbar change) else `{x: innerWidth-48, y: 28}`. Animate keyframes `x:[0, dx*0.4, dx]`, `y:[0, dy-120, dy]` (arc), `scale:[1,0.8,0.25]`, `opacity:[1,1,0]`, 0.75s, `times:[0,0.45,1]`, ease `[0.5,0,0.75,0]`. Then remove. Also show toast "Added to cart" + "View cart" link to `/cart`.
9. **Heart burst**: on toggle to wishlisted: heart `scale:[1,1.35,0.9,1]` 0.45s; 8 particles (6px red/gray-900 circles) radiating at 45° steps, `x/y` to 22px, `scale 1→0`, `opacity 1→0`, 0.5s EASE; plus ring `scale 0.6→1.6 opacity 0.6→0`. Un-wishlist: scale 0.85→1 only.
10. **Price**: on mount count up displayPrice from 0.7×price to value 0.6s via `animate(motionValue, …)` rendering `toFixed(2)`. Sale badge: `animate={{scale:[1,1.06,1]}}` repeat 2, 0.8s, delay 0.6s, then rest.
11. **Sticky bar**: IntersectionObserver on CTA row (`rootMargin: "0px 0px -40px 0px"`); `show = !entry.isIntersecting && entry.boundingClientRect.top < 0`. `AnimatePresence` → `y:"110%"→0`, SPRING (stiffness 400, damping 36). Content: 48px thumb, name (truncate), price, size chip summary, compact AddToCartButton (same state machine instance via shared handler). `z-40`, `bg-white/95 backdrop-blur rounded-t-3xl shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.2)]`.
12. **Stagger entrance**: right-column cards in parent `variants` `staggerChildren:0.08`; child `{opacity:0,y:16}`→`{opacity:1,y:0}` 0.45s EASE. Below-fold sections `whileInView` once, amount 0.2.
13. **Shipping bar**: `motion.div` width `0%`→`pct%` 0.8s EASE on view; animates on qty change (0.4s). At 100% swap icon to FiCheck with SPRING scale-in.

## E. Custom inline SVGs (`src/components/productDetails/svgs.jsx`, each `({className, size=40})`, stroke `currentColor` red-600 + gray-400, strokeWidth 1.75, round caps)
- **RulerSvg** (size guide, 20px inline): tape-measure rectangle with tick marks; on hover the tape strip `scaleX 0.6→1` from left (0.4s), ticks stagger opacity.
- **TruckSvg**: truck body + cab + 2 wheels; wheels rotate infinite 1s linear; 3 speed lines left translate x 0→-6 fade loop 0.9s; road dash `strokeDashoffset` loop.
- **ShieldSvg**: shield outline draws (`pathLength 0→1` 0.8s on view), then check mark draws 0.4s, then soft glow pulse (opacity loop 2.4s).
- **ReturnsSvg**: circular arrow arc (270°) with arrowhead; whole group rotates -360° every 3s with ease-in-out, pausing 1s (`repeatDelay`).
- **HangerSvg** (out of stock, 96px): hanger hook + triangle bar; swings `rotate:[-6,6,-6]` 3s ease-in-out infinite, origin at hook top; small sad face (two dots + downward arc) on hanger body.
All: under reduced motion render static final state.

## F. States
- **Loading**: update `ProductDetailSkeleton` to match new layout: gray-100 page, white rounded-3xl cards, lg 7/5 grid, vertical thumb rail placeholders, chip row (5 × w-12 h-12 rounded-2xl), h-14 CTA, 3-col trust row. Replace per-element opacity loops with one shimmer: `bg-gray-200` blocks + overlay gradient `via-white/60` animating `x: -100%→100%` 1.4s infinite (static under reduced motion).
- **Error / 404**: centered white card rounded-3xl; `status === 404` → `<NotFound size={220} />` "Product not found" / "This item may have been removed or sold out." Else `<ErrorState size={220} />` "We couldn't load this product". Buttons: Go back (outline, FiArrowLeft), Try again (red, FiRefreshCw, `window.location.reload()`), Browse products link. Imports: `import { NotFound, ErrorState } from "../../components/illustrations/..."` — these files may not exist yet; confirm path/exports before importing, else create per contract (named exports, `{className,size}`).
- **Out of stock (stock ≤ 0)**: CTA disabled `bg-gray-200 text-gray-500 cursor-not-allowed` label "Out of stock"; stepper disabled; HangerSvg + "Sold out for now" in PurchaseCard well; heart button gets microcopy "Save to wishlist to find it later"; sticky bar shows disabled CTA; `handleAddToCart` guards `stock<=0`.
- **Low stock (1–5)**: `StockNotice` red text with pulsing dot: "Only {n} left — order soon". Normal: "In stock" with gray dot. Qty capped at stock.
- **No sale**: price gray-900, no strike/save chip/badge.
- **Single image**: hide rail, arrows, dots, counter; keep lens.
- **No sizes** (`!size?.length`): hide SizeSelector, CTA enabled without size, `size: undefined`. If exactly 1 size, auto-select it (only case of preselect).
- **No description**: hide snippet and accordion description panel.
- **Unauthenticated**: CTA/heart click → `navigate('/signin')` (no animation).

## G. Components (`src/components/productDetails/`)
- `Gallery({ images, name, hasSale, salePct, wishlisted, onToggleWishlist, onShare, copied })` — owns index/dir/lens.
- `WishlistButton({ active, onClick })` — burst.
- `PriceBlock({ price, displayPrice, hasSale, salePct, savings })`.
- `SizeSelector({ sizes, value, onChange, error })` + `SizeGuidePopover()`.
- `QuantityStepper({ value, onChange, max, disabled })`.
- `AddToCartButton({ state, disabled, onClick, label, compact })`.
- `useAddToCart({ product, quantity, size, imageRef })` → `{ state, run }` (auth gate, size validation, fly, toast).
- `FlyToCart` (portal) — imperative `flyToCart(imgSrc, fromRect)`.
- `StockNotice({ stock })`, `ShippingProgress({ subtotal })` (threshold 2000, else "Rs. 200 shipping"; copy: "Add Rs. X more for FREE delivery" / "You've unlocked FREE delivery"), `DeliveryEstimate()` (today+3 → today+6, skip none, `toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})`).
- `StoreCard({ store })`, `TrustGrid()`, `DetailsAccordion({ description })`, `RelatedCarousel({ items })`, `StickyCartBar({ visible, product, displayPrice, size, state, onAdd, disabled })`, `svgs.jsx`.
- Keep `buildImageUrl`, `StarRating` (support half star via clip), modal, copied toast in page file.

## H. Worker checklist
- [ ] Remove `selectedSize` auto-select effect (except 1-size case).
- [ ] CTA disabled + guarded when `stock <= 0`; qty max = stock.
- [ ] TrustGrid has 3 items for `grid-cols-3`.
- [ ] Arrows visible without hover; swipe works on touch.
- [ ] Add-to-cart state machine + fly + toast; uses `addToCart` boolean.
- [ ] Wishlist burst; auth gate intact; `checkWishlist` effect intact.
- [ ] Sticky bar via IntersectionObserver, cleanup on unmount.
- [ ] `#reviews` anchor + smooth scroll; ReviewSection props unchanged.
- [ ] Full details modal unchanged; copy-link fallback unchanged.
- [ ] Currency `Rs.` everywhere (replace `$`).
- [ ] Only white/gray-100/gray-200 backgrounds; red accent.
- [ ] `useReducedMotion` respected everywhere.
- [ ] Skeleton updated; error states use illustrations.
- [ ] Test widths 360, 768, 1280; no horizontal scroll; `npm run build` passes.
