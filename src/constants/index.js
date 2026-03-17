// src/constants/index.js
// Các hằng số dùng chung trong toàn bộ ứng dụng

// ⚠️ QUAN TRỌNG: Thay thế bằng API keys thực của bạn
export const API_KEYS = {
  // Google Maps & Places API key
  // Lấy từ: console.cloud.google.com > APIs & Services > Credentials
  GOOGLE_MAPS: 'YOUR_GOOGLE_MAPS_API_KEY',

  // Gemini AI API key
  // Lấy từ: makersuite.google.com/app/apikey
  GEMINI: 'YOUR_GEMINI_API_KEY',
};

// Khoảng cách tối đa (mét) để mở khóa địa điểm
export const UNLOCK_RADIUS_METERS = 100;

// Màu sắc chủ đạo của ứng dụng - Phong cách giáo dục hiện đại
export const COLORS = {
  // Màu nền chính - Deep Navy (Xanh đậm)
  background: '#0A1628',
  backgroundLight: '#0F1E3A',

  // Màu card
  card: '#132040',
  cardBorder: '#1E3A5F',

  // Màu chủ đạo - Teal/Cyan sáng
  primary: '#00D4AA',
  primaryDark: '#00A882',
  primaryLight: '#7FFFD4',

  // Màu phụ - Vàng amber
  accent: '#FFB347',
  accentDark: '#E8952B',

  // Màu trạng thái
  locked: '#4A5568',
  lockedText: '#718096',
  unlocked: '#00D4AA',

  // Màu văn bản
  textPrimary: '#F0F4FF',
  textSecondary: '#8A9BB5',
  textMuted: '#4A6080',

  // Màu badge thành tích
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  // Màu lỗi/thành công
  success: '#48BB78',
  error: '#FC8181',
  warning: '#F6AD55',

  // Màu gradient
  gradientStart: '#0A1628',
  gradientEnd: '#162447',
};

// Font sizes
export const FONTS = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Dữ liệu mẫu địa điểm du lịch (dùng để seed Firestore hoặc fallback)
// Trong production, dữ liệu này được lấy từ Firestore
export const SAMPLE_DESTINATIONS = [
  {
    id: '1',
    name: 'Văn Miếu - Quốc Tử Giám',
    description: 'Trường đại học đầu tiên của Việt Nam, được xây dựng năm 1070 thời nhà Lý.',
    fullDescription: 'Văn Miếu - Quốc Tử Giám là quần thể di tích đặc biệt quan trọng bậc nhất của Hà Nội. Xây dựng từ năm 1070 đời vua Lý Thánh Tông, đây là nơi thờ phụng Khổng Tử và các bậc hiền triết, đồng thời là trường đại học đầu tiên của Việt Nam.',
    latitude: 21.0275,
    longitude: 105.8347,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Lịch sử',
    city: 'Hà Nội',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Hội An Ancient Town',
    description: 'Phố cổ Hội An - Di sản Văn hóa Thế giới UNESCO với kiến trúc độc đáo.',
    fullDescription: 'Hội An là một thành phố cổ được UNESCO công nhận là Di sản Văn hóa Thế giới. Nơi đây lưu giữ gần như nguyên vẹn kiến trúc đô thị thương cảng truyền thống Đông Nam Á với những con phố nhỏ, nhà cổ, hội quán...',
    latitude: 15.8801,
    longitude: 108.3380,
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    category: 'Di sản',
    city: 'Quảng Nam',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Vịnh Hạ Long',
    description: 'Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi hùng vĩ.',
    fullDescription: 'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên đẹp nhất thế giới, được UNESCO công nhận là Di sản Thiên nhiên Thế giới. Vịnh có diện tích khoảng 1.553 km² với hơn 1.600 hòn đảo đá vôi...',
    latitude: 20.9101,
    longitude: 107.1839,
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    category: 'Thiên nhiên',
    city: 'Quảng Ninh',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Mỹ Sơn Sanctuary',
    description: 'Thánh địa Mỹ Sơn - Di tích Chăm Pa cổ đại huyền bí.',
    fullDescription: 'Thánh địa Mỹ Sơn là quần thể đền tháp Chăm Pa được xây dựng từ thế kỷ 4 đến thế kỷ 13. Đây là nơi cúng tế của vương triều Chăm Pa và là nơi chôn cất của các vị vua, thầy tu có quyền năng...',
    latitude: 15.7767,
    longitude: 108.1233,
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    category: 'Khảo cổ',
    city: 'Quảng Nam',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Hoàng Thành Thăng Long',
    description: 'Khu trung tâm của thành Thăng Long - kinh đô Đại Việt suốt 13 thế kỷ.',
    fullDescription: 'Hoàng thành Thăng Long là di tích quan trọng bậc nhất trong hệ thống các di tích Việt Nam. Đây là công trình kiến trúc đồ sộ, được các triều vua xây dựng trong nhiều giai đoạn lịch sử...',
    latitude: 21.0358,
    longitude: 105.8352,
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    category: 'Lịch sử',
    city: 'Hà Nội',
    rating: 4.7,
  },
  {
    id: '6',
    name: 'Phong Nha - Kẻ Bàng',
    description: 'Vườn quốc gia với hệ thống hang động đẹp nhất thế giới.',
    fullDescription: 'Vườn quốc gia Phong Nha-Kẻ Bàng được UNESCO công nhận là Di sản Thiên nhiên Thế giới. Nơi đây có hệ thống hang động lớn nhất thế giới, trong đó có hang Sơn Đoòng - hang động tự nhiên lớn nhất thế giới...',
    latitude: 17.5553,
    longitude: 106.2801,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'Thiên nhiên',
    city: 'Quảng Bình',
    rating: 4.9,
  },
];

// Cấu hình badge thành tích
export const ACHIEVEMENTS = [
  { id: 'first_unlock', title: 'Khám Phá Đầu Tiên', icon: '🗺️', description: 'Mở khóa địa điểm đầu tiên', requirement: 1 },
  { id: 'explorer', title: 'Nhà Thám Hiểm', icon: '🧭', description: 'Mở khóa 3 địa điểm', requirement: 3 },
  { id: 'adventurer', title: 'Phiêu Lưu Gia', icon: '⛰️', description: 'Mở khóa 5 địa điểm', requirement: 5 },
  { id: 'master', title: 'Bậc Thầy Du Lịch', icon: '🏆', description: 'Mở khóa tất cả địa điểm', requirement: 6 },
];
