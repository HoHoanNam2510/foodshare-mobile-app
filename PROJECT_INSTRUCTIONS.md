# Mobile Project Instructions & Architecture

## 1. Tech Stack

- **Framework:** React Native + Expo
- **Routing:** Expo Router (File-based routing)
- **Styling:** Nativewind v4 (Tailwind CSS for React Native)
- **Icons:** @expo/vector-icons (Primarily using Feather)
- **Global State Management:** Zustand
- **API Fetching & Server State:** TanStack Query (React Query) + Axios

---

## 2. UI/UX Design System (The Flat Editorial)

### 2.1. Overview & Creative North Star

**Creative North Star: "The Flat Graphic Poster"**
This design system removes all artificial depth. It rejects the illusion of three-dimensionality—NO drop shadows, NO bevels, NO blurs. It relies entirely on **hierarchy through scale, stark color contrast, and bold typography**. The aesthetic is digital-native: crisp edges, solid blocks of color, and geometric purity. Every element exists because it is necessary, creating visual interest through pure form rather than decoration.

### 2.2. Colors & Flat Structure

We utilize the strict 13-step tonal scale (T0 to T100). High contrast is essential.

- **Background & Canvas:** `neutral-DEFAULT` (#F8F9F8) or `neutral-T100` (Pure White).
- **Primary Actions:** `primary-T40` (#296C24) - Sharp, solid green.
- **Accents:** `secondary-T40` (Orange) and `tertiary-T40` (Pink) used for badges and highlights.
- **Borders & Lines:** Instead of shadows, we now embrace thick borders (`border-2`, `border-4`) using `neutral-T20` or `primary-T40` to define inputs and active states.

### 2.3. Typography as Interface

Typography bears the load of the visual hierarchy. Text size and weight must be distinct and bold.

- **Display & Headlines:** `font-sans` (Epilogue). Use `ExtraBold` (800) or `Bold` (700) with tight letter-spacing (`tracking-tight` or `tracking-tighter`).
- **Titles & Body:** `font-body` (Be Vietnam Pro). Regular (400) for readable body text, SemiBold (600) for internal card titles.
- **Labels/Buttons:** `font-label`. Always uppercase (`uppercase tracking-wider`) to simulate solid geometric blocks of text.

### 2.4. Elevation & Zero Depth

- **Zero Artificial Depth:** The Z-axis does not exist. Everything is on the same plane.
- **SHADOWS ARE STRICTLY FORBIDDEN.** Do not use `shadow`, `elevation`, or `backdrop-blur`.
- **Interaction Feedback:** Rely on immediate visual feedback through scale transformations (`active:scale-95`), thick solid borders, or full color inversions (e.g., an outline button becoming solid on press).

### 2.5. Components

- **Buttons:** - _Primary:_ Solid `bg-primary-T40`, `text-neutral-T100`. Flat, no shadow. Height `h-14`.
  - _Outline:_ `border-2` or `border-4` solid color. Transparent bg.
- **Cards (Color Blocks):** Solid background (`bg-neutral-T100` or tinted like `bg-primary-T95`). **0px shadow**. Use sharp, consistent rounded corners (`rounded-xl` or `rounded-2xl`, smaller than the previous design). Generous padding (`p-6`).
- **Inputs:** `bg-neutral-T95` background. No border default. On focus: add a hard, thick border `border-2 border-primary-T40` with NO glow.

### 2.6. Do's and Don'ts

- **DO** use large, bold typography to anchor sections.
- **DO** use solid color blocks (Primary, Secondary, Neutral) to divide screen sections instead of thin lines.
- **DO** use geometric purity. Stick to sharp rectangles and consistent, moderate corner radii (`rounded-xl`).
- **DON'T** use `elevation`, `shadow`, or `blur` effects anywhere in the app.
- **DON'T** use gradients on buttons or text.

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
