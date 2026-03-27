# koliko-placam — Project Reference

Croatian komunalna naknada (utility levy) calculator. Frontend-only, no backend, no API calls for data. Pure arithmetic on static city data.

---

## Stack

| Tool | Version/Notes |
|------|---------------|
| React | 18, with hooks |
| TypeScript | strict mode, `verbatimModuleSyntax: true` |
| Vite | bundler |
| Tailwind CSS | v4 — uses `@import "tailwindcss"` + `@tailwindcss/vite` plugin, **no** `tailwind.config.js` |
| shadcn/ui | radix-maia style (not New York) |
| Leaflet | react-leaflet v4, with Vite icon fix in `main.tsx` |
| pnpm | package manager |

---

## Core Formula

```
komunalna_naknada (god) = B × Kz × Kn × m²
```

- **B** — vrijednost boda (€/m²/god), set per city in `cities.ts`
- **Kz** — koeficijent zone (zone multiplier, 0.20–1.00), varies by zone within each city
- **Kn** — koeficijent namjene = **1.0** hardcoded (residential only, stambeni prostor)
- **m²** — user input (slider + number input, range 20–300)

**Total annual cost** = `naknadaAnnual + wasteAnnual`

- `naknadaAnnual` = formula above
- `wasteAnnual` = fixed per city (standard 120L bin, 1×/week), not affected by m² or zone

---

## TypeScript Rules

- **Always use `import type { ... }`** for type-only imports — `verbatimModuleSyntax` enforces this.
  - Affects: `cities.ts`, `useCalculator.ts`, all component files
- `ZoneNumber` = `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9` (union, not plain number)
- `city.zoneCount: 3 | 9` guards which UI is shown in ZoneSelector

---

## Key Types (`src/types.ts`)

```typescript
export type City = {
  id: string;
  name: string;
  county: string;
  lat: number;
  lng: number;
  b: number;               // vrijednost boda €/m²/god
  zoneCount: 3 | 9;
  zones: Record<ZoneNumber, ZoneInfo>;
  sourceUrl: string;
  sourceYear: number;
  confirmed: boolean;      // true = official JLS decision confirmed
  wasteAnnual: number;     // odvoz otpada €/god (standard 120L, 1×/week)
  wasteConfirmed: boolean;
  wasteSourceUrl?: string;
};

export type CalculationResult = {
  city: City;
  zone: ZoneNumber;
  sqm: number;
  naknadaAnnual: number;
  wasteAnnual: number;
  totalAnnual: number;     // naknadaAnnual + wasteAnnual
  monthlyTotal: number;    // totalAnnual / 12
  formula: string;         // human-readable formula string
};
```

---

## File Structure

```
src/
├── data/
│   └── cities.ts          # 24 Croatian cities, static data
├── hooks/
│   ├── useCalculator.ts   # main calculation hook, allResults for comparison
│   └── useDarkMode.ts     # reads prefers-color-scheme, toggles .dark on <html>
├── components/
│   ├── Calculator.tsx     # sqm slider + ZoneSelector + ResultCard + MonthlyExpenses
│   ├── ComparisonTable.tsx # sortable city comparison (zona 1 baseline)
│   ├── Map.tsx            # Leaflet map with markers, GeoJSON counties, animations
│   ├── MonthlyExpenses.tsx # accordion: fixed costs + editable utility inputs
│   ├── ResultCard.tsx     # displays naknadaAnnual + wasteAnnual breakdown
│   ├── ThemeToggle.tsx    # sun/moon toggle (lucide-react icons)
│   ├── ZoneSelector.tsx   # 3 buttons (standard) or shadcn Select (Zagreb 9 zones)
│   └── ui/                # shadcn components
├── pages/
│   └── SourcesPage.tsx    # table of all cities with B values, waste, source links
├── App.tsx                # tab nav: Kalkulator | Gradovi & Podaci
├── main.tsx               # ReactDOM.createRoot + Leaflet icon fix
├── index.css              # @import "tailwindcss" + leaflet CSS + marker animations
└── types.ts
```

---

## Data (`src/data/cities.ts`)

