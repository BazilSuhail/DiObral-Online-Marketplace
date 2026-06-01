# Obi Assistant v3 Spec (soft UI + red)

Scope: `src/components/assistant/*`, `src/lib/assistantActions.js`. No backend change: `POST /assistant {message,history,context}` returns `{reply,speech?,products[],suggestions[],actions[]}`, no streaming. Do not edit `src/index.css`, `ui/*` or `illustrations/*`; use the existing `soft-*` classes and `shadow-soft-*` tokens. No new deps. Backgrounds: only `white`, `gray-100`, `gray-200` (red tints only on small chips, tiles and badges). Icons: `react-icons/fi`.

## 1. Audit and fixes
| Problem | Fix |
|---|---|
| `input` state lives in Dock, so every keystroke re-renders MessageList and every row | `React.memo` MessageList plus a memoized `MessageRow`; Dock passes only stable callbacks |
| `chat.send` depends on `messages`/`loading` and is recreated each turn | Read `messagesRef`/`loadingRef` inside the callback; every returned fn is `useCallback` with stable deps |
| Launcher orb runs a 60fps rAF on every page, forever | `quality="low"`: 30fps cap, 48 particles, pauses after 6s idle (resumes on state change or hover) |
| Each particle allocates an `hsla()` string and sets `fillStyle` | 6 depth buckets with precomputed rgba strings, one path per bucket |
| Radial gradient rebuilt every frame | Cache it on an offscreen canvas; rebuild only when the state target changes |
| `REDUCED` is read once at module load | `useReducedMotion()` from motion/react, passed down as a prop |
| No pause when panel offscreen or closed | `IntersectionObserver` plus `document.hidden` plus `active` prop, all stop rAF |
| New AudioContext on every `listen()`, and a second rAF loop | Reuse one AudioContext (resume/suspend); sample the level at 30fps; `smoothingTimeConstant=0.6` |
| Auto-scroll fires even when the user has scrolled up | Stick to bottom only if within 80px; otherwise show a "Jump to latest" pill |
| All messages render | Render the last 60, with a "Show earlier" button that adds 40 more |
| `runActions` still runs after abort or reset | Check `controller.signal.aborted` before `runActions` and before each `push` |
| `errorFlash` timeout not cleared on unmount | Store it in a ref and clear it in cleanup |
| `role=log aria-live` on the whole list re-announces, and the typewriter would spam it | List keeps `role="log"` with `aria-live="off"`; a separate sr-only `aria-live="polite"` node announces each final reply once |
| Focus is not moved on open (mobile) and chips have no focus ring | Focus the composer (or the orb button in voice mode) on open; `focus-visible:ring-4 ring-red-100` on every control |
| Hardcoded off-theme colors: `ACCENT` sky/gray-900, mic `bg-sky-50`, stop `bg-gray-900`, size pill `bg-gray-900`, bubble `bg-gray-50` | Use the theme map in section 2 |

## 2. Theme map
Orb (RGB lerp per frame, no hue math; back particles mix 40% toward `#D1D5DB`):
| State | core | edge | glow rgba | extra |
|---|---|---|---|---|
| idle | `#DC2626` | `#F87171` | `220,38,38,.16` | breathe 3% |
| listening | `#EF4444` | `#FDA4AF` | `239,68,68,.28` | rim spikes `#DC2626` @ .5 |
| thinking | `#991B1B` | `#9CA3AF` | `153,27,27,.12` | graphite comet ring |
| speaking | `#E11D48` | `#FB7185` | `225,29,72,.30` | word ripples |
| error | `#7F1D1D` | `#6B7280` | `127,29,29,.10` | jitter .06, gravity .25 |

State accent bar (3px, top of panel): idle `#DC2626`, listening `#EF4444`, thinking is a shimmer gradient `#E5E7EB→#9CA3AF→#E5E7EB`, speaking `#E11D48`, error `#7F1D1D`.

- **Panel:** `soft-card rounded-[1.75rem] shadow-soft-lg bg-white`. Header is white with a `soft-divider` below. The body (message area) is `bg-gray-100`.
- **Assistant bubble:** `bg-white rounded-2xl rounded-bl-md shadow-soft-xs ring-1 ring-gray-200/60 text-gray-700`. Error bubble: `bg-white ring-red-200 text-red-700`, plus a `FiAlertCircle` icon and a Retry button.
- **User bubble:** `bg-red-600 text-white rounded-2xl rounded-br-md shadow-soft-red`.
- **Notes:** `soft-badge soft-badge-success`, or `soft-badge-danger` on failure.
- **Chips:** `soft-chip` with a leading red icon (`text-red-500`). The route-context chip uses `soft-btn-secondary soft-btn-sm`.
- **Composer:** a well (`bg-gray-100 rounded-2xl shadow-soft-inset`) that becomes white with `ring-4 ring-red-100` on focus. Send button: `soft-btn-primary` circle. Stop button: `bg-gray-200 text-red-700`. Mic is `soft-icon-btn` when idle and `bg-red-50 text-red-600 ring-red-200` while listening.
- **Launcher:** a white pill (`soft-card shadow-soft-lg`) with the orb in a `bg-gray-100` circle. Unread dot: `bg-red-600 ring-2 ring-white`. Peek bubble: `soft-card`.
- **ProductCard:** `soft-card soft-card-hover rounded-2xl`; image well `bg-gray-100`; size chips `soft-chip`, with `soft-chip-active` when selected; Add button `soft-btn-primary soft-btn-sm`; sale badge `soft-badge-sale`.
- **ConfirmCard:** `soft-card-inset p-3`, a `soft-icon-tile-sm` holding the bag icon, `soft-btn-primary` and `soft-btn-ghost` buttons.

