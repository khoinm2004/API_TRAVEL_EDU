// src/hooks/useAuth.js
// Custom hook và Context để quản lý trạng thái xác thực toàn cục

import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';
import { getUserData } from '../services/firestoreService';

// Tạo Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider - Bao bọc toàn bộ app để chia sẻ trạng thái auth
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           // Thông tin Firebase Auth user
  const [userData, setUserData] = useState(null);   // Dữ liệu user từ Firestore
  const [loading, setLoading] = useState(true);     // Trạng thái đang tải

  useEffect(() => {
    // Lắng nghe thay đổi trạng thái đăng nhập
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Lấy dữ liệu bổ sung từ Firestore
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup subscription khi component unmount
    return unsubscribe;
  }, []);

  /**
   * Cập nhật dữ liệu người dùng sau khi mở khóa địa điểm
   */
  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.uid);
      setUserData(data);
    }
  };

  const value = {
    user,
    userData,
    loading,
    refreshUserData,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook để sử dụng Auth Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};
