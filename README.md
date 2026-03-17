# 🗺️ EduTravel - Ứng Dụng Du Lịch Giáo Dục

> Khám phá · Học hỏi · Trải nghiệm

EduTravel là ứng dụng di động React Native (Expo) kết hợp du lịch thực tế với học tập. Người dùng phải **đến tận nơi** để mở khóa thông tin về địa điểm, sau đó có thể học thêm qua AI Gemini.

---

## 📁 Cấu Trúc Dự Án

```
EduTravel/
├── App.js                          # Entry point chính
├── app.json                        # Cấu hình Expo
├── package.json                    # Dependencies
├── babel.config.js                 # Babel config
├── firestore.rules                 # Bảo mật Firestore
├── firestore.indexes.json          # Index Firestore
│
└── src/
    ├── constants/
    │   └── index.js                # Hằng số: màu, font, API keys, dữ liệu mẫu
    │
    ├── services/
    │   ├── firebase.js             # Khởi tạo Firebase
    │   ├── authService.js          # Đăng nhập / Đăng ký / Đăng xuất
    │   ├── firestoreService.js     # CRUD Firestore (destinations, users)
    │   ├── geminiService.js        # Tích hợp Gemini AI API
    │   └── locationService.js     # GPS, tính khoảng cách Haversine
    │
    ├── hooks/
    │   └── useAuth.js              # Auth Context + Custom Hook
    │
    ├── navigation/
    │   └── AppNavigator.js         # Stack + Tab Navigator
    │
    └── screens/
        ├── LoginScreen.js          # Màn hình đăng nhập
        ├── RegisterScreen.js       # Màn hình đăng ký
        ├── HomeScreen.js           # Danh sách địa điểm + tiến trình
        ├── MapScreen.js            # Bản đồ toàn màn hình
        ├── DestinationDetailScreen.js  # Chi tiết địa điểm
        ├── AIChatScreen.js         # Chat với Gemini AI
        └── ProfileScreen.js        # Hồ sơ + thành tích
```

---

## ⚙️ Hướng Dẫn Cài Đặt

### Bước 1: Cài đặt Node.js & Expo CLI

```bash
# Cài Node.js từ https://nodejs.org (v18+)

# Cài Expo CLI
npm install -g expo-cli

# Cài Expo Go trên điện thoại (App Store / Google Play)
```

### Bước 2: Clone & cài dependencies

```bash
# Di chuyển vào thư mục dự án
cd EduTravel

# Cài đặt tất cả dependencies
npm install
```

### Bước 3: Cấu hình Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Tạo project mới → **"EduTravel"**
3. **Authentication**: Bật **Email/Password** provider
4. **Firestore**: Tạo database → chọn **Production mode**
5. **Project Settings** → **Your Apps** → **Add App** → chọn Web (`</>`)
6. Copy config vào `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "edutravel-xxxxx.firebaseapp.com",
  projectId: "edutravel-xxxxx",
  storageBucket: "edutravel-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

7. Triển khai Firestore rules:

```bash
# Cài Firebase CLI
npm install -g firebase-tools

# Đăng nhập
firebase login

# Triển khai rules
firebase deploy --only firestore:rules
```

### Bước 4: Cấu hình Google Maps API

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Tạo project hoặc chọn project hiện có
3. **APIs & Services** → **Enable APIs**:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
4. **Credentials** → **Create API Key**
5. Dán vào `src/constants/index.js`:

```javascript
GOOGLE_MAPS: 'AIza_YOUR_MAPS_KEY_HERE',
```

6. Thêm vào `app.json` (Android):

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_MAPS_API_KEY"
    }
  }
}
```

### Bước 5: Cấu hình Gemini AI API

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Dán vào `src/constants/index.js`:

```javascript
GEMINI: 'YOUR_GEMINI_API_KEY_HERE',
```

### Bước 6: Chạy ứng dụng

```bash
# Khởi động Expo dev server
npx expo start

# Quét QR code bằng Expo Go app trên điện thoại
# Hoặc nhấn 'a' để mở Android Emulator
# Hoặc nhấn 'i' để mở iOS Simulator
```

---

## 🗄️ Cấu Trúc Firestore Database

