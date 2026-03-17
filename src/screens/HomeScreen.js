// src/screens/HomeScreen.js
// Màn hình chính - Hiển thị danh sách địa điểm du lịch

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, RefreshControl, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { getDestinations } from '../services/firestoreService';
import { getCurrentLocation, checkUnlockEligibility, formatDistance } from '../services/locationService';
import { COLORS, FONTS, SPACING, RADIUS, ACHIEVEMENTS } from '../constants';

const HomeScreen = ({ navigation }) => {
  const { user, userData, refreshUserData } = useAuth();
  const insets = useSafeAreaInsets();

  const [destinations, setDestinations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Danh sách categories
  const categories = ['Tất cả', 'Lịch sử', 'Di sản', 'Thiên nhiên', 'Khảo cổ'];

  // Số địa điểm đã mở khóa
  const totalUnlocked = userData?.unlockedLocations?.length || 0;
  const totalDestinations = destinations.length;

  /**
   * Tải danh sách địa điểm và vị trí người dùng
   */
  const loadData = useCallback(async () => {
    try {
      // Tải dữ liệu song song để tối ưu hiệu suất
      const [dests, location] = await Promise.all([
        getDestinations(),
        getCurrentLocation(),
      ]);

      setDestinations(dests);
      setUserLocation(location);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshUserData()]);
  };

  /**
   * Kiểm tra trạng thái mở khóa của địa điểm
   */
  const isUnlocked = (destinationId) => {
    return userData?.unlockedLocations?.includes(destinationId) || false;
  };

  /**
   * Lọc địa điểm theo category
   */
  const filteredDestinations = destinations.filter(dest =>
    selectedCategory === 'Tất cả' || dest.category === selectedCategory
  );

  /**
   * Render thanh tiến trình
   */
  const renderProgressBar = () => {
    const progress = totalDestinations > 0 ? totalUnlocked / totalDestinations : 0;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            🏆 Đã khám phá: <Text style={styles.progressCount}>{totalUnlocked}/{totalDestinations}</Text> địa điểm
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    );
  };

  /**
   * Render một card địa điểm
   */
  const renderDestinationCard = ({ item }) => {
    const unlocked = isUnlocked(item.id);
    const { distance } = userLocation
      ? checkUnlockEligibility(userLocation, item)
      : { distance: null };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DestinationDetail', {
          destination: item,
          isUnlocked: unlocked,
        })}
        activeOpacity={0.85}
      >
        {/* Ảnh địa điểm */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {/* Overlay khi chưa mở khóa */}
          {!unlocked && (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={28} color="#fff" />
            </View>
          )}
          {/* Badge category */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          {/* Badge đã mở khóa */}
          {unlocked && (
            <View style={styles.unlockedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.unlockedText}> Đã khám phá</Text>
            </View>
          )}
        </View>

        {/* Nội dung card */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color={COLORS.accent} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.cityText}>{item.city}</Text>
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>

          {/* Khoảng cách từ vị trí người dùng */}
          {distance !== null && (
            <View style={styles.distanceRow}>
              <Ionicons
                name={distance <= 100 ? 'navigate-circle' : 'navigate-outline'}
                size={14}
                color={distance <= 100 ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.distanceText, distance <= 100 && styles.nearText]}>
                {distance <= 100 ? '🎉 Bạn đang ở đây! Mở khóa ngay!' : formatDistance(distance)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render header của màn hình
   */
  const ListHeader = () => (
    <View>
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetingText}>Xin chào, {user?.displayName?.split(' ')[0] || 'Nhà Du Hành'}! 👋</Text>
          <Text style={styles.greetingSubtext}>Hôm nay bạn muốn khám phá đâu?</Text>
        </View>
        {userLocation && (
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.locationBadgeText}>GPS bật</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      {renderProgressBar()}

      {/* Achievement badges */}
      {userData?.achievements?.length > 0 && (
        <View style={styles.achievementsRow}>
          <Text style={styles.sectionLabel}>Thành tích của bạn:</Text>
          <View style={styles.badgeRow}>
            {userData.achievements.map(achId => {
              const ach = ACHIEVEMENTS.find(a => a.id === achId);
              return ach ? (
                <View key={achId} style={styles.badge}>
                  <Text style={styles.badgeIcon}>{ach.icon}</Text>
                </View>
              ) : null;
            })}
          </View>
        </View>
      )}

      {/* Category filter */}
      <View>
        <Text style={styles.sectionLabel}>Danh mục:</Text>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: SPACING.sm }}
        />
      </View>

      <Text style={styles.sectionLabel}>
        {filteredDestinations.length} địa điểm{selectedCategory !== 'Tất cả' ? ` · ${selectedCategory}` : ''}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải địa điểm...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={filteredDestinations}
        keyExtractor={item => item.id}
        renderItem={renderDestinationCard}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>Không có địa điểm nào trong danh mục này</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.md },
  listContent: { padding: SPACING.md, paddingBottom: 80 },

  greeting: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greetingText: { fontSize: FONTS.xl, fontWeight: '700', color: COLORS.textPrimary },
  greetingSubtext: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginTop: 2 },
  locationBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  locationBadgeText: { color: COLORS.primary, fontSize: FONTS.xs, marginLeft: 2, fontWeight: '600' },

  progressContainer: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressText: { color: COLORS.textSecondary, fontSize: FONTS.md },
  progressCount: { color: COLORS.primary, fontWeight: '700' },
  progressPercent: { color: COLORS.accent, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: RADIUS.full, minWidth: 8 },

  achievementsRow: { marginBottom: SPACING.md },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.xs },
  badge: {
    width: 36, height: 36, borderRadius: RADIUS.full,
    backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  badgeIcon: { fontSize: 18 },

  sectionLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.sm },

  categoryChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginRight: SPACING.sm,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },

  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, overflow: 'hidden',
  },
  imageContainer: { height: 180, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
  },
  categoryBadgeText: { color: '#fff', fontSize: FONTS.xs, fontWeight: '600' },
  unlockedBadge: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
  },
  unlockedText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '600' },

  cardContent: { padding: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { flex: 1, fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary, marginRight: SPACING.sm },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.accent}20`, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  ratingText: { color: COLORS.accent, fontSize: FONTS.xs, fontWeight: '700', marginLeft: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  cityText: { color: COLORS.textMuted, fontSize: FONTS.xs, marginLeft: 2 },
  cardDescription: { color: COLORS.textSecondary, fontSize: FONTS.sm, lineHeight: 20 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  distanceText: { color: COLORS.textMuted, fontSize: FONTS.xs, marginLeft: 4 },
  nearText: { color: COLORS.primary, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.md, textAlign: 'center' },
});

export default HomeScreen;
