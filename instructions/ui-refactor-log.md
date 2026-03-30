# Mobile App UI Refactor — Session Log

**Last Updated:** 2026-03-31

---

## 1. Design System Overhaul: Flat Design → Soft Elevation

**Input:**

- Codebase đang dùng "Flat Design" với nhiều `border-2`, `border-4`, uppercase text, không shadow → layout cứng nhắc, thô.
- Yêu cầu chuyển sang design system hiện đại, lấy cảm hứng Apple iOS / Airbnb / Google Material You.

**Workflow:**

1. Đề xuất hệ thống "Soft Elevation" — subtle shadows, generous whitespace, rounded corners, natural casing.
2. Cập nhật **Section 2** của `PROJECT_INSTRUCTIONS.md` với spec mới:
   - 4 mức shadow: `shadow-sm`, `shadow` (default), `shadow-md`, `shadow-lg` (rgba values).
   - Component specs: Card, Button, Pill/Chip, Modal, Header, TabBar.
   - Do's / Don'ts checklist.
3. Cập nhật `tailwind.config.js`:
   - Thêm `boxShadow` (4 levels với rgba).
   - Thêm `borderRadius.3xl` = `1.5rem`.
   - **Giữ nguyên** colors (13-step tonal scale T0–T100 dùng chung với web).
   - Giữ nguyên font families.

**Output:**

- `PROJECT_INSTRUCTIONS.md` Section 2 hoàn chỉnh với Soft Elevation spec.
- `tailwind.config.js` có shadow system mới, sẵn sàng dùng.

---

## 2. File Naming Convention: PascalCase → kebab-case

**Input:**

- Route files trong `app/` dùng lẫn lộn PascalCase (`HomeScreen.tsx`, `ChatDetail.tsx`) và lowercase.
- Cần chuẩn hóa theo kebab-case convention cho route files.

**Workflow:**

1. Kiểm tra tất cả files trong `app/(tabs)/`, `app/(post)/`, `app/(auth)/`.
2. Đổi tên:
   - `(tabs)`: `HomeScreen.tsx` → `home.tsx`, `Explore.tsx` → `explore.tsx`, `ChatList.tsx` → `chat.tsx`, `Profile.tsx` → `profile.tsx`. Xóa `Chat.tsx` (redirect thừa).
   - `(post)`: `CreatePost.tsx` → `create-post.tsx`, `PostDetail.tsx` → `post-detail.tsx`, `PostList.tsx` → `post-list.tsx`, `ChatDetail.tsx` → `chat-detail.tsx`.
   - `(auth)`: `login.tsx`, `register.tsx` — đã lowercase, không đổi.
3. Cập nhật tất cả route references (`router.push`, `Link href`, `Redirect`) across codebase.
4. Thêm `as any` type cast cho typed routes chưa regenerate.

**Output:**

- Tất cả route files theo kebab-case.
- Route references cập nhật đúng: `/home`, `/explore`, `/chat`, `/profile`, `/(post)/create-post`, `/(post)/post-detail`, `/(post)/post-list`, `/(post)/chat-detail`.
- Files affected: `app/index.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/chat.tsx`, `app/(post)/create-post.tsx`, `app/(post)/post-list.tsx`, `components/shared/SelectPostTypeModal.tsx`.

---

## 3. Apply Soft Elevation to Home + Layout Components

**Input:**

- `home.tsx` có 7 sub-components (Header, FilterPills, HeroBanner, GuideSection, FreshlyShared/P2PCard, MarketTeaser, ImpactBanner) vẫn dùng Flat Design.
- `components/shared/Header.tsx` dùng `expo-blur`, style cũ.
- `components/shared/CustomTabBar.tsx` dùng `border-2`, uppercase text.

**Workflow:**

1. Restyle tất cả 7 sub-components trong `home.tsx`:
   - Xóa `border-2`/`border-4` → thêm `shadow-sm`/`shadow-md`.
   - `rounded-full` cho pills/avatars thay vì `rounded-xl`.
   - Natural casing thay uppercase.
   - Softer font weights.
2. Restyle `shared/Header.tsx`:
   - Xóa `expo-blur` dependency.
   - Dùng `bg-neutral-T100 shadow-sm`.
   - Rounded-full icon buttons với `bg-neutral-T95`.
   - Logo + "FoodShare" branding.
3. Restyle `shared/CustomTabBar.tsx`:
   - `border-2` → `shadow-md`.
   - Uppercase → natural casing `font-body`.
   - FAB: `rounded-2xl` → `rounded-full`, `FAB_SIZE = 56`.

**Output:**

