/**
 * Script tự động phát hiện IP LAN hiện tại và cập nhật file .env
 * Chạy: npx ts-node scripts/update-api-url.ts
 * Hoặc:  node -e "require('./scripts/update-api-url')"
 */
/* eslint-env node */
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Bỏ qua loopback và IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const ip = getLanIp();
if (!ip) {
  console.error('❌ Không tìm thấy địa chỉ IP LAN. Kiểm tra kết nối mạng.');
  process.exit(1);
}

const port = process.env.BACKEND_PORT || '5000';
const newUrl = `http://${ip}:${port}`;

const envPath = path.resolve(__dirname, '..', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

if (envContent.includes('EXPO_PUBLIC_API_URL=')) {
  envContent = envContent.replace(
    /EXPO_PUBLIC_API_URL=.*/,
    `EXPO_PUBLIC_API_URL=${newUrl}`
  );
} else {
  envContent += `\nEXPO_PUBLIC_API_URL=${newUrl}\n`;
}

fs.writeFileSync(envPath, envContent, 'utf-8');
console.log(`✅ Đã cập nhật EXPO_PUBLIC_API_URL=${newUrl}`);
console.log('⚠️  Cần restart Expo để áp dụng thay đổi (npx expo start -c)');
