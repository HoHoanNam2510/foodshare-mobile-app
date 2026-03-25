# Mobile Project Instructions & Architecture

## 1. Tech Stack

- **Framework:** React Native + Expo
- **Routing:** Expo Router (File-based routing)
- **Styling:** Nativewind v4 (Tailwind CSS for React Native)
- **Icons:** @expo/vector-icons (Primarily using Feather)
- **Global State Management:** Zustand
- **API Fetching & Server State:** TanStack Query (React Query) + Axios

---

## 2. UI/UX Design System (The Editorial Harvest)

### 2.1. Overview & Creative North Star

**Creative North Star: "The Living Magazine"**
This system rejects rigid grids and 1px borders. Instead, we use asymmetric compositions, generous padding (referencing `16` and `20` spacing tokens), and overlapping elements to guide the eye naturally through the content.

### 2.2. Colors & Tonal Layering

The palette is rooted in earth tones, utilizing a 13-step tonal scale (T0 to T100) for maximum flexibility.

**Color Tokens (The 13-Step Scale):**

- **Primary (The Stem):** Base `DEFAULT` (#72B866). Used for brand presence and primary actions. Darker tones (`T30`, `T40`) for text/active states; lighter tones (`T80`, `T90`) for subtle backgrounds.
- **Secondary (The Zest):** Base `DEFAULT` (#EC8632). Used sparingly to highlight urgency or key accents.
- **Tertiary (The Bloom):** Base `DEFAULT` (#EF86B5). Used for special badges or gamification elements.
- **Neutral (The Soil):** Base `DEFAULT` (#F8F9F8). Defines the canvas.

**Surface Hierarchy (Using Neutral Scale):**

- **Highest Elevation (Cards/Modals):** `neutral-T100` (#FFFFFF).
- **Base Canvas (Background):** `neutral-DEFAULT` or `neutral-T95`.
- **Containers/Inputs:** `neutral-T90`.
- **Text:** `neutral-T10` for high emphasis, `neutral-T40` for muted/secondary text.

**The "No-Line" Rule:**
Sectioning must NEVER be achieved through 1px solid borders. Use background color shifts (e.g., `bg-neutral-T100` on `bg-neutral-T95`) and whitespace to create groupings.

### 2.3. Typography

- **Display & Headlines:** `font-sans` (Epilogue). Use large scales with tight tracking.
- **Titles & Body:** `font-body` (Be Vietnam Pro). The workhorse for long-form content.
- **Labels:** `font-label` (Plus Jakarta Sans). Used for metadata (uppercase, small).

### 2.4. Elevation & Depth

- **Tonal Layering:** Stack container tokens instead of using harsh shadows.
- **Ambient Shadows:** Where a floating effect is vital, use a diffused shadow (blur `24px`, low opacity) tinted with `neutral-T10`, never pure black.

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