- 24 cities as of March 2026
- `threeZones(kz1, kz2, kz3)` helper fills stubs for zones 4–9 on 3-zone cities
- Zagreb has 9 zones (SGZ 33/23), all others have 3 zones
- `confirmed: true` = B value from official JLS decision (Narodne Novine / Službeni glasnik)
- `confirmed: false` = estimate from media reports / percentage increases for 2026
- Confirmed cities (komunalna naknada): Zagreb, Osijek (as of session end)
- Confirmed waste: Osijek (5.55 €/mj), Rijeka (14 €/mj from 2026-01-01)

---

## Map (`src/components/Map.tsx`)

- **Tiles**: CartoDB Positron (light) / Dark Matter (dark) — `key={dark?'dark':'light'}` forces TileLayer remount on theme switch
- **Markers**: custom `L.divIcon`
  - Selected city: pulsing CSS animation with `.lm-ring` and `.lm-dot-sel` classes
  - Other cities: plain colored dot, color by B value (green ≤1.2, amber ≤1.6, red >1.6)
- **FlyToCity**: component that calls `map.flyTo()` on city change, skips first render via `useRef(isFirst)`
- **County GeoJSON**: loaded from `/public/counties.geojson`
  - Hover: increases fill opacity, shows county name in overlay badge
  - Click: selects city with highest B in that county
  - `GEOJSON_TO_COUNTY` maps `"Zagreb"` → `"Grad Zagreb"` (only special case)

---

## MonthlyExpenses (`src/components/MonthlyExpenses.tsx`)

Accordion component. **Must live OUTSIDE the `<Card>`** — shadcn Card has `overflow: hidden` which clips the expanding accordion.

Layout in `Calculator.tsx`:
```tsx
<div className="space-y-3">
  <Card>...</Card>
  <MonthlyExpenses result={result} />
</div>
```

Editable rows (user sets their actual monthly amounts):
- Struja (80€ default)
- Voda i odvodnja (20€)
- Grijanje / plin (60€)
- Pričuva (30€) — vlasnik only
- Internet + TV (15€)
- Ostalo (0€)

Payer badges: **vlasnik** (blue) = property owner only, **stanar** (green) = tenant, **oboje** (gray) = depends on lease.

Who pays what (legally):
- Komunalna naknada → **vlasnik only**, always
- Odvoz otpada → household user (vlasnik or stanar per lease agreement)
- Utilities (struja, voda, grijanje) → whoever holds the contract (usually stanar)
- Pričuva → **vlasnik only**

---

## ComparisonTable

- Sorted by `totalAnnual` (naknadaAnnual + wasteAnnual) descending by default
- Always uses **Zona 1** for cross-city comparison (zone numbers not comparable across cities)
- Shows diff relative to selected city (green = cheaper, red = more expensive)

---

## Leaflet Vite Fix (`src/main.tsx`)

```typescript
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
```

---

## CSS (`src/index.css`)

```css
@import "tailwindcss";
@import "leaflet/dist/leaflet.css";
```

Marker animation classes (`.lm-ring`, `.lm-dot`, `.lm-dot-sel`, `.lm-selected`) defined here for the pulsing selected-city marker effect.

---

## Known Gotchas

1. **`verbatimModuleSyntax`** — every type import needs `import type { ... }`, not just `import { ... }`.
2. **Card `overflow: hidden`** — shadcn Card clips child elements that expand beyond initial bounds. Never put accordions inside `<CardContent>`.
3. **Leaflet icons in Vite** — default icon URLs break; must apply the fix in `main.tsx` before any map renders.
4. **ZoneNumber type** — it's a union `1|2|3|4|5|6|7|8|9`, not `number`. Casting needed when reading from event values.
5. **Tailwind v4** — no `tailwind.config.js`, no `content` array. Plugin-based setup only.
6. **GeoJSON county names** — the GeoJSON uses `"Zagreb"` but cities.ts uses `"Grad Zagreb"` for the county field. The `GEOJSON_TO_COUNTY` map handles this.

---

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # TypeScript check + Vite build
pnpm preview      # preview production build
```

---

*Last updated: March 2026. Data covers 24 Croatian cities for 2026.*
