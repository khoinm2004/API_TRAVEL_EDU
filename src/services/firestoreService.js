// src/services/firestoreService.js
// Dịch vụ tương tác với Firestore Database

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { SAMPLE_DESTINATIONS, ACHIEVEMENTS } from '../constants';

// ==================== DESTINATIONS ====================

/**
 * Lấy danh sách tất cả địa điểm du lịch từ Firestore
 * Nếu collection rỗng, seed dữ liệu mẫu vào database
 */
export const getDestinations = async () => {
  try {
    const destinationsRef = collection(db, 'destinations');
    const snapshot = await getDocs(destinationsRef);

    // Nếu database rỗng, tự động thêm dữ liệu mẫu
    if (snapshot.empty) {
      await seedDestinations();
      const newSnapshot = await getDocs(destinationsRef);
      return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách địa điểm:', error);
    // Fallback: trả về dữ liệu mẫu nếu không kết nối được Firestore
    return SAMPLE_DESTINATIONS;
  }
};

/**
 * Lấy thông tin chi tiết một địa điểm theo ID
 * @param {string} destinationId
 */
export const getDestinationById = async (destinationId) => {
  try {
    const docRef = doc(db, 'destinations', destinationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin địa điểm:', error);
    return SAMPLE_DESTINATIONS.find(d => d.id === destinationId) || null;
  }
};

/**
 * Seed dữ liệu mẫu vào Firestore (chỉ chạy lần đầu)
 */
const seedDestinations = async () => {
  try {
    const batch = SAMPLE_DESTINATIONS.map(dest =>
      setDoc(doc(db, 'destinations', dest.id), {
        ...dest,
        createdAt: serverTimestamp(),
      })
    );
    await Promise.all(batch);
    console.log('✅ Đã seed dữ liệu địa điểm vào Firestore');
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
  }
};

// ==================== USER DATA ====================

/**
 * Lấy dữ liệu người dùng từ Firestore
 * @param {string} userId
 */
export const getUserData = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    // Tạo mới nếu chưa có document
    const defaultData = {
      uid: userId,
      unlockedLocations: [],
      achievements: [],
      totalUnlocked: 0,
    };
    await setDoc(docRef, defaultData);
    return defaultData;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu người dùng:', error);
    return { unlockedLocations: [], achievements: [], totalUnlocked: 0 };
  }
};

/**
 * Mở khóa một địa điểm cho người dùng
 * Lưu vào Firestore và kiểm tra thành tích mới
 * @param {string} userId
 * @param {string} destinationId
 */
export const unlockDestination = async (userId, destinationId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userData = await getUserData(userId);

    // Kiểm tra xem đã mở khóa chưa
    if (userData.unlockedLocations?.includes(destinationId)) {
      return { success: true, alreadyUnlocked: true };
    }

    const newTotal = (userData.totalUnlocked || 0) + 1;

    // Cập nhật danh sách địa điểm đã mở khóa
    await updateDoc(userRef, {
      unlockedLocations: arrayUnion(destinationId),
      totalUnlocked: newTotal,
      lastUnlockedAt: serverTimestamp(),
    });

    // Kiểm tra và cấp thành tích mới
    const newAchievements = checkAchievements(newTotal, userData.achievements || []);
    if (newAchievements.length > 0) {
      await updateDoc(userRef, {
        achievements: arrayUnion(...newAchievements.map(a => a.id)),
      });
    }

    return {
      success: true,
      newAchievements,
      totalUnlocked: newTotal,
    };
  } catch (error) {
    console.error('Lỗi khi mở khóa địa điểm:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Kiểm tra thành tích mới dựa trên số địa điểm đã mở khóa
 * @param {number} totalUnlocked
 * @param {string[]} currentAchievements
 */
const checkAchievements = (totalUnlocked, currentAchievements) => {
  return ACHIEVEMENTS.filter(achievement =>
    totalUnlocked >= achievement.requirement &&
    !currentAchievements.includes(achievement.id)
  );
};
