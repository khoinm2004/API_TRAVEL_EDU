// src/screens/DestinationDetailScreen.js
// Màn hình chi tiết địa điểm - hiển thị đầy đủ thông tin khi mở khóa

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Alert, Linking, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';

import { useAuth } from '../hooks/useAuth';
import { unlockDestination } from '../services/firestoreService';
import { getCurrentLocation, checkUnlockEligibility, formatDistance } from '../services/locationService';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DestinationDetailScreen = ({ navigation, route }) => {
  const { destination, isUnlocked: initialUnlocked } = route.params;
  const { user, refreshUserData } = useAuth();
  const insets = useSafeAreaInsets();

  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked);
  const [userLocation, setUserLocation] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [distance, setDistance] = useState(null);
  const [canUnlock, setCanUnlock] = useState(false);

  // Animation cho unlock effect
  const unlockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkLocation();
  }, []);

  /**
   * Kiểm tra vị trí người dùng và khả năng mở khóa
   */
  const checkLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
      const { canUnlock: eligible, distance: dist } = checkUnlockEligibility(location, destination);
      setCanUnlock(eligible);
      setDistance(dist);
    }
  };

  /**
   * Thực hiện mở khóa địa điểm
   */
  const handleUnlock = async () => {
    if (!canUnlock) {
      Alert.alert(
        'Chưa thể mở khóa',
        `Bạn cần đến gần ${destination.name} hơn.\nKhoảng cách hiện tại: ${formatDistance(distance)}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setUnlocking(true);
    const result = await unlockDestination(user.uid, destination.id);
    setUnlocking(false);

    if (result.success) {
      setIsUnlocked(true);
      await refreshUserData();

      // Animation mở khóa
      Animated.spring(unlockAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Thông báo thành tích mới
      if (result.newAchievements?.length > 0) {
        const ach = result.newAchievements[0];
        Alert.alert(
          '🏆 Thành tích mới!',
          `Bạn đã đạt được: ${ach.icon} ${ach.title}\n"${ach.description}"`,
          [{ text: 'Tuyệt vời!' }]
        );
      } else {
        Alert.alert('🎉 Đã mở khóa!', `Bạn đã khám phá ${destination.name} thành công!`);
      }
    } else {
      Alert.alert('Lỗi', 'Không thể mở khóa. Vui lòng thử lại.');
    }
  };

  /**
   * Mở Google Maps để điều hướng đến địa điểm
   */
  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${destination.latitude},${destination.longitude}&label=${destination.name}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ.')
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: destination.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(10,22,40,0.8)', COLORS.background]}
            style={styles.heroGradient}
          />

          {/* Nút Back */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Tên và thành phố */}
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{destination.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{destination.name}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.heroCity}>{destination.city}</Text>
              {destination.rating && (
                <>
                  <Text style={styles.dotSep}>·</Text>
                  <Ionicons name="star" size={14} color={COLORS.accent} />
                  <Text style={styles.heroRating}>{destination.rating}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>

          {/* Trạng thái khoảng cách */}
          {distance !== null && !isUnlocked && (
            <View style={[styles.distanceCard, canUnlock && styles.distanceCardNear]}>
              <Ionicons
                name={canUnlock ? 'checkmark-circle' : 'navigate'}
                size={24}
                color={canUnlock ? COLORS.primary : COLORS.accent}
              />
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.distanceCardTitle}>
                  {canUnlock ? 'Bạn đang ở đây!' : 'Khoảng cách đến đây'}
                </Text>
                <Text style={styles.distanceCardValue}>
                  {canUnlock ? 'Nhấn nút bên dưới để mở khóa' : formatDistance(distance)}
                </Text>
              </View>
            </View>
          )}

          {/* Mô tả */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Giới thiệu</Text>
            <Text style={styles.description}>
              {isUnlocked ? destination.fullDescription || destination.description : destination.description}
            </Text>
          </View>

          {/* Nội dung bị khóa */}
          {!isUnlocked && (
            <View style={styles.lockedContent}>
              <View style={styles.lockedBanner}>
                <Ionicons name="lock-closed" size={32} color={COLORS.textMuted} />
                <Text style={styles.lockedTitle}>Nội dung bị khóa</Text>
                <Text style={styles.lockedSubtext}>
                  🚶 Hãy đến thăm {destination.name} để mở khóa:{'\n'}
                  • Thông tin lịch sử và văn hóa đầy đủ{'\n'}
                  • Tính năng học với AI Gemini{'\n'}
                  • Xem vị trí trên bản đồ tương tác{'\n'}
                  • Huy hiệu thành tích
                </Text>
              </View>

              {/* Nút mở khóa */}
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={handleUnlock}
                disabled={unlocking}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={canUnlock ? [COLORS.primary, COLORS.primaryDark] : [COLORS.locked, COLORS.locked]}
                  style={styles.unlockGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={canUnlock ? 'lock-open' : 'lock-closed'} size={20} color="#fff" />
                  <Text style={styles.unlockButtonText}>
                    {unlocking ? 'Đang mở khóa...' : canUnlock ? 'Mở Khóa Ngay!' : 'Cần đến gần hơn'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navigateButton} onPress={openInMaps}>
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
                <Text style={styles.navigateText}>Chỉ đường đến đây</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Nội dung đã mở khóa */}
          {isUnlocked && (
            <>
              {/* Mini Map */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🗺️ Vị trí</Text>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: destination.latitude,
                      longitude: destination.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                      title={destination.name}
                    />
                    {userLocation && (
                      <Circle
                        center={userLocation}
                        radius={100}
                        fillColor={`${COLORS.primary}20`}
                        strokeColor={COLORS.primary}
                        strokeWidth={1}
                      />
                    )}
                  </MapView>
                  <TouchableOpacity style={styles.openMapButton} onPress={openInMaps}>
                    <Ionicons name="open-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.openMapText}>Mở rộng</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nút AI Chat */}
              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => navigation.navigate('AIChat', { destination })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6C63FF', '#4ECDC4']}
                  style={styles.aiGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.aiButtonIcon}>🤖</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiButtonTitle}>Học với AI Gemini</Text>
                    <Text style={styles.aiButtonSubtitle}>Hỏi bất cứ điều gì về {destination.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Nút điều hướng */}
              <TouchableOpacity style={styles.directionsButton} onPress={openInMaps}>
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
                <Text style={styles.directionsText}>Chỉ đường bằng Google Maps</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  heroContainer: { height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: 'absolute', left: SPACING.md,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  heroContent: { position: 'absolute', bottom: SPACING.lg, left: SPACING.md, right: SPACING.md },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, marginBottom: SPACING.xs,
  },
  categoryText: { color: '#fff', fontSize: FONTS.xs, fontWeight: '700' },
  heroTitle: { fontSize: FONTS.xxl, fontWeight: '800', color: '#fff', marginBottom: SPACING.xs },
  heroMeta: { flexDirection: 'row', alignItems: 'center' },
  heroCity: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginLeft: 2 },
  dotSep: { color: COLORS.textMuted, marginHorizontal: SPACING.xs },
  heroRating: { color: COLORS.accent, fontSize: FONTS.sm, fontWeight: '600', marginLeft: 2 },

  content: { padding: SPACING.md },

  distanceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${COLORS.accent}15`, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: `${COLORS.accent}30`,
  },
  distanceCardNear: {
    backgroundColor: `${COLORS.primary}15`, borderColor: `${COLORS.primary}30`,
  },
  distanceCardTitle: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.md },
  distanceCardValue: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 2 },

  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  description: { color: COLORS.textSecondary, fontSize: FONTS.md, lineHeight: 24 },

  lockedContent: { marginBottom: SPACING.lg },
  lockedBanner: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  lockedTitle: { fontSize: FONTS.xl, fontWeight: '700', color: COLORS.textMuted, marginTop: SPACING.sm, marginBottom: SPACING.md },
  lockedSubtext: { color: COLORS.textSecondary, fontSize: FONTS.sm, lineHeight: 22, textAlign: 'left', alignSelf: 'stretch' },

  unlockButton: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm },
  unlockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: SPACING.sm },
  unlockButtonText: { color: '#fff', fontSize: FONTS.lg, fontWeight: '700' },

  navigateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: SPACING.md, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  navigateText: { color: COLORS.primary, fontWeight: '600', marginLeft: SPACING.sm },

  mapContainer: { borderRadius: RADIUS.lg, overflow: 'hidden', height: 180, position: 'relative' },
  map: { width: '100%', height: '100%' },
  openMapButton: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  openMapText: { color: COLORS.primary, fontSize: FONTS.xs, marginLeft: 4 },

  aiButton: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
  aiGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  aiButtonIcon: { fontSize: 28 },
  aiButtonTitle: { color: '#fff', fontWeight: '700', fontSize: FONTS.md },
  aiButtonSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.xs, marginTop: 2 },

  directionsButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: SPACING.md, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
  },
  directionsText: { color: COLORS.primary, fontWeight: '600', marginLeft: SPACING.sm },
});

export default DestinationDetailScreen;
