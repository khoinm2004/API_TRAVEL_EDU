// src/services/authService.js
// Dịch vụ xác thực người dùng sử dụng Firebase Authentication

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Đăng ký tài khoản mới
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @param {string} displayName - Tên hiển thị
 */
export const registerUser = async (email, password, displayName) => {
  try {
    // Tạo tài khoản Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Cập nhật tên hiển thị
    await updateProfile(user, { displayName });

    // Tạo document user trong Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      unlockedLocations: [],        // Danh sách địa điểm đã mở khóa
      achievements: [],              // Danh sách thành tích đạt được
      totalUnlocked: 0,             // Tổng số địa điểm đã mở khóa
      createdAt: serverTimestamp(), // Thời gian tạo tài khoản
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

/**
 * Đăng nhập bằng email và mật khẩu
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

/**
 * Đăng xuất người dùng
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Lắng nghe thay đổi trạng thái xác thực
 * @param {function} callback - Hàm callback nhận user hoặc null
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Chuyển đổi mã lỗi Firebase sang thông báo tiếng Việt
 * @param {string} errorCode - Mã lỗi Firebase
 */
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/wrong-password': 'Mật khẩu không chính xác.',
    'auth/email-already-in-use': 'Email này đã được sử dụng.',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
    'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng thử lại.',
  };
  return errorMessages[errorCode] || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
};
