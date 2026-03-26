/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // HỆ MÀU 13 SẮC ĐỘ (T0-T100) - The Editorial Harvest
        primary: {
          DEFAULT: '#72B866',
          T0: '#000000',
          T10: '#002201',
          T20: '#003A03',
          T30: '#0A530C',
          T40: '#296C24',
          T50: '#42863A',
          T60: '#5CA051',
          T70: '#76BC69',
          T80: '#90D882',
          T90: '#ABF59C',
          T95: '#CAFFBB',
          T100: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EC8632',
          T0: '#000000',
          T10: '#301400',
          T20: '#4F2500',
          T30: '#713700',
          T40: '#944A00',
          T50: '#B95F03',
          T60: '#D97723',
          T70: '#FA913C',
          T80: '#FFB784',
          T90: '#FFDCC6',
          T95: '#FFEDE4',
          T100: '#FFFFFF',
        },
        tertiary: {
          DEFAULT: '#EF86B5',
          T0: '#000000',
          T10: '#3D0024',
          T20: '#5E0D3B',
          T30: '#7B2752',
          T40: '#983F6A',
          T50: '#B65784',
          T60: '#D4709E',
          T70: '#F48AB9',
          T80: '#FFB0D0',
          T90: '#FFD8E6',
          T95: '#FFECF1',
          T100: '#FFFFFF',
        },
        neutral: {
          DEFAULT: '#F8F9F8',
          T0: '#000000',
          T10: '#191C1C',
          T20: '#2E3131',
          T30: '#454747',
          T40: '#5C5F5E',
          T50: '#757777',
          T60: '#8F9190',
          T70: '#AAABAB',
          T80: '#C5C7C6',
          T90: '#E1E3E2',
          T95: '#F0F1F0',
          T100: '#FFFFFF',
        },
        error: {
          DEFAULT: '#ba1a1a',
        },
      },
      fontFamily: {
        // Giữ nguyên Epilogue & Be Vietnam Pro vì phù hợp xuất sắc với Flat Design
        sans: ['Epilogue', 'sans-serif'],
        'sans-regular': ['Epilogue-Regular', 'sans-serif'],
        'sans-extrabold': ['Epilogue-ExtraBold', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        'body-semibold': ['BeVietnamPro-SemiBold', 'sans-serif'],
        'body-bold': ['BeVietnamPro-Bold', 'sans-serif'],
        label: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'sans-serif'],
      },
      borderRadius: {
        // CẬP NHẬT FLAT DESIGN: Bo góc nhỏ lại, vuông vức và hình học hơn
        sm: '0.25rem', // 4px
        md: '0.5rem', // 8px - Dùng cho Input, Label nhỏ
        lg: '0.75rem', // 12px - Dùng cho Button
        xl: '1rem', // 16px - Dùng cho Card tiêu chuẩn
        '2xl': '1.5rem', // 24px - Dùng cho Hero Banner
      },
      spacing: {
        3: '1rem',
        6: '2rem',
        8: '2.75rem',
        10: '3.5rem',
      },
      boxShadow: {
        // FLAT DESIGN: Tiêu diệt toàn bộ shadow
        none: 'none',
      },
    },
  },
  plugins: [],
};
