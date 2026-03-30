# Mobile Project Instructions & Architecture

## 1. Tech Stack

- **Framework:** React Native + Expo
- **Routing:** Expo Router (File-based routing)
- **Styling:** Nativewind v4 (Tailwind CSS for React Native)
- **Icons:** @expo/vector-icons (Primarily using Feather)
- **Global State Management:** Zustand
- **API Fetching & Server State:** TanStack Query (React Query) + Axios

---

## 2. UI/UX Design System (Soft Elevation)

### 2.1. Overview & Creative North Star

**Creative North Star: "The Calm, Elevated Interface"**

Inspired by the design language of Apple iOS, Airbnb, and Google Material You — this system creates visual hierarchy through **subtle elevation, generous white space, and refined typography**. Depth is expressed softly: diffused shadows lift interactive elements off the canvas just enough to guide the eye naturally. Borders are used sparingly and thinly. The result is a warm, approachable, and breathable interface where content takes center stage.

**Core Principles:**

1. **Soft Depth** — Use subtle, diffused shadows to establish visual hierarchy. No harsh borders as primary separators.
2. **Breathable Spacing** — Generous padding and margins. White space is a first-class design element.
3. **Content-First** — Typography, imagery, and data drive the layout. Chrome (borders, dividers, decorations) is minimized.
4. **Warm & Approachable** — Rounded corners, soft colors, and smooth transitions create a friendly feel.

### 2.2. Colors & Surface Hierarchy

We utilize the strict 13-step tonal scale (T0 to T100). The color palette is shared across mobile and web — **do not modify**.

