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
lib/
├── axios.ts             ← Axios instance + auth token interceptor
└── authApi.ts           ← Login/Register API functions
stores/
└── authStore.ts         ← Zustand auth state (hydrate/login/register/logout)
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
├── _layout.tsx          ← RootLayout + useProtectedRoute() auth guard
├── index.tsx            ← Auth-aware redirect (login or home)
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
    ├── login.tsx            ← Soft Elevation + backend API wiring
    └── register.tsx         ← Soft Elevation + backend API wiring
```

## Key Patterns & Notes

- **Overflow fix cho horizontal ScrollView:** Bọc trong `<View className="mx-5 overflow-hidden">`, dùng `mr-*` margin thay vì `gap` trong contentContainerStyle.
- **Shadow visibility:** Thêm `paddingBottom: 4` trong contentContainerStyle để shadow không bị clip.
- **Spacing pattern:** Header absolute + `paddingTop: insets.top + 80`, `paddingBottom: 100` cho TabBar clearance.
- **Design tokens (KHÔNG thay đổi colors):** 13-step tonal scale `T0`–`T100` cho primary/secondary/tertiary/neutral — shared với web project.
- **Route typed routes:** Cần `npx expo start` để regenerate, dùng `as any` cast tạm thời.

---

## 6. Fix iOS: Image Picker + DateTimePicker Modal

**Input:**

- Trên iOS, nút "Add photo" trong `ImagePickerSection` không hoạt động (không có phản hồi khi bấm).
- DateTimePicker modal (Pickup window, Expiry date) hiển thị sai format trên iOS — spinner bị collapse hoặc không render đúng kích thước như trên Android.

### Bug 1: Image Picker không hoạt động trên iOS

**Nguyên nhân gốc (3 lớp):**

1. **`MediaTypeOptions` deprecated:** `expo-image-picker` v17 deprecate enum `MediaTypeOptions.Images`. Trên iOS runtime có thể không resolve đúng, dẫn đến picker không mở hoặc không trả kết quả.
2. **`allowsEditing: true` → legacy picker path:** Trong native Swift code (`ImagePickerModule.swift`), khi `allowsEditing: true`, expo-image-picker buộc dùng `UIImagePickerController` (legacy) thay vì `PHPickerViewController` (modern). Trên iOS với new architecture (`newArchEnabled: true`), legacy picker bị silent reject do `currentViewController()` trả về nil.
3. **Không có error handling:** `handleAddPhoto` là async function nhưng không có `try-catch`, nên khi native module reject promise → unhandled rejection, user không thấy gì.

**Fix:**

```typescript
// components/post/ImagePickerSection.tsx
const handleAddPhoto = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant photo library access in Settings to add photos.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // ← string array thay deprecated enum
      allowsEditing: false, // ← dùng PHPickerViewController (modern, ổn định)
      quality: IMAGE_COMPRESSION_QUALITY,
    });
    if (!result.canceled && result.assets[0]) {
      onImagesChange([...images, result.assets[0].uri]);
    }
  } catch (error) {
    console.error('ImagePicker error:', error);
  }
};
```

**Thay đổi chính:**

- `mediaTypes: ['images']` — format mới thay `ImagePicker.MediaTypeOptions.Images`.
- `allowsEditing: false` — chuyển sang `PHPickerViewController` path, tránh legacy `UIImagePickerController`.
- Thêm `try-catch` bắt native module rejection.
- Thêm `Alert` khi permission bị denied.
- Thêm `import { Alert }` từ `react-native`.

### Bug 2: DateTimePicker spinner không hiển thị đúng trong Modal trên iOS

**Nguyên nhân gốc:**

1. **`width: '100%'` (percentage) xung đột layout constraint:** Native `UIDatePicker` (wheels style) có intrinsic content size riêng. Khi đặt trong RN `<Modal>`, `width: '100%'` tạo percentage-based constraint xung đột với native constraint → picker bị collapse height hoặc render sai.
2. **`gap-4` trên parent View:** NativeWind `gap-4` tạo thêm flex constraint thừa, gây xung đột với native picker layout.
3. **Dark mode ẩn text:** Nếu device ở dark mode, spinner text color có thể trùng background → picker "vô hình".

**Fix:**

```tsx
// app/(post)/create-post.tsx — renderPickerModal()
<View
  className="bg-neutral-T100 rounded-t-3xl px-6 pt-4 pb-6" // ← bỏ gap-4
  style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
