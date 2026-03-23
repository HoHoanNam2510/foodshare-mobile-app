# Design System Strategy: The Editorial Harvest

## 1. Overview & Creative North Star

**Creative North Star: "The Living Magazine"**
This design system moves beyond the utility of a standard marketplace to create a curated, editorial experience. It treats community food-sharing with the same aesthetic reverence as a high-end culinary publication. By utilizing expansive white space, dramatic typography scales, and a "Tonal Layering" approach to depth, we transform a functional app into an immersive digital environment that feels organic, premium, and intentional.

The system rejects the "boxed-in" feel of traditional apps. Instead of rigid grids and borders, we use asymmetric compositions, generous padding (referencing our `16` and `20` spacing tokens), and overlapping elements to guide the eye naturally through the "harvest" of content.

---

## 2. Colors & Surface Philosophy

The palette is rooted in earth tones, utilizing a sophisticated range of greens and warm neutrals to evoke freshness and trust.

### Color Tokens
- **Primary (The Stem):** `primary` (#296c24) for authoritative action; `primary_container` (#72b866) for brand presence.
- **Secondary (The Zest):** `secondary` (#944a00) and `secondary_container` (#fd933f) used sparingly to highlight urgency (e.g., "Expiring Soon") or key accents.
- **Neutral (The Soil):** `surface` (#f9f9f8) and `surface_container` tiers define the canvas.

### The "No-Line" Rule
Sectioning must never be achieved through 1px solid borders. Boundaries are defined exclusively through:
1. **Background Color Shifts:** Placing a `surface_container_low` card against a `surface` background.
2. **Whitespace:** Using the `8` (2.75rem) or `10` (3.5rem) spacing tokens to create mental groupings.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine papers. 
- Use `surface_container_lowest` (#ffffff) for the most elevated interactive elements (like a featured recipe card).
- Use `surface_container` (#edeeed) for secondary structural groupings.
- **The Glass Rule:** For floating elements like navigation bars or top headers, use `surface` with a 80% opacity and a `backdrop-blur` effect to allow the vibrant food photography to "bleed" through the interface, softening the digital edges.

---

## 3. Typography

The typographic system relies on a high-contrast pairing: a bold, geometric sans-serif for personality and a highly legible, rhythmic sans-serif for information.

*   **Display & Headlines (Epilogue):** Used for "Editorial Moments." Large scales like `display-lg` (3.5rem) should be used for impact, often with tight letter-spacing to feel like a magazine cover.
*   **Titles & Body (Be Vietnam Pro):** This is our workhorse. `title-lg` provides a friendly, accessible header for cards, while `body-md` ensures long-form content is readable and inviting.
*   **Labels (Plus Jakarta Sans):** Used for metadata (distance, time, tags). These are kept small (`label-sm`) and often uppercase to provide a professional, organized "tag" feel.

---

## 4. Elevation & Depth

We eschew traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" container tokens. A `surface_container_lowest` card sitting on a `surface_container_low` background creates a soft, natural lift without the "muddy" feel of heavy shadows.
*   **Ambient Shadows:** Where a floating effect is vital (e.g., a Floating Action Button), use a shadow with a blur radius of at least `24px` and an opacity of 4-6%. The shadow color must be a tinted version of `on_surface` (#191c1c), never pure black.
*   **The Ghost Border:** If a boundary is required for accessibility in complex forms, use `outline_variant` (#c0c9b9) at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Cards (The Hero Component)
Cards are the heart of this system. 
- **Style:** Use `rounded-lg` (2rem) or `rounded-xl` (3rem) for image containers.
- **Photography:** Food must be high-resolution, using natural lighting. Images should occupy 60-100% of the card area.
- **Content:** Forbid dividers. Use `title-md` for the food name and `label-md` for the location, separated by a `3` (1rem) spacing unit.

### Buttons & Chips
- **Primary Action:** Use a `primary` background with `on_primary` text. The shape should be `full` (pill-shaped) to feel friendly and modern.
- **Selection Chips:** To filter (e.g., "Vegetarian", "Bakery"), use `surface_container_high` with `on_surface_variant`. When active, transition to `primary` with a subtle gradient shift toward `primary_container`.

### Inputs & Fields
- **Container:** Use `surface_container_low` with a `rounded-md` (1.5rem) corner. 
- **Focus State:** Instead of a thick border, use a subtle 1px `primary` border and a soft `surface_tint` outer glow.

### Signature Component: The Impact Banner
A large-scale container using `primary_dark` or a gradient of `primary` to `primary_container`. It uses `display-sm` typography to celebrate community milestones (e.g., "2,412 lbs of food saved").

---

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric layouts. If a list of cards is vertical, occasionally introduce a horizontal "Surprise Bag" scroller to break the rhythm.
*   **DO** use "Large" and "Extra Large" corner radii to reinforce the friendly, eco-organic brand personality.
*   **DO** lean on the `surface_container` tiers to create hierarchy rather than adding more lines.

### Don't
*   **DON'T** use 1px dividers or borders to separate list items. Use white space (`spacing-4` or `spacing-5`).
*   **DON'T** use high-saturation shadows. Keep them diffused and atmospheric.
*   **DON'T** crowd the edges. If a component feels "stuck" to the screen edge, increase the margin using the `6` (2rem) spacing token.
*   **DON'T** use standard "system" colors for errors or success if they clash with the harvest palette. Use our `error` (#ba1a1a) and `primary` (#296c24) tokens to ensure tonal harmony.