# Hướng dẫn kết nối Device thật với Backend

## Điều kiện

- Điện thoại và máy tính **cùng mạng WiFi**
- Backend server đang chạy (`npm run dev` trong `foodshare-backend-server`)

## Các bước kết nối

### 1. Cập nhật IP LAN hiện tại

```bash
cd foodshare-mobile-app
npm run update-ip
```

Script sẽ tự phát hiện IP LAN và ghi vào file `.env`:

```
✅ Đã cập nhật EXPO_PUBLIC_API_URL=http://<IP-hiện-tại>:5000
```

### 2. Start Expo (clear cache)

```bash
npx expo start -c
```

Flag `-c` (clear cache) **bắt buộc** sau khi đổi `.env` vì Metro bundler cache giá trị biến môi trường cũ.

### 3. Scan QR code trên điện thoại

Mở Expo Go → Scan QR → App sẽ kết nối tới backend qua IP LAN.

## Khi nào cần chạy lại `npm run update-ip`?

- Đổi mạng WiFi
- Restart router / DHCP cấp IP mới
- Kết nối bị lỗi timeout hoặc network error

## Troubleshooting

| Vấn đề                         | Giải pháp                                                                  |
| ------------------------------ | -------------------------------------------------------------------------- |
| App không gọi được API         | Chạy `npm run update-ip` rồi `npx expo start -c`                           |
| `Network Error` / `timeout`    | Kiểm tra điện thoại và máy tính cùng WiFi                                  |
| Backend không hiện log request | Kiểm tra backend đang chạy (`npm run dev`)                                 |
| IP đúng nhưng vẫn lỗi          | Tắt firewall hoặc cho phép port 5000                                       |
| Sau logout login lại bị lỗi    | Kiểm tra log backend terminal — giờ đã có morgan + winston ghi mọi request |

## Cấu trúc logging phía Backend

- **Morgan**: ghi log mọi HTTP request (method, URL, status code, response time)
- **Winston** (`src/utils/logger.ts`): structured logging với timestamp, colorize, stack trace
- **Global error handler** trong `server.ts`: bắt mọi lỗi unhandled và log đầy đủ

Ví dụ output log backend:

```
2026-04-01 14:30:00 [info]: POST /api/auth/login 200 12 - 45.123 ms
2026-04-01 14:30:05 [error]: POST /api/auth/logout — Token không hợp lệ
```