- Home screen và layout components theo Soft Elevation design.
- Không còn dependency `expo-blur`.
- Inline Header trong home.tsx giống hệt shared Header.

---

## 4. Component Extraction: home.tsx → components/home/

**Input:**

- `home.tsx` ~580 dòng, chứa tất cả sub-components inline.
- Yêu cầu tách thành file riêng, dùng shared Header thay vì inline.
- Fix spacing giữa Header ↔ Screen ↔ CustomTabBar.
- Fix horizontal scroll overflow bên phải (FilterPills, GuideSection).

**Workflow:**

1. Tạo `components/home/` folder với 6 component files:
   - `FilterPills.tsx` — filter pill horizontal scroller.
   - `HeroBanner.tsx` — hero banner với ImageBackground.
   - `GuideSection.tsx` — guide cards horizontal scroller.
   - `FreshlyShared.tsx` — P2P items grid (includes P2PCard internally, typed `P2PItem`).
   - `MarketTeaser.tsx` — market surprise bags horizontal scroller.
   - `ImpactBanner.tsx` — impact stats banner.
2. Rewrite `home.tsx` → slim ~40 dòng, chỉ import components.
3. Fix spacing:
   - `paddingTop`: `insets.top + 70` → `insets.top + 80` (breathing room dưới Header).
   - `paddingBottom`: `40` → `100` (clear CustomTabBar + FAB).
4. Import `Header` từ `components/shared/Header` thay vì define inline.

**Output:**

- 6 files mới trong `components/home/`.
- `home.tsx` slim, chỉ orchestrate layout.
- Spacing hợp lý giữa Header, content, TabBar.

---

## 5. Fix Horizontal Scroll Overflow (Clip Content)

**Input:**

- FilterPills và GuideSection: content tràn ra ngoài vùng spacing 20px (mx-5) khi scroll.
- Yêu cầu ẩn phần content vượt qua ranh giới spacing 2 bên.

**Workflow:**

1. **FilterPills.tsx:**
   - Bọc `ScrollView` trong `<View className="mx-5 overflow-hidden">`.
   - Xóa `paddingHorizontal: 20` khỏi `contentContainerStyle`.
   - Content được clip tại đúng ranh giới 20px.
2. **GuideSection.tsx:**
   - Tương tự, bọc `ScrollView` trong `<View className="mx-5 overflow-hidden">`.
   - Xóa `paddingHorizontal: 20` khỏi `contentContainerStyle`.

**Output:**

- Content horizontal scroll được clip gọn trong vùng spacing.
- Phần tử vượt ranh giới bị ẩn thay vì tràn ra.

---

## File Structure Summary

```
components/
├── home/
│   ├── FilterPills.tsx      ← horizontal filter pills (overflow-hidden clip)
│   ├── HeroBanner.tsx       ← hero banner ImageBackground
│   ├── GuideSection.tsx     ← guide cards horizontal (overflow-hidden clip)
│   ├── FreshlyShared.tsx    ← P2P items 2-column grid (includes P2PCard)
│   ├── MarketTeaser.tsx     ← market surprise bags horizontal
│   └── ImpactBanner.tsx     ← community impact stats
├── shared/
│   ├── Header.tsx           ← app header (Soft Elevation, shadow-sm)
│   ├── CustomTabBar.tsx     ← bottom tab bar (Soft Elevation, shadow-md)
│   └── SelectPostTypeModal.tsx
app/
├── (tabs)/
│   ├── home.tsx             ← slim orchestrator (~40 lines)
│   ├── explore.tsx
│   ├── chat.tsx
│   └── profile.tsx
├── (post)/
│   ├── create-post.tsx
│   ├── post-detail.tsx
│   ├── post-list.tsx
│   └── chat-detail.tsx
└── (auth)/
    ├── login.tsx
    └── register.tsx
```

## Key Patterns & Notes

- **Overflow fix cho horizontal ScrollView:** Bọc trong `<View className="mx-5 overflow-hidden">`, dùng `mr-*` margin thay vì `gap` trong contentContainerStyle.
- **Shadow visibility:** Thêm `paddingBottom: 4` trong contentContainerStyle để shadow không bị clip.
- **Spacing pattern:** Header absolute + `paddingTop: insets.top + 80`, `paddingBottom: 100` cho TabBar clearance.
- **Design tokens (KHÔNG thay đổi colors):** 13-step tonal scale `T0`–`T100` cho primary/secondary/tertiary/neutral — shared với web project.
- **Route typed routes:** Cần `npx expo start` để regenerate, dùng `as any` cast tạm thời.
