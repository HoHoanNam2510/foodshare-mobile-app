# Translation Progress Tracker

Tracking i18n (VN ↔ EN) integration across all UI screens and components in `foodshare-mobile-app`.

- ✅ Done
- ⬜ Not yet done
- ➖ No user-facing text (layout/types/data files — skip)

---

## Phase Plan

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | i18n infrastructure + `(auth)`, `(chat)`, `(leaderboard)`, `(post)` screens + core chat components | ✅ Done |
| **Phase 2** | `(tabs)` screens + `components/home/` + `components/explore/` | ⬜ |
| **Phase 3** | `(profile)` screens + `components/profile/` + shared components | ⬜ |
| **Phase 4** | `(transaction)`, `(review)`, `(report)` screens + related components | ⬜ |
| **Phase 5** | `(voucher)` screens + `components/voucher/` + `components/map/` | ⬜ |

---

## app/

| File | Status |
|------|--------|
| `app/_layout.tsx` | ➖ |
| `app/index.tsx` | ➖ |
| `app/global.css` | ➖ |

### app/(auth)/ — Phase 1 ✅

| File | Status |
|------|--------|
| `(auth)/_layout.tsx` | ➖ |
| `(auth)/login.tsx` | ✅ |
| `(auth)/register.tsx` | ✅ |

### app/(chat)/ — Phase 1 ✅

| File | Status |
|------|--------|
| `(chat)/_layout.tsx` | ➖ |
| `(chat)/chat-detail.tsx` | ✅ |

### app/(leaderboard)/ — Phase 1 ✅

| File | Status |
|------|--------|
| `(leaderboard)/_layout.tsx` | ➖ |
| `(leaderboard)/leaderboard.tsx` | ✅ |

### app/(post)/ — Phase 1 ✅

| File | Status |
|------|--------|
| `(post)/_layout.tsx` | ➖ |
| `(post)/create-post.tsx` | ✅ |
| `(post)/edit-post.tsx` | ✅ |
| `(post)/post-detail.tsx` | ✅ |

### app/(tabs)/ — Phase 2

| File | Status |
|------|--------|
| `(tabs)/_layout.tsx` | ➖ |
| `(tabs)/home.tsx` | ⬜ |
| `(tabs)/explore.tsx` | ⬜ |
| `(tabs)/chat.tsx` | ⬜ |
| `(tabs)/post.tsx` | ⬜ |

### app/(profile)/ — Phase 3

| File | Status |
|------|--------|
| `(profile)/_layout.tsx` | ➖ |
| `(profile)/profile.tsx` | ⬜ |
| `(profile)/edit-profile.tsx` | ⬜ |
| `(profile)/register-store.tsx` | ⬜ |
| `(profile)/badges.tsx` | ⬜ |

### app/(transaction)/ — Phase 4

| File | Status |
|------|--------|
| `(transaction)/_layout.tsx` | ➖ |
| `(transaction)/transaction-list.tsx` | ⬜ |
| `(transaction)/transaction-detail.tsx` | ⬜ |
| `(transaction)/payment.tsx` | ⬜ |
| `(transaction)/payment-result.tsx` | ⬜ |

### app/(review)/ — Phase 4

| File | Status |
|------|--------|
| `(review)/_layout.tsx` | ➖ |
| `(review)/create-review.tsx` | ⬜ |
| `(review)/my-reviews.tsx` | ⬜ |

### app/(report)/ — Phase 4

| File | Status |
|------|--------|
| `(report)/_layout.tsx` | ➖ |
| `(report)/create-report.tsx` | ⬜ |
| `(report)/my-reports.tsx` | ⬜ |
| `(report)/report-detail.tsx` | ⬜ |

### app/(voucher)/ — Phase 5

| File | Status |
|------|--------|
| `(voucher)/_layout.tsx` | ➖ |
| `(voucher)/my-vouchers.tsx` | ⬜ |
| `(voucher)/voucher-market.tsx` | ⬜ |
| `(voucher)/voucher-detail.tsx` | ⬜ |
| `(voucher)/create-voucher.tsx` | ⬜ |
| `(voucher)/edit-voucher.tsx` | ⬜ |
| `(voucher)/store-vouchers.tsx` | ⬜ |
| `(voucher)/point-history.tsx` | ⬜ |

---

## components/

### components/shared/ — Phase 3

| File | Status |
|------|--------|
| `shared/MenuDrawer.tsx` | ✅ |
| `shared/CustomTabBar.tsx` | ✅ |
| `shared/FormInput.tsx` | ⬜ |
| `shared/SectionLabel.tsx` | ⬜ |
| `shared/SelectPostTypeModal.tsx` | ⬜ |
| `shared/BadgeUnlockToast.tsx` | ⬜ |
| `shared/DateTimePickerModal.tsx` | ⬜ |
| `shared/TranslatedText.tsx` | ➖ |
| `shared/headers/BaseHeader.tsx` | ⬜ |
| `shared/headers/StackHeader.tsx` | ⬜ |
| `shared/headers/MainHeader.tsx` | ⬜ |
| `shared/headers/ManagementHeader.tsx` | ⬜ |

