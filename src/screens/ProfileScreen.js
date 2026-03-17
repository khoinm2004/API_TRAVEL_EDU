// src/screens/ProfileScreen.js
// Màn hình hồ sơ người dùng - Thống kê và thành tích

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';
import { COLORS, FONTS, SPACING, RADIUS, ACHIEVEMENTS, SAMPLE_DESTINATIONS } from '../constants';

const ProfileScreen = () => {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();

  const totalUnlocked = userData?.unlockedLocations?.length || 0;
  const totalDestinations = SAMPLE_DESTINATIONS.length;
  const progressPercent = Math.round((totalUnlocked / totalDestinations) * 100);
  const userAchievements = userData?.achievements || [];

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
          },
        },
      ]
    );
  };

  /**
   * Tính level người dùng dựa trên số địa điểm đã mở khóa
   */
  const getUserLevel = () => {
    if (totalUnlocked === 0) return { level: 'Người mới', icon: '🌱', color: COLORS.textMuted };
    if (totalUnlocked < 2) return { level: 'Nhà Thám Hiểm', icon: '🧭', color: COLORS.accent };
    if (totalUnlocked < 4) return { level: 'Phiêu Lưu Gia', icon: '⛰️', color: COLORS.primary };
    return { level: 'Bậc Thầy Du Lịch', icon: '🏆', color: COLORS.gold };
  };

  const userLevel = getUserLevel();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Header */}
        <LinearGradient
          colors={[COLORS.backgroundLight, COLORS.card]}
          style={styles.profileHeader}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || '?'}
            </Text>
            <View style={styles.levelBadge}>
              <Text>{userLevel.icon}</Text>
            </View>
          </View>

          <Text style={styles.displayName}>{user?.displayName || 'Người dùng'}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.levelContainer}>
            <Text style={[styles.levelText, { color: userLevel.color }]}>{userLevel.level}</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalUnlocked}</Text>
            <Text style={styles.statLabel}>Đã Mở Khóa</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDestinations - totalUnlocked}</Text>
            <Text style={styles.statLabel}>Chưa Khám Phá</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userAchievements.length}</Text>
            <Text style={styles.statLabel}>Thành Tích</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Tiến Trình Khám Phá</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {totalUnlocked}/{totalDestinations} địa điểm
              </Text>
              <Text style={[styles.progressPercent, { color: progressPercent === 100 ? COLORS.gold : COLORS.primary }]}>
                {progressPercent}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={progressPercent === 100 ? [COLORS.gold, COLORS.accent] : [COLORS.primary, COLORS.accent]}
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            {progressPercent === 100 ? (
              <Text style={styles.progressComplete}>🎉 Bạn đã khám phá tất cả địa điểm!</Text>
            ) : (
              <Text style={styles.progressRemaining}>
                Còn {totalDestinations - totalUnlocked} địa điểm nữa để hoàn thành!
              </Text>
            )}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Thành Tích</Text>
          {ACHIEVEMENTS.map(achievement => {
            const earned = userAchievements.includes(achievement.id);
            return (
              <View key={achievement.id} style={[styles.achievementCard, !earned && styles.achievementLocked]}>
                <View style={[styles.achievementIconContainer, earned && styles.achievementIconEarned]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, !earned && styles.textMuted]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  <View style={styles.achievementProgress}>
                    <View style={styles.achievementProgressTrack}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${Math.min((totalUnlocked / achievement.requirement) * 100, 100)}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {Math.min(totalUnlocked, achievement.requirement)}/{achievement.requirement}
                    </Text>
                  </View>
                </View>
                {earned && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </View>
            );
          })}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Thông Tin</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>EduTravel v1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>Powered by Gemini AI</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="map-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>Google Maps Integration</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Đăng Xuất</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 80 },

  profileHeader: {
    alignItems: 'center', padding: SPACING.xl,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md, position: 'relative',
  },
  avatarText: { fontSize: FONTS.xxxl, fontWeight: '800', color: '#fff' },
  levelBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  displayName: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  email: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  levelContainer: { backgroundColor: `${COLORS.primary}20`, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  levelText: { fontWeight: '700', fontSize: FONTS.sm },

  statsGrid: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, paddingVertical: SPACING.md,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONTS.xs, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.cardBorder },

  section: { padding: SPACING.md },
  sectionTitle: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },

  progressCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { color: COLORS.textSecondary, fontSize: FONTS.md },
  progressPercent: { fontWeight: '700', fontSize: FONTS.md },
  progressTrack: { height: 10, backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.sm },
  progressFill: { height: '100%', borderRadius: RADIUS.full, minWidth: 10 },
  progressComplete: { color: COLORS.gold, fontSize: FONTS.sm, textAlign: 'center', fontWeight: '600' },
  progressRemaining: { color: COLORS.textMuted, fontSize: FONTS.sm },

  achievementCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  achievementLocked: { opacity: 0.6 },
  achievementIconContainer: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.backgroundLight, justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  achievementIconEarned: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
  achievementIcon: { fontSize: 24 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontWeight: '700', color: COLORS.textPrimary, fontSize: FONTS.md },
  achievementDesc: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2, marginBottom: SPACING.xs },
  achievementProgress: { flexDirection: 'row', alignItems: 'center' },
  achievementProgressTrack: { flex: 1, height: 4, backgroundColor: COLORS.backgroundLight, borderRadius: 2, overflow: 'hidden', marginRight: SPACING.sm },
  achievementProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2, minWidth: 4 },
  achievementProgressText: { color: COLORS.textMuted, fontSize: FONTS.xs },
  textMuted: { color: COLORS.textMuted },

  infoCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  infoText: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginLeft: SPACING.sm },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.error, backgroundColor: `${COLORS.error}10`,
  },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.md, marginLeft: SPACING.sm },
});

export default ProfileScreen;
