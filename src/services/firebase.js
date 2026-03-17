// src/services/firebase.js
// Cấu hình và khởi tạo Firebase cho ứng dụng EduTravel

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ QUAN TRỌNG: Thay thế các giá trị này bằng config Firebase của bạn
// Lấy từ: Firebase Console > Project Settings > Your Apps > SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyAHkEG3tF0NimQtyZGnImim2CocbAvp-0M",
  authDomain: "edutravel-cf734.firebaseapp.com",
  projectId: "edutravel-cf734",
  storageBucket: "edutravel-cf734.firebasestorage.app",
  messagingSenderId: "700894660492",
  appId: "1:700894660492:web:68ff0ff027efccd635b8a9",
};
// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Auth với AsyncStorage để lưu session người dùng
// Giúp người dùng không cần đăng nhập lại sau khi đóng app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Khởi tạo Firestore Database
export const db = getFirestore(app);

export default app;