>
  <View className="w-10 h-1 bg-neutral-T80 rounded-full self-center mb-2" />
  <View style={{ overflow: 'hidden', alignSelf: 'center' }}>
    {' '}
    {/* ← wrapper view */}
    <DateTimePicker
      value={getPickerValue()}
      mode={pickerMode}
      display="spinner" // ← hardcode, không conditional
      onChange={handleDateChange}
      themeVariant="light" // ← ép light theme, tránh dark mode ẩn text
      style={{ height: 216 }} // ← explicit height, KHÔNG có width
    />
  </View>
  {Platform.OS === 'ios' && (
    <TouchableOpacity
      className="h-14 bg-primary-T40 rounded-xl items-center justify-center shadow-sm active:opacity-80 mt-4" // ← mt-4 thay gap-4
      onPress={() => setActivePicker(null)}
    >
      <Text className="font-label font-semibold text-neutral-T100">Done</Text>
    </TouchableOpacity>
  )}
</View>
```

**Thay đổi chính:**

- Bỏ `width: '100%'` — để native view tự sizing horizontally.
- Bỏ `gap-4` trên parent View → dùng `mt-4` trên nút Done.
- Wrap `DateTimePicker` trong `<View style={{ overflow: 'hidden', alignSelf: 'center' }}>` — cho native view boundaries rõ ràng mà không xung đột constraint.
- Thêm `themeVariant="light"` — ép light theme cho picker text luôn visible.
- `display="spinner"` hardcode — Android dùng native dialog riêng (ngoài React tree) nên không ảnh hưởng.
- `height: 216` — chiều cao chuẩn của iOS wheel picker (`UIDatePickerStyle.wheels`).

### Cấu hình bổ sung

```json
// app.json — thêm expo-image-picker plugin
[
  "expo-image-picker",
  {
    "photosPermission": "Ứng dụng cần truy cập thư viện ảnh để bạn có thể thêm ảnh vào bài đăng."
  }
]
```

### Bài học / Pattern ghi nhớ

| Vấn đề                      | Pattern tránh                                          | Pattern đúng                                                       |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| expo-image-picker v17       | `MediaTypeOptions.Images` (deprecated enum)            | `['images']` (string array)                                        |
| Image picker iOS + new arch | `allowsEditing: true` (legacy UIImagePickerController) | `allowsEditing: false` (modern PHPickerViewController)             |
| DateTimePicker trong Modal  | `width: '100%'` + `gap-*` trên parent                  | Explicit `height`, no width, wrapper View với `overflow: 'hidden'` |
| DateTimePicker dark mode    | Không set themeVariant                                 | `themeVariant="light"`                                             |
| Async onPress handler       | Không try-catch → silent failure                       | Luôn wrap trong `try-catch`                                        |

**Commit:** `83cb4c4` — `fix(ios): resolve image picker and date picker modal issues`

---

## 7. Auth Flow: Login/Register Rebuild + Backend Integration + Route Guard

**Input:**

- Màn hình Login/Register cũ dùng style cũ (`bg-surface-lowest`, `text-text`, `rounded-full` buttons, inline shadows), không nhất quán với Soft Elevation design system.
- Chưa có kết nối backend API — chỉ UI tĩnh.
- Root layout (`_layout.tsx`) không có auth guard — luôn redirect thẳng vào `/home` bất kể trạng thái đăng nhập.

### 7.1 Cài đặt dependencies

```bash
npx expo install expo-secure-store zustand axios
```

- **expo-secure-store:** Lưu JWT token + user data an toàn trên device (Keychain iOS / EncryptedSharedPreferences Android).
- **zustand:** State management nhẹ, không boilerplate, dùng cho auth state toàn app.
- **axios:** HTTP client với interceptors, tự động gắn Bearer token vào mọi request.

### 7.2 Tạo API Client & Auth Store

**`lib/axios.ts`** (NEW):

- Tạo axios instance với `baseURL` từ `EXPO_PUBLIC_API_URL` env var (fallback `http://localhost:5000`).
- Request interceptor tự động đọc `auth_token` từ SecureStore và gắn `Authorization: Bearer <token>`.
- Timeout 15s.

**`lib/authApi.ts`** (NEW):

- `loginApi({ email, password })` → `POST /api/auth/login`.
- `registerApi({ fullName, email, phoneNumber, password })` → `POST /api/auth/register`.
- Response type `AuthResponse { success, message, token?, data?, onboardingRequired? }`.

**`stores/authStore.ts`** (NEW):

- Zustand store `useAuthStore` với state: `{ user, token, isLoading, isHydrated }`.
- Actions:
  - `hydrate()` — đọc token + user JSON từ SecureStore khi app khởi động, set `isHydrated: true`.
  - `login(email, password)` — gọi `loginApi`, lưu token + user vào SecureStore + state.
  - `register(fullName, email, phoneNumber, password)` — gọi `registerApi`, KHÔNG auto-login (user tự navigate về login).
  - `logout()` — xóa SecureStore keys, reset state.
