# Store frontend: Figma "FINAL FLOW" plan

Frontend only. Nothing under the backend boundary changes.

## Backend boundary (read-only)

- `src/app/api/**`, `src/proxy.ts`, `supabase/**`
- `src/lib/{auth,orders,teams,submissions,invoice,mock-finance}.ts`, `src/lib/supabase/**`
- `src/lib/store/{catalog-server,cart-server,product-assets}.ts`, `src/lib/catalog.ts`
- `src/app/(store)/cart-actions.ts` (server actions)
- Server pages may be *recomposed* (which component renders the data) but keep calling the
  same loaders (`getActiveStoreProducts`, `getActiveStoreVendors`) and the same cart actions.

## Figma nodes

| Node | Use |
|---|---|
| 203:8202 | Homescreen. Built from 203:6101/7237; spacing re-measured against the frame (no top bar, feed 125px in), plus the About sheet |
| 203:8349 | About ("How it works") sheet content |
| 2:68562 | **Loading Screen: node does not exist in the file** (MCP returns "not found"). Not built. Existing 3s "Processing payment" state kept |
| 128:3191 / 128:3298 / 128:3529 / 128:3413 | Store selector default + Aisle / Fruits / Fridge hover |
| 203:9381 | Gallery |
| 203:9859 | Product sheet |

## Tokens (one source)

`:root` tokens and `@font-face` move out of `store.css` into `src/styles/tokens.css`, imported by the
store layout *and* the Ramp layout (the About sheet renders on the Ramp homescreen and needs the
same tokens and fonts). `store.css` keeps only rules.

New tokens (Figma variable → token):

| Figma | Token |
|---|---|
| fieldYellow/70 `#FFF4D8`, /110 `#674900`, /90 `#E9B34A` | `--section-aisle-surface/-ink/-line` |
| selector Fruits hover (sampled) `#E9EDC9` / `#3D5300` | `--section-fruits-surface/-ink` |
| selector Fridge hover (sampled) `#E3CFD5` / `#51163E` | `--section-fridge-surface/-ink` |
| Neutral/900 `#171717`, Base/White `#FAFAFA`, shadow-md | `--tooltip-bg/-ink/-shadow` |
| softGrey/100 `#41403F`, eggplant/blue, socraticaCream | already exist (`--store-*`) |
| text/text-primary `#131313` | `--store-ink` (exists) |
| Untitled Sans | `--font-sans` token; card name uses it |
| one step up the scale | `--t-body-lg` (new, 18px/400), `--t-small` for card descriptions |

Existing gallery accents (`--area-accent*`, chosen by the user earlier) stay as they are.

## Primitives (`src/components/ui/`)

- `Sheet`: the one modal. Full-height panel, dimmed backdrop, 50px close button, Esc, backdrop click, focus
  trap, focus return, scroll lock, fast ease-out. `inset` variant (`gallery` 144px, `sidebar` 221px).
  Replaces `PolicyModal` and the product *page*; About and product views are content.
- `Button`: variants `soft` (Add to Cart, Get started), `outline`, `primary` (lime), renders `<button>` or
  `<Link>`. Replaces `.shopAddToCart`, `.receiptBack*`, `.shopBack`.
- `PricePill`: sizes `sm`, `lg`; replaces `.shopPrice` and `.shopDetailPrice`.
- `Tooltip`: dark bubble with arrow, fades/translates in; position given by parent.
- `SectionCard`: selector card (name, caret, blurb) with `tone` and `active`.
- Reused: `ProductCard`, `QuantityStepper`, `AllergenAlert`, `GrainImage`.

## Screens

1. **Homescreen**: spacing matched to the frame (top bar hidden, feed offset). "How it works" (button and
   sidebar row, via `/ramp?about`) and the `policy` link open `Sheet`. `PolicyModal` deleted.
2. **Selector**: `MarketSelector` client component owns `activeSection`. Cards and shelf regions both
   read/write it. Tooltip follows the cursor (CSS transform from pointer position, no easing); focus
   and hover share the handlers. Shelf rebuilt from the Figma vector parts (downloaded to
   `public/store/market/`) with the real product SVGs on three rows (7 / 4 / 6).
3. **Gallery**: header, switcher, 3-column grid, header chips. Card name in Untitled Sans; descriptions and
   subtitle one scale step up. Whole card opens the product Sheet at `?item=id`. Old
   `/market/[area]/[product]` route redirects to that URL.
4. **About sheet**: `AboutContent` (heading, copy, Get started, three step cards) inside `Sheet`; the
   `/store` page renders the same content, so there is one implementation.

## Data gaps (client-derived or placeholder)

- Homescreen user callout shows first name + team (no last name / email in the data).
- Insights chart and % change are derived from local purchase history.
- "Cart - N / DOLLAR - N" use the existing cart context.
- Loading Screen frame missing (above).

## Verification

Run the app at 1512×982, screenshot every state, compare with `get_screenshot` of each node. Then
build, type-check, lint, tests, and `git diff` for the backend boundary.

## Outcome notes

- Product sheet and About sheet are URL-driven (`?item=`, `?about`) through `useSheetParam`.
- Brief-over-Figma deviations: card names in Untitled Sans; card descriptions, gallery subtitle, the
  "Pay a visit to" label and the sheet description one scale step up.
- Loading Screen node (2:68562) does not exist in the file; nothing built for it.
