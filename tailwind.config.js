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
        // Epilogue cho headings, Be Vietnam Pro cho body, Plus Jakarta Sans cho labels
        sans: ['Epilogue', 'sans-serif'],
        'sans-regular': ['Epilogue-Regular', 'sans-serif'],
        'sans-extrabold': ['Epilogue-ExtraBold', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        'body-semibold': ['BeVietnamPro-SemiBold', 'sans-serif'],
        'body-bold': ['BeVietnamPro-Bold', 'sans-serif'],
        label: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'sans-serif'],
      },
      borderRadius: {
        // SOFT ELEVATION: Bo góc mềm mại, thân thiện hơn
        sm: '0.375rem', // 6px  - Tags, small badges
        md: '0.5rem', // 8px  - Inputs, small buttons
        lg: '0.75rem', // 12px - Standard buttons
        xl: '1rem', // 16px - Cards, containers
        '2xl': '1.25rem', // 20px - Large cards, sections
        '3xl': '1.5rem', // 24px - Modals, hero banners
      },
      spacing: {
        3: '1rem',
        6: '2rem',
        8: '2.75rem',
        10: '3.5rem',
      },
      boxShadow: {
        // SOFT ELEVATION: Hệ thống shadow mềm, khuếch tán tạo chiều sâu nhẹ nhàng
        none: 'none',
        sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
        md: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