## 3. Client-side features (10)
1. **Route-aware quick chips.** Shown above the composer when the input is empty. The chips depend on the route:
   - `/products/:id`: "Is this in my size?", "Similar items", "Add to cart"
   - `/cart`: "Apply best savings", "Checkout", "Anything I forgot?"
   - `/orders*`: "Where is my order?", "Return an item"
   - `/productlist*`: "Filter under 3000", "Best rated here"
   - `/wishlist`: "Move my wishlist to cart"
   - otherwise: the existing STARTERS

   Each chip just calls `send(text)`; the server already receives `context.path`.
2. **Thinking stages.** These are timed client-side while `loading`: 0ms "Reading your message…", 700ms "Searching the catalog…", 1800ms "Checking sizes & prices…", 4000ms "Almost there…". The text shows in the header status and under the shimmer dots. Exposed as `chat.stage`.
3. **Typewriter reveal.** Only the newest assistant reply is revealed, 3 words per 30ms tick. Products, suggestions and the confirm card fade in after the reveal finishes. Clicking the bubble or sending a new message completes it instantly. Off for reduced motion, history loads and voice mode.
4. **Message actions.** On hover (or always, on touch), assistant rows show Copy (clipboard, then a "Copied" check for 1.5s), Regenerate (last reply only: resends the previous user text) and thumbs up/down. Feedback is stored as `m.feedback = 1 | -1`, client-side only. Error rows show Retry.
5. **Slash commands.** Typing `/` opens a menu in the Composer; ↑/↓/Enter/Tab select and Esc closes. The menu filters by prefix. Commands:
   - `/cart`, `/orders`, `/wishlist`, `/deals` (navigate to `/productlist/all?sale=true`): handled locally with `goTo`, no server call
   - `/clear`: new conversation
   - `/voice`: switch to voice mode
   - `/help`: posts a local assistant message listing the commands
6. **Compare tray.** Each ProductCard gets a "Compare" toggle (max 3). A tray slides up above the composer showing thumbnails. "Compare" opens an in-panel table (price, sale %, rating, sizes, stock). "Ask Obi" sends `Compare: A, B, C`.
7. **Persistent history.** Moves from sessionStorage to localStorage key `diobral-assistant-v3`, `{savedAt, messages: last 60}`, with a 7-day TTL. It is migrated from the v2 sessionStorage key once. If the last message is older than 2h, opening shows a "Continue where you left off?" card with two buttons, Continue and Start fresh. The header menu has "Clear history", which asks for confirmation inline.
8. **Recent searches.** The last 5 distinct user texts, stored in localStorage `diobral-assistant-recent`, appear as `FiClock` chips in the welcome state. Each has an × to remove it.
9. **Shortcut and unread state.**
   - Ctrl/Cmd+K toggles the panel (ignored when focus is in an input outside the panel). The launcher tooltip shows the shortcut.
   - If a reply arrives while the panel is closed, the launcher gets an unread dot and the peek bubble shows.
   - Esc minimizes the panel and focus returns to the launcher.
10. **Offline and voice upgrades.**
    - **Offline:** `navigator.onLine` plus online/offline events. Offline shows an inline `ErrorState size={120}` card with the text "You're offline" and the composer disabled. A failed send gets a Retry button.
    - **Voice auto-stop:** after 1.6s of level below 0.04 once speech has been heard.
    - **Voice language:** a toggle with en-US and ur-PK options; the choice persists.
    - **Mute replies:** a toggle so voice mode can run listen-only.
    - **Waveform:** a 5-bar live waveform under the voice orb.

## 4. Animation (motion/react)
For reduced motion (`useReducedMotion()`), use opacity-only fades of 120ms, no typewriter, a still orb frame and no pulse.

- **Launcher entrance:** delay 1.2s after mount; `scale .6→1, y 16→0`, spring `{stiffness 420, damping 26}`.
- **Launcher idle pulse:** a ring `scale 1→1.35, opacity .35→0`, lasting 2.4s and repeating every 8s, and only until the first open.
- **Panel (desktop):** `opacity 0, scale .94, y 16` → 1, spring `{stiffness 380, damping 30}`, `transformOrigin: bottom right`.
- **Panel (mobile):** sheet `y 100%→0` with the same spring.
- **Bubble enter:** user bubbles `x 12→0`, assistant bubbles `y 8→0`, opacity 0→1, 180ms easeOut. Use `layout="position"` on rows only.
- **Typewriter:** the caret is a 2×14px `bg-red-500` block that blinks with opacity [1,0] over .8s.
- **Chips:** parent `staggerChildren: .04`; each child `y 6→0, opacity 0→1`.
- **Thinking indicator:** 3 dots `y [0,-4,0]` (.9s, stagger .15) plus a `soft-skeleton` line 60% wide under the stage text.
- **Orb state change:** params ease at `dt*5` inside the canvas (already), with colors lerped the same way. The canvas wrapper does `scale [1, 1.06, 1]` over 300ms on each state change.
- **Compare tray:** `y 100%→0`.
- **Slash menu:** `opacity, y 4→0`, 120ms.
- **Jump pill:** scale .9→1.