- **Background & Canvas:** `neutral-DEFAULT` (#F8F9F8) for the main screen background. `neutral-T100` (White) for elevated surfaces (cards, sheets, modals).
- **Primary Actions:** `primary-T40` (#296C24) for buttons, links, active states, and key interactive elements.
- **Surface Tinting:** Use light tonal surfaces (`primary-T95`, `secondary-T95`, `tertiary-T95`) for subtle section backgrounds or category highlights — instead of solid color blocks.
- **Accents:** `secondary-T40` (Orange) for warnings and highlights. `tertiary-T40` (Pink) for badges and notifications.
- **Dividers & Borders:** Use thin (`border` or `border-b`), low-contrast borders in `neutral-T90` or `neutral-T80`. Thick borders (`border-2`) are reserved **only** for active/focus states on inputs.
- **Text Colors:** `neutral-T10` for headings, `neutral-T30` for body text, `neutral-T50` for secondary/muted text, `neutral-T70` for placeholders.

### 2.3. Typography

Typography creates hierarchy through size, weight, and color — not decoration.

- **Display & Headlines:** `font-sans` (Epilogue). Use `Bold` (700) or `ExtraBold` (800). Natural casing (sentence case or title case) — **not uppercase**.
- **Titles & Body:** `font-body` (Be Vietnam Pro). Regular (400) for body text, SemiBold (600) for card titles and emphasis.
- **Labels & Captions:** `font-label` (Plus Jakarta Sans). `Medium` (500) or `SemiBold` (600). Normal casing — uppercase is reserved **only** for very small status badges (e.g., "NEW", "HOT").
- **Sizing Scale:** Follow a consistent typographic scale — `text-xs` (12), `text-sm` (14), `text-base` (16), `text-lg` (18), `text-xl` (20), `text-2xl` (24), `text-3xl` (30).

### 2.4. Elevation & Depth System

Depth is expressed through a layered shadow system. Each level serves a specific purpose.

| Level       | Class       | Usage                                       |
| ----------- | ----------- | ------------------------------------------- |
| **Level 0** | No shadow   | Flush content, inline elements, backgrounds |
| **Level 1** | `shadow-sm` | Cards, list items, static containers        |
| **Level 2** | `shadow`    | Floating action buttons, raised elements    |
| **Level 3** | `shadow-md` | Bottom sheets, dropdown menus               |
| **Level 4** | `shadow-lg` | Modals, popovers (use sparingly)            |

- Shadows should be **soft and diffused** — low opacity, larger blur radius.
- Combine elevation with a white (`neutral-T100`) background surface to create visual lift.
- Do NOT stack multiple shadow levels in the same area. Keep depth hierarchy clean and intentional.

### 2.5. Components

- **Buttons:**
  - _Primary:_ Solid `bg-primary-T40`, `text-neutral-T100`, `rounded-xl`, `h-14`. Subtle `shadow-sm` for lift.
  - _Secondary/Outline:_ `border border-neutral-T80`, `bg-neutral-T100`, `rounded-xl`. Light and clean.
  - _Ghost/Text:_ No background, no border. Just colored text with opacity change on press.
  - _Interaction:_ `active:opacity-80` or `active:scale-[0.98]` for subtle press feedback.

- **Cards:**
  - `bg-neutral-T100`, `rounded-2xl`, `shadow-sm`, `p-4` or `p-5`.
  - NO thick borders. Elevation (shadow) defines the card boundary against the canvas.
  - Use `gap-3` or `gap-4` for internal spacing between card child elements.

- **Inputs:**
  - Default: `bg-neutral-T95`, `rounded-xl`, `border border-neutral-T90`. Clean and subtle.
  - Focus: `border-primary-T40 border-2`. Single strong visual indicator.
  - Error: `border-error border-2`.

- **Lists & Separators:**
  - Prefer vertical spacing (`gap-3`, `gap-4`, `mb-4`) over divider lines.
  - When dividers are needed, use a thin `border-b border-neutral-T90`.

- **Chips/Tags:**
  - Soft tinted pill: `bg-primary-T95 text-primary-T30 rounded-full px-3 py-1`.
  - Use tonal surfaces, not heavy solid backgrounds.

### 2.6. Do's and Don'ts

- **DO** use subtle shadows (`shadow-sm`, `shadow`) to create card-like elevated surfaces.
- **DO** use generous white space and padding as the primary separator between sections.
- **DO** use consistent, generous rounded corners (`rounded-xl`, `rounded-2xl`).
- **DO** use tonal surface tinting (`primary-T95`, `neutral-T95`) for section backgrounds.
- **DO** use smooth interaction feedback (`active:opacity-80`, `active:scale-[0.98]`).
- **DON'T** use thick borders (`border-2`, `border-4`) as the primary way to separate elements.
- **DON'T** use heavy drop shadows or multiple layered shadows in one area.
- **DON'T** use all-uppercase text for buttons or large labels — only for tiny status badges.
- **DON'T** use gradients on buttons or backgrounds.
- **DON'T** over-decorate — if a component looks fine with just spacing and typography, don't add borders or shadows.

---

## 3. Folder Structure & Routing (Expo Router)

- **`/app`:** Contains ONLY routing and layout files (`_layout.tsx`).
  - `/app/(tabs)`: Main screens with Bottom Tab Bar.
  - `/app/(auth)`: Unauthenticated routes (Login, Register).
  - `/app/(post)`: Feature-specific flows.
- **`/components`:** Reusable UI Components.
  - `/components/shared`: Buttons, Modals, Inputs.
  - `/components/[feature]`: Domain-specific (e.g., `PostCard.tsx`).
- **`/store`:** Zustand global state files.
- **`/api`:** Axios instances and endpoint definitions.
- **`/hooks`:** Custom React hooks.
- **`/utils`:** Helpers (formatting, validations).

---

## 4. Component Coding Standards

- **Functional Components:** Strictly use React Functional Components.
- **TypeScript:** Define `interface` or `type` for all component Props.
- **Styling:** Prioritize Nativewind `className`. AVOID inline `style={{}}` unless handling dynamic values (e.g., `useSafeAreaInsets`).

---

## 5. State Management & API Fetching

- **Client State (Zustand):** Manage global UI state (auth status, theme, global modals) via Zustand. Keep it lightweight. Local component state should use `useState`.
- **Server State (React Query):** Use TanStack Query (`useQuery`, `useMutation`) for all server-state interactions (caching, loading states).
- **HTTP Client (Axios):** Configure an interceptor in `/api` to inject JWT tokens and handle 401 Unauthorized globally. Never write raw `fetch` calls in UI components.

---

## 6. Best Practices & Constraints

- **Safe Area:** Always wrap the outermost container with `<SafeAreaView>`.
- **Keyboard Handling:** Screens with `TextInput` MUST use `<KeyboardAvoidingView>` + `<ScrollView>`.
- **Text Rendering Crash:** DO NOT leave loose spaces, line breaks, or inline comments outside of `<Text>` tags within JSX.
