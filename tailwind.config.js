/** @type {import('tailwindcss').Config} */
module.exports = {
  // Đường dẫn quét các class của Nativewind
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Hệ màu Primary (The Stem)
        primary: {
          DEFAULT: '#72B866', // Xanh lá sáng (Artisanal Sprout)
          dark: '#296C24', // Xanh lá đậm dùng cho Text/Banner
        },
        // Hệ màu Secondary (The Zest) - Dùng cho các badge cảnh báo, điểm nhấn
        secondary: {
          DEFAULT: '#EC8632', // Cam
        },
        // Hệ màu Tertiary
        tertiary: {
          DEFAULT: '#EF86B5', // Hồng
        },
        // Hệ màu Neutral (The Soil) - Dùng cho Background và Card
        surface: {
          DEFAULT: '#F8F9F8', // Màu nền tổng thể của app
          lowest: '#FFFFFF', // Màu nền của các thẻ (Card) nổi lên trên
        },
      },
      fontFamily: {
        // Áp dụng đúng quy tắc The Living Magazine
        sans: ['Epilogue', 'sans-serif'], // Dùng cho Display & Headlines
        body: ['"Be Vietnam Pro"', 'sans-serif'], // Dùng cho Titles & Body
      },
    },
  },
  plugins: [],
};