- User interface: `{ _id, email, fullName, phoneNumber?, avatar?, role, isProfileCompleted, greenPoints, averageRating }`.

### 7.3 Restyle Login Screen — Soft Elevation

**`app/(auth)/login.tsx`** (REWRITTEN):

Thiết kế mới:

- **Gradient header:** `LinearGradient` `['#ABF59C', '#FFDCC6', '#FFFFFF']` — chiếm 55% top, tạo visual brand identity.
- **Logo:** `assets/images/logo.png` centered phía trên card.
- **White card:** `bg-neutral-T100 rounded-t-3xl shadow-md` — card chính chứa form.
- **Inputs:** `bg-neutral-T95 rounded-xl h-14 border border-neutral-T90` — cùng style với CreatePost.
- **Button:** `bg-primary-T40 h-14 rounded-xl shadow-sm` — cùng pattern với các button khác.
- **Google sign-in:** Button trắng với `shadow-sm`, icon Google, divider "or".
- **Password toggle:** `Feather` icon `eye`/`eye-off`.

Tính năng:

- Form state: `email`, `password`, `showPassword`.
- `handleLogin()` → validate fields → `useAuthStore.login()` → `router.replace('/(tabs)/home')`.
- Loading state: `ActivityIndicator` thay button text khi `isLoading`.
- Error handling: `Alert.alert()` với message từ backend hoặc generic fallback.
- `KeyboardAvoidingView` + `ScrollView` cho keyboard handling.
- Link "Forgot password?" + Link "Sign up" → `/(auth)/register`.

### 7.4 Restyle Register Screen — Soft Elevation

**`app/(auth)/register.tsx`** (REWRITTEN):

Thiết kế mới:

- Cùng gradient pattern như Login nhưng height 45% (ít hơn vì form dài hơn).
- Back button: `rounded-full bg-neutral-T100 shadow-sm` — trên header row cùng logo nhỏ hơn.
- Heading "Create account" + inline "Already have an account? Log in" link.
- 4 input fields: Full name, Email, Phone number, Password — cùng style `bg-neutral-T95 rounded-xl h-14`.

Tính năng:

- Form state: `fullName`, `email`, `phoneNumber`, `password`, `showPassword`.
- `handleRegister()` → validate required fields + password min 6 chars → `useAuthStore.register()`.
- Success: `Alert` "Account created! Please log in." → `router.back()` (về Login).
- Error: `Alert` với message từ backend.

### 7.5 Configure Root Layout Auth Routing

**`app/_layout.tsx`** (MODIFIED):

Thêm custom hook `useProtectedRoute()`:

```typescript
function useProtectedRoute() {
  const { token, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [token, isHydrated, segments]);
}
```

Thay đổi trong `RootLayout`:

- Import `useAuthStore`, `useRouter`, `useSegments` từ expo-router.
- Gọi `hydrate()` trong `useEffect([], [])` khi mount.
- Splash screen chỉ ẩn khi **cả** fonts loaded **và** auth hydrated.
- Gọi `useProtectedRoute()` — redirect tự động dựa trên auth state.
- Return `null` nếu chưa ready (fonts hoặc auth).

**`app/index.tsx`** (MODIFIED):

```typescript
export default function Index() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)/home" />;
}
```

### Auth Flow tổng quan

```
App Start → RootLayout mount
  → hydrate() đọc SecureStore
  → Splash screen giữ cho đến khi fonts + auth ready
  → useProtectedRoute() kiểm tra token:
    ├── Có token → cho vào app, redirect khỏi (auth) nếu đang ở đó
    └── Không token → redirect sang /(auth)/login

Login screen → nhập email + password → gọi backend API
  → Thành công: lưu token + user vào SecureStore → navigate /(tabs)/home
  → Thất bại: Alert lỗi

Register screen → nhập thông tin → gọi backend API
  → Thành công: Alert + navigate back về Login
  → Thất bại: Alert lỗi

Logout (future) → xóa SecureStore → useProtectedRoute tự redirect về Login
```

### Files tạo mới

| File                  | Mục đích                                |
| --------------------- | --------------------------------------- |
| `lib/axios.ts`        | Axios instance + auth token interceptor |
| `lib/authApi.ts`      | Login/Register API functions            |
| `stores/authStore.ts` | Zustand auth state management           |

### Files chỉnh sửa

| File                      | Thay đổi                                                 |
| ------------------------- | -------------------------------------------------------- |
| `app/(auth)/login.tsx`    | Rewrite toàn bộ — Soft Elevation design + API wiring     |
| `app/(auth)/register.tsx` | Rewrite toàn bộ — Soft Elevation design + API wiring     |
| `app/_layout.tsx`         | Thêm auth hydration, `useProtectedRoute()`, splash delay |
| `app/index.tsx`           | Auth-aware redirect thay vì hardcode `/home`             |

