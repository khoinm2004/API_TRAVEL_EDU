// src/services/locationService.js
// Dịch vụ quản lý vị trí GPS và tính khoảng cách

import * as Location from 'expo-location';
import { UNLOCK_RADIUS_METERS } from '../constants';

/**
 * Yêu cầu quyền truy cập vị trí từ người dùng
 * @returns {boolean} - true nếu được cấp quyền
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền vị trí:', error);
    return false;
  }
};

/**
 * Lấy vị trí hiện tại của người dùng
 * @returns {Object|null} - { latitude, longitude } hoặc null
 */
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Không có quyền truy cập vị trí');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Độ chính xác cao để mở khóa chính xác
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy, // Độ chính xác GPS (mét)
    };
  } catch (error) {
    console.error('Lỗi khi lấy vị trí:', error);
    return null;
  }
};

/**
 * Theo dõi vị trí người dùng theo thời gian thực
 * @param {function} onLocationUpdate - Callback khi vị trí thay đổi
 * @returns {function} - Hàm để dừng theo dõi
 */
export const watchUserLocation = async (onLocationUpdate) => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,        // Cập nhật mỗi 10 giây
        distanceInterval: 10,       // Hoặc khi di chuyển > 10 mét
      },
      (location) => {
        onLocationUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });
      }
    );

    // Trả về hàm để hủy subscription
    return () => subscription.remove();
  } catch (error) {
    console.error('Lỗi khi theo dõi vị trí:', error);
    return null;
  }
};

/**
 * Tính khoảng cách giữa 2 tọa độ GPS bằng công thức Haversine
 * @param {number} lat1 - Vĩ độ điểm 1
 * @param {number} lon1 - Kinh độ điểm 1
 * @param {number} lat2 - Vĩ độ điểm 2
 * @param {number} lon2 - Kinh độ điểm 2
 * @returns {number} - Khoảng cách tính bằng mét
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Bán kính Trái Đất (mét)

  // Chuyển đổi độ sang radian
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Công thức Haversine
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng mét
};

/**
 * Kiểm tra xem người dùng có trong vùng mở khóa của địa điểm không
 * @param {Object} userLocation - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @returns {Object} - { canUnlock: boolean, distance: number }
 */
export const checkUnlockEligibility = (userLocation, destination) => {
  if (!userLocation) {
    return { canUnlock: false, distance: null };
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    destination.latitude,
    destination.longitude
  );

  return {
    canUnlock: distance <= UNLOCK_RADIUS_METERS,
    distance: Math.round(distance),
  };
};

/**
 * Format khoảng cách để hiển thị
 * @param {number} meters - Khoảng cách tính bằng mét
 */
export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return 'Không xác định';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};