### Collection: `destinations`
```
destinations/
  {destinationId}/
    id: string
    name: string              # "Văn Miếu - Quốc Tử Giám"
    description: string       # Mô tả ngắn
    fullDescription: string   # Mô tả đầy đủ (hiện khi mở khóa)
    latitude: number          # 21.0275
    longitude: number         # 105.8347
    imageUrl: string          # URL ảnh
    category: string          # "Lịch sử" | "Di sản" | "Thiên nhiên"
    city: string              # "Hà Nội"
    rating: number            # 4.8
    createdAt: timestamp
```

### Collection: `users`
```
users/
  {userId}/
    uid: string               # Firebase Auth UID
    email: string
    displayName: string
    unlockedLocations: array  # ["dest1", "dest2", ...]
    achievements: array       # ["first_unlock", "explorer", ...]
    totalUnlocked: number     # 3
    createdAt: timestamp
    lastUnlockedAt: timestamp
```

---

## 🔑 Các Tính Năng Chính

| Tính năng | Mô tả | File |
|-----------|-------|------|
| 🔐 Authentication | Email/Password với Firebase | `authService.js` |
| 🏠 Home Screen | Danh sách địa điểm, lọc, tiến trình | `HomeScreen.js` |
| 🗺️ Bản đồ | Markers, vòng tròn 100m, điều hướng | `MapScreen.js` |
| 📍 GPS Unlock | Haversine distance, 100m radius | `locationService.js` |
| 📖 Chi tiết | Nội dung đầy đủ khi mở khóa | `DestinationDetailScreen.js` |
| 🤖 AI Chat | Gemini API, giao diện chat | `AIChatScreen.js` |
| 🏆 Thành tích | 4 level badge, progress tracking | `ProfileScreen.js` |

---

## 🧮 Thuật Toán Tính Khoảng Cách (Haversine)

```javascript
// Công thức Haversine tính khoảng cách giữa 2 tọa độ GPS
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Bán kính Trái Đất (mét)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};
// Mở khóa khi distance <= 100 mét
```

---

## 🤖 Tích Hợp Gemini AI

```javascript
// Ví dụ gọi Gemini API
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Giải thích lịch sử, văn hóa của ${destinationName}...` }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  }
);
```

---

## 🏆 Hệ Thống Thành Tích

| Badge | Icon | Yêu cầu |
|-------|------|---------|
| Khám Phá Đầu Tiên | 🗺️ | Mở khóa 1 địa điểm |
| Nhà Thám Hiểm | 🧭 | Mở khóa 3 địa điểm |
| Phiêu Lưu Gia | ⛰️ | Mở khóa 5 địa điểm |
| Bậc Thầy Du Lịch | 🏆 | Mở khóa tất cả |

---

## 📱 Yêu Cầu Hệ Thống

- Node.js >= 18
- Expo SDK 51
- iOS 13+ / Android 6.0+
- Thiết bị thật (GPS) hoặc Emulator có giả lập GPS

---

## 🌏 Địa Điểm Mẫu

| # | Tên | Tỉnh/Thành | Category |
|---|-----|------------|---------|
| 1 | Văn Miếu - Quốc Tử Giám | Hà Nội | Lịch sử |
| 2 | Hội An Ancient Town | Quảng Nam | Di sản |
| 3 | Vịnh Hạ Long | Quảng Ninh | Thiên nhiên |
| 4 | Mỹ Sơn Sanctuary | Quảng Nam | Khảo cổ |
| 5 | Hoàng Thành Thăng Long | Hà Nội | Lịch sử |
| 6 | Phong Nha - Kẻ Bàng | Quảng Bình | Thiên nhiên |

---

## 🐛 Lỗi Thường Gặp

**GPS không hoạt động trên Emulator:**
```
Dùng: Android Studio → Extended Controls → Location → Set Location
```

**Firebase permission denied:**
```
Kiểm tra Firestore Rules và đảm bảo đã đăng nhập
```

**Gemini API 400 error:**
```
Kiểm tra API key và đảm bảo đã bật Gemini API trong Google Cloud Console
```

**Maps không hiển thị (Android):**
```
Thêm Google Maps API key vào app.json > android.config.googleMaps
```

---

*Made with ❤️ for Vietnamese cultural heritage education*
