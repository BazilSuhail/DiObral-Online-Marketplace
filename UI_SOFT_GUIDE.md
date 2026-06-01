# Soft UI Guide (all pages except Home)

Goal: cool, professional "soft UI" ecommerce look. Large radii, soft diffuse shadows, subtle inner highlights, gentle borders. No harsh black borders, no black buttons.

## Hard rules
- **Do NOT touch:** `src/pages/home/Home.jsx`, `src/components/homePage/*`, Navbar, Footer, and every modal (`CartModal`, `SearchModal`, `PaymentModal`, `PaymentSuccessModal`, `AssistantDock` + `src/components/assistant/*`). Do not edit `src/components/illustrations/*` (owned by another team) or `src/components/ui/*` / `src/index.css` (design-system owner).
- **Do NOT change layouts:** keep grid/flex structure, column counts, element order, routing and logic. Restyle classes, add icons, swap empty states only.
- Do not change default props of `ui/*` components (Home relies on them). Use the opt-in soft variants below.
- No new dependencies. Icons come from `react-icons` (already installed).

## Palette
| Role | Tailwind | Notes |
|---|---|---|
| Page background | `bg-gray-100` (#F3F4F6) | body is already gray-100; use `soft-page` on page root |
| Surfaces / cards | `bg-white` | via `soft-card` |
| Secondary surfaces, insets | `bg-gray-100`, `bg-gray-200` | `soft-panel`, `soft-card-inset` |
| Primary accent | `red-600` (hover `red-700`) | buttons, active chips, prices on sale, links |
| Strong accent | `red-500`, `red-700` | sale badges, icons on hover |
| Tints | `red-50`, `red-100`, `red-200` | icon tiles, secondary buttons, focus rings, soft highlights |
| Text | `gray-900` headings, `gray-600` body, `gray-400/500` meta | never pure black |
| Borders | `ring-1 ring-gray-200/60`, `border-gray-200` | never `border-black` / `border-2 border-gray-300` |

Backgrounds are ONLY white, gray-100, gray-200 (red tints only inside small elements: tiles, chips, badges, buttons). Status green/amber only in `soft-badge-success` / `soft-badge-warning`.

## Utility classes (in `src/index.css`, `@layer components`, so normal Tailwind utilities override them)
| Class | Use |
|---|---|
| `soft-page` | page root wrapper: gray-100 + min-h-screen |
| `soft-card` | white card, radius 1.25rem, inner highlight, faint ring, `0 8px 30px rgba(17,24,39,.06)` shadow. Add `rounded-3xl` for bigger radius, `p-5/p-6` padding yourself |
| `soft-card-hover` | add to `soft-card` for lift + deeper shadow on hover (product/store cards) |
| `soft-card-inset` | gray-100 inset well (summary rows, quantity steppers, nested info) |
| `soft-panel` | gray-100 panel with faint ring (sidebars, filter blocks) |
| `soft-input` (+ `soft-input-error`) | text inputs, selects, textareas (add `h-auto py-3` for textarea) |
| `soft-btn` + `soft-btn-primary` | main CTA: red-600, soft red shadow |
| `soft-btn` + `soft-btn-secondary` | red-50 tinted button |
| `soft-btn` + `soft-btn-ghost` | white button with gentle ring |
| `soft-btn-sm` / `soft-btn-lg` | size modifiers |
| `soft-icon-btn` | round white icon button (wishlist heart, remove, share) |
| `soft-chip` / `soft-chip-active` | filters, categories, size pickers, tabs |
| `soft-icon-tile` (+ `-sm`, `-lg`, `-gray`) | red-50 rounded icon container for headings, stats, list rows |
| `soft-divider` | 1px faded divider (`<div className="soft-divider my-4" />`) |
| `soft-badge` + `soft-badge-sale / -danger / -neutral / -success / -warning` | pills |
| `soft-section-title` | flex heading with icon gap |
| `soft-skeleton` | shimmering loading block (`soft-skeleton h-4 w-2/3`) |

Theme tokens (usable as Tailwind utilities): `shadow-soft-xs`, `shadow-soft-sm`, `shadow-soft`, `shadow-soft-lg`, `shadow-soft-red`, `shadow-soft-red-lg`, `shadow-soft-inset`, `rounded-soft`, `rounded-soft-lg`.

## UI component variants (opt-in, backward compatible)
```jsx
<Button variant="soft">Checkout</Button>            // soft-btn-primary
<Button variant="softSecondary" size="sm" />       // red-50 tint
<Button variant="softGhost" size="lg" />           // white ghost
<Badge variant="sale|danger|neutral|success|warning">-20%</Badge>
<Card soft hover className="p-6">...</Card>
<Input variant="soft" placeholder="Search" />
<ProfileInput soft icon={FiMail} label="Email" error={err} />
```

## Icons (react-icons, mostly Feather `fi`)
Use an icon in: every section heading (inside `soft-icon-tile-sm`), stat tiles, buttons (leading icon, `h-4 w-4`), chips, list rows, badges (`h-3 w-3`).
| Purpose | Icon |
|---|---|
| Cart / add to cart | `FiShoppingCart`, `FiShoppingBag` |
| Wishlist | `FiHeart` |
| Orders / packages | `FiPackage`, `FiBox` |
| Shipping / delivery | `FiTruck`, `FiMapPin` |
| Payment / totals | `FiCreditCard`, `FiDollarSign`, `FiPercent` (discount), `FiTag` (price/sale) |
| Checkout / secure | `FiLock`, `FiShield`, `FiCheckCircle` |
| Status | `FiClock` (pending), `FiCheckCircle` (delivered), `FiXCircle` (cancelled), `FiRefreshCw` (processing), `FiAlertCircle` (error) |
| Profile | `FiUser`, `FiMail`, `FiPhone`, `FiHome`, `FiEdit2`, `FiSave`, `FiLogOut`, `FiSettings`, `FiKey` |
| Stores | `FiShoppingBag`, `FiUsers` (followers), `FiStar`, `FiUserPlus` / `FiUserCheck` (follow) |
| Products / bundles | `FiGrid`, `FiLayers` (bundles), `FiGift`, `FiStar` (rating), `FiFilter`, `FiSliders`, `FiSearch` |
| Navigation | `FiArrowLeft`, `FiArrowRight`, `FiChevronRight`, `FiExternalLink` |
| Actions | `FiPlus`, `FiMinus`, `FiTrash2`, `FiShare2`, `FiEye`, `FiX` |
| Info | `FiInfo`, `FiHelpCircle`, `FiMessageSquare` (reviews), `FiCalendar` |

```jsx
import { FiPackage } from "react-icons/fi"
<h2 className="soft-section-title"><span className="soft-icon-tile soft-icon-tile-sm"><FiPackage className="h-4 w-4" /></span>Your orders</h2>
```
Stat tile:
```jsx
<div className="soft-card p-5 flex items-center gap-4">
  <span className="soft-icon-tile"><FiTruck className="h-5 w-5" /></span>
  <div><p className="text-xs text-gray-500">In transit</p><p className="text-xl font-bold text-gray-900">3</p></div>
</div>
```

## Illustrations contract
Components live in `src/components/illustrations/` (another team builds them). Import via the folder index, adjusting the relative path:
```jsx
import { EmptyCart } from "../../components/illustrations"
```
Each takes `{ className, size }` (size default 220, px). Named exports:
`EmptyCart, EmptyWishlist, NoOrders, NoProducts, NoBundles, NoReviews, NoStores, NoFollowedStores, NotFound, ErrorState, SignInRequired, OrderSuccess`.

### Recommended empty-state pattern
```jsx
<div className="soft-card mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
  <EmptyCart size={200} className="mb-6" />
  <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
  <p className="mt-2 text-sm text-gray-500">Discover something you love and add it here.</p>
  <Link to="/products" className="soft-btn soft-btn-primary mt-6"><FiShoppingBag className="h-4 w-4" />Start shopping</Link>
</div>
```
Use for: empty lists, not-found, errors (`ErrorState` + retry `soft-btn-ghost` with `FiRefreshCw`), logged-out gates (`SignInRequired` + sign-in button with `FiLogIn`).