## 5. OrbCanvas redesign
- Props are in section 6.
- **Particle count:**
  - `quality="low"` or size < 90: 48 particles
  - mobile (`innerWidth < 640` or `hardwareConcurrency ≤ 4`): 110
  - otherwise: 160
- **DPR cap:** `min(devicePixelRatio, size < 90 ? 2 : 1.5)`.
- **Frame rate:** 30fps for low quality via a timestamp accumulator; 60fps otherwise.
- **Pause:** pause when `!active`, `document.hidden`, or the canvas is not intersecting. Resume with `last = now` so there is no time jump.
- **Rendering:**
  - Colors per section 2, as `[r,g,b]` arrays lerped toward the target.
  - 6 depth buckets per frame, each holding one `beginPath` with all of its `arc`s and one `fill`.
  - Glow is drawn from a cached offscreen canvas scaled by `R`.
  - Comet tails only when `quality !== "low"`.
- **Thinking state:** the ring rotates 2.6 rad/s with a 0.07 tail lag; ring particles are `edge` colored and the core particles are `core` colored.
- **Reduced motion:** redraw a single frame on each state change.

## 6. Interfaces (frozen between workers)
```js
// Worker 1 provides:
<OrbCanvas state="idle|listening|thinking|speaking|error" size={n} levelRef kickRef active={bool} quality="low|high" reducedMotion={bool} className />
useVoice({ onInterim, onFinal, onSilence }) => { state, levelRef, kickRef, listen, stopListening, speak, cancelSpeech, canListen, canSpeak, lang, setLang, muted, setMuted }
// listen(): unchanged call; auto-stop on silence calls onFinal(heard) or onSilence("no-speech").
// speak() when muted: calls onDone immediately.
<Composer value onChange onSubmit onMic onStop listening loading canListen autoFocus disabled={bool} placeholder commands={[{ cmd:"/cart", label, icon, run:()=>void }]} />
<ConfirmCard onConfirm onDismiss? />
<ProductCard product onOpen onAdd onCompare?={(p)=>void} compared?={bool} />
// Worker 2 provides:
useAssistantChat({ onReply, onNavigate }) => { messages, loading, stage, send(text), retry(msgId), regenerate(), stop, addProduct, openProduct, goTo, reset, greet, setFeedback(id, 1|-1|0), compare:{ items, toggle(p), clear }, recent, removeRecent(text), lastActiveAt }
<MessageList messages loading stage revealId onRevealDone onSend onRetry onRegenerate onFeedback onOpenProduct onAddProduct onGoTo onCompare compareIds compact />
```

## 7. Work split (no shared files)
**Worker 1:** OrbCanvas.jsx, useVoice.js, Composer.jsx, ConfirmCard.jsx, ProductCard.jsx
1. OrbCanvas: palette, buckets, glow cache, quality/DPR/fps, IntersectionObserver pause, `reducedMotion` prop.
2. useVoice: shared AudioContext, 30fps level, silence auto-stop, `lang` (localStorage `diobral-assistant-lang`), `muted`.
3. Composer: soft restyle, `disabled`, slash menu (listbox `role="listbox"`, `aria-activedescendant`), `commands` prop.
4. ProductCard: soft restyle, `onCompare`/`compared` (`FiLayers` toggle, `aria-pressed`), arrow-key radio group.
5. ConfirmCard: soft restyle, `onDismiss`.

**Worker 2:** AssistantDock.jsx, MessageList.jsx, useAssistantChat.js, assistantActions.js
1. useAssistantChat: refs for stable `send`, abort guards, stages timer, v3 localStorage with migration and TTL, retry/regenerate/feedback, compare state, recent searches.
2. assistantActions: accept `signal` in deps and skip remaining actions if aborted; return `{type:"navigate", route}` so the Dock can show "Opened Cart" notes.
3. MessageList: memo rows, last-60 window, stick-to-bottom plus jump pill, typewriter (`revealId`), action bar, sr-only live region, shimmer stage, stagger chips, compare table and tray, offline `ErrorState`.
4. AssistantDock: theme, launcher entrance/pulse/unread dot, Cmd/Ctrl+K, route chips, slash command list, continue-banner, voice waveform + lang/mute toggles in a header menu (`FiMoreHorizontal`), focus management.

Until Worker 1 lands, Worker 2 may pass the new props; the old components ignore unknown props. Both workers: run `npm run lint` and `npm run build` before handing off.