### Design Pattern ghi nhớ

| Pattern              | Cách dùng                                                                  |
| -------------------- | -------------------------------------------------------------------------- |
| Auth gradient header | `LinearGradient ['#ABF59C', '#FFDCC6', '#FFFFFF']` absolute, 45-55% height |
| Input field style    | `bg-neutral-T95 rounded-xl h-14 px-4 border border-neutral-T90`            |
| Action button        | `bg-primary-T40 h-14 rounded-xl shadow-sm`                                 |
| SecureStore keys     | `auth_token` (JWT string), `auth_user` (JSON string)                       |
| Route guard pattern  | `useProtectedRoute()` hook trong RootLayout, check `segments[0]`           |
| Splash screen delay  | Hide chỉ khi `fontsLoaded && isHydrated`                                   |

---

## 8. Fix: Mobile ↔ Backend Connectivity + Error Handling

**Input:**

- Sau khi hoàn thành auth flow (Section 7), đăng ký thành công nhưng đăng nhập bị timeout 15s.
- Khi fix xong timeout, login trả về status 400 nhưng app chỉ hiện generic error "Request failed with status code 400" thay vì message thật từ backend.

### 8.1 Tạo `.env` cho mobile app

**Vấn đề:** Không có file `.env` → fallback `http://localhost:5000` → trên điện thoại thật, `localhost` trỏ về chính device, không phải máy tính chạy backend → timeout.

**Fix:** Tạo `.env` với IP LAN của máy tính:

```bash
# .env
EXPO_PUBLIC_API_URL=http://<LAN_IP>:5000
```

**Lưu ý chọn IP theo môi trường:**

| Môi trường               | URL                              |
| ------------------------ | -------------------------------- |
| Android Emulator         | `http://10.0.2.2:5000`           |
| iOS Simulator            | `http://localhost:5000`           |
| Physical device (cùng WiFi) | `http://<LAN IP máy tính>:5000` |

Thêm `.env` vào `.gitignore` (trước đó chỉ ignore `.env*.local`).

### 8.2 Backend bind `0.0.0.0`

**Vấn đề:** `httpServer.listen(PORT)` mặc định bind `127.0.0.1` → chỉ nhận kết nối từ chính máy đó → device trong LAN bị từ chối.

**Fix** (`src/server.ts`):

```typescript
const PORT = Number(process.env.PORT) || 5000; // Number() fix TS overload error

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại http://0.0.0.0:${PORT}`);
});
```

- `'0.0.0.0'` cho phép nhận kết nối từ mọi network interface (LAN, localhost).
- `Number(process.env.PORT)` fix lỗi TypeScript "No overload matches this call" — `process.env.PORT` là `string`, `listen()` cần `number`.

### 8.3 Fix Axios error extraction

**Vấn đề:** Khi backend trả 400/401/403/404, axios throw `AxiosError` với `message: "Request failed with status code 400"`. Code cũ không extract `error.response.data.message` → user chỉ thấy generic error, không biết lý do thật (ví dụ "Mật khẩu không chính xác", "Tài khoản không tồn tại").

**Fix** (`lib/authApi.ts`):

```typescript
import { AxiosError } from 'axios';

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(fallback);
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng nhập thất bại');
  }
}
```

Giờ Alert hiện đúng message từ backend (ví dụ "Mật khẩu không chính xác") thay vì "Request failed with status code 401".

### Files thay đổi

| Repo | File | Thay đổi |
|------|------|----------|
| mobile | `.env` (NEW) | `EXPO_PUBLIC_API_URL` với LAN IP |
| mobile | `.gitignore` | Thêm `.env` vào ignore |
| mobile | `lib/authApi.ts` | Thêm `extractErrorMessage()`, wrap API calls trong try-catch |
| backend | `src/server.ts` | `Number(PORT)`, bind `'0.0.0.0'` |

### Bài học / Pattern ghi nhớ

| Vấn đề | Pattern tránh | Pattern đúng |
|---------|---------------|--------------|
| Mobile → backend trên device thật | `localhost` hoặc `10.0.2.2` | LAN IP của máy tính (cùng WiFi) |
| Backend chỉ nhận localhost | `listen(PORT)` | `listen(PORT, '0.0.0.0')` |
| Axios error message | `error.message` (generic) | `error.response.data.message` (backend message) |
| `process.env.PORT` type | `process.env.PORT \|\| 5000` (string \| number) | `Number(process.env.PORT) \|\| 5000` (always number) |
| Expo env var prefix | `NEXT_PUBLIC_*` | `EXPO_PUBLIC_*` |
| Expo physical device | `--tunnel` (ngrok, unreliable) | `--lan` (cùng WiFi, stable) |