### components/auth/ — Phase 1 ✅

| File | Status |
|------|--------|
| `auth/EmailVerifyModal.tsx` | ⬜ |

### components/home/ — Phase 2

| File | Status |
|------|--------|
| `home/HeroBanner.tsx` | ⬜ |
| `home/FreshlyShared.tsx` | ⬜ |
| `home/FilterPills.tsx` | ⬜ |
| `home/ImpactBanner.tsx` | ⬜ |
| `home/GuideSection.tsx` | ⬜ |
| `home/MarketTeaser.tsx` | ⬜ |

### components/explore/ — Phase 2

| File | Status |
|------|--------|
| `explore/SearchFilterBar.tsx` | ⬜ |
| `explore/ExploreListView.tsx` | ⬜ |
| `explore/ExploreMapView.tsx` | ⬜ |
| `explore/PostCard.tsx` | ⬜ |
| `explore/MapPreviewCard.tsx` | ⬜ |
| `explore/ViewToggle.tsx` | ⬜ |
| `explore/MapMarker.tsx` | ➖ |
| `explore/types.ts` | ➖ |
| `explore/mockData.ts` | ➖ |

### components/post/ — Phase 1 ✅

| File | Status |
|------|--------|
| `post/CategoryPicker.tsx` | ⬜ |
| `post/ImagePickerSection.tsx` | ⬜ |
| `post/QuantityStepper.tsx` | ⬜ |
| `post/PasscodeModal.tsx` | ⬜ |

### components/chat/ — Phase 1 ✅

| File | Status |
|------|--------|
| `chat/ChatHeader.tsx` | ✅ |
| `chat/ChatInput.tsx` | ✅ |
| `chat/MessageBubble.tsx` | ⬜ |

### components/profile/ — Phase 3

| File | Status |
|------|--------|
| `profile/ProfileHeader.tsx` | ⬜ |
| `profile/ProfileActions.tsx` | ⬜ |
| `profile/RecentPosts.tsx` | ⬜ |
| `profile/ContactCard.tsx` | ⬜ |
| `profile/StoreDetailsCard.tsx` | ⬜ |
| `profile/VerificationCard.tsx` | ⬜ |
| `profile/IdentityCard.tsx` | ⬜ |
| `profile/BadgesRow.tsx` | ⬜ |
| `profile/SectionIncompleteBadge.tsx` | ⬜ |

### components/review/ — Phase 4

| File | Status |
|------|--------|
| `review/ReviewCard.tsx` | ⬜ |
| `review/StarRating.tsx` | ➖ |

### components/voucher/ — Phase 5

| File | Status |
|------|--------|
| `voucher/VoucherCard.tsx` | ⬜ |
| `voucher/VoucherStatusBadge.tsx` | ⬜ |
| `voucher/VoucherDiscountBadge.tsx` | ⬜ |
| `voucher/VoucherExpiryTag.tsx` | ⬜ |
| `voucher/VoucherPointCost.tsx` | ⬜ |
| `voucher/VoucherQuantityBar.tsx` | ⬜ |
| `voucher/RedeemConfirmModal.tsx` | ⬜ |
| `voucher/PointHistoryItem.tsx` | ⬜ |

### components/map/ — Phase 5

| File | Status |
|------|--------|
| `map/GoongMapView.tsx` | ➖ |
| `map/GoongMapView.android.tsx` | ➖ |
| `map/GoongMapView.ios.tsx` | ➖ |
| `map/LocationPickerSheet.tsx` | ⬜ |
| `map/LocationPickerSheet.android.tsx` | ⬜ |
| `map/LocationPickerSheet.ios.tsx` | ⬜ |
| `map/AddressAutocomplete.tsx` | ⬜ |
| `map/RadiusFilter.tsx` | ⬜ |
| `map/PostMarker.tsx` | ➖ |
| `map/PostMarker.android.tsx` | ➖ |
| `map/PostMarker.ios.tsx` | ➖ |
| `map/PostPreviewCard.tsx` | ⬜ |
| `map/PostDetailMap.tsx` | ➖ |
| `map/PostDetailMap.android.tsx` | ➖ |
| `map/PostDetailMap.ios.tsx` | ➖ |
| `map/types.ts` | ➖ |

---

## Summary

| Group | Done | Total |
|-------|------|-------|
| app/(auth) | 2 | 2 |
| app/(chat) | 1 | 1 |
| app/(leaderboard) | 1 | 1 |
| app/(post) | 3 | 3 |
| app/(tabs) | 0 | 4 |
| app/(profile) | 0 | 4 |
| app/(transaction) | 0 | 4 |
| app/(review) | 0 | 2 |
| app/(report) | 0 | 3 |
| app/(voucher) | 0 | 7 |
| components/shared | 2 | 11 |
| components/auth | 0 | 1 |
| components/home | 0 | 6 |
| components/explore | 0 | 6 |
| components/post | 0 | 4 |
| components/chat | 2 | 3 |
| components/profile | 0 | 9 |
| components/review | 0 | 1 |
| components/voucher | 0 | 8 |
| components/map | 0 | 6 |
| **Total** | **11** | **86** |
