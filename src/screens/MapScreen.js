// src/screens/MapScreen.js
// Màn hình bản đồ - Hiển thị tất cả địa điểm với markers

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle, Callout, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { getDestinations } from '../services/firestoreService';
import { getCurrentLocation, watchUserLocation } from '../services/locationService';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

const MapScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [destinations, setDestinations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState(null);

  useEffect(() => {
    initMap();

    // Theo dõi vị trí người dùng theo thời gian thực
    let stopWatching = null;
    watchUserLocation((location) => {
      setUserLocation(location);
    }).then(unsub => {
      stopWatching = unsub;
    });

    // Cleanup khi unmount
    return () => {
      if (stopWatching) stopWatching();
    };
  }, []);

  const initMap = async () => {
    const [dests, location] = await Promise.all([
      getDestinations(),
      getCurrentLocation(),
    ]);
    setDestinations(dests);
    setUserLocation(location);
    setLoading(false);
  };

  const isUnlocked = (destId) => userData?.unlockedLocations?.includes(destId);

  /**
   * Di chuyển camera đến vị trí người dùng
   */
  const goToMyLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  /**
   * Di chuyển camera đến địa điểm được chọn
   */
  const focusDestination = (dest) => {
    setSelectedDest(dest);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: dest.latitude,
        longitude: dest.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }, 800);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  // Tọa độ trung tâm Việt Nam để khởi tạo bản đồ
  const VIETNAM_CENTER = { latitude: 16.5, longitude: 107.5, latitudeDelta: 10, longitudeDelta: 10 };

  return (
    <View style={styles.container}>
      {/* Map View - dùng OpenStreetMap, không cần API key */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={VIETNAM_CENTER}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType="none"  // Tắt tile mặc định để dùng OpenStreetMap
      >
        {/* OpenStreetMap tile - miễn phí, không cần API key */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Markers cho từng địa điểm */}
        {destinations.map(dest => {
          const unlocked = isUnlocked(dest.id);
          return (
            <React.Fragment key={dest.id}>
              {/* Marker địa điểm */}
              <Marker
                coordinate={{ latitude: dest.latitude, longitude: dest.longitude }}
                onPress={() => focusDestination(dest)}
              >
                {/* Custom marker view */}
                <View style={[styles.markerContainer, unlocked && styles.markerUnlocked]}>
                  <Text style={styles.markerIcon}>{unlocked ? '📍' : '🔒'}</Text>
                </View>

                {/* Callout khi tap marker */}
                <Callout tooltip onPress={() => navigation.navigate('DestinationDetail', {
                  destination: dest,
                  isUnlocked: unlocked,
                })}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{dest.name}</Text>
                    <Text style={styles.calloutCity}>{dest.city}</Text>
                    <Text style={styles.calloutStatus}>
                      {unlocked ? '✅ Đã mở khóa' : '🔒 Chưa khám phá'}
                    </Text>
                    <Text style={styles.calloutTap}>Nhấn để xem chi tiết →</Text>
                  </View>
                </Callout>
              </Marker>

              {/* Vòng tròn vùng mở khóa 100m */}
              <Circle
                center={{ latitude: dest.latitude, longitude: dest.longitude }}
                radius={100}
                fillColor={unlocked ? `${COLORS.primary}15` : `${COLORS.accent}10`}
                strokeColor={unlocked ? COLORS.primary : COLORS.accent}
                strokeWidth={1}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Header overlay */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🗺️ Bản Đồ Du Lịch</Text>
          <Text style={styles.headerSubtitle}>
            {userData?.unlockedLocations?.length || 0}/{destinations.length} đã khám phá
          </Text>
        </View>
      </View>

      {/* Nút về vị trí của tôi */}
      <TouchableOpacity style={styles.myLocationBtn} onPress={goToMyLocation}>
        <Ionicons name="locate" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>📍</Text>
          <Text style={styles.legendText}>Đã mở khóa</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🔒</Text>
          <Text style={styles.legendText}>Chưa khám phá</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.md },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,22,40,0.85)',
    padding: SPACING.md, paddingBottom: SPACING.sm,
  },
  headerContent: {},
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.lg, fontWeight: '700' },
  headerSubtitle: { color: COLORS.primary, fontSize: FONTS.sm, marginTop: 2 },

  myLocationBtn: {
    position: 'absolute', right: SPACING.md, bottom: 140,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },

  markerContainer: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.locked,
    justifyContent: 'center', alignItems: 'center',
  },
  markerUnlocked: { borderColor: COLORS.primary },
  markerIcon: { fontSize: 18 },

  callout: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, minWidth: 180,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  calloutTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.md, marginBottom: 2 },
  calloutCity: { color: COLORS.textMuted, fontSize: FONTS.xs, marginBottom: SPACING.xs },
  calloutStatus: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: SPACING.xs },
  calloutTap: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '600' },

  legend: {
    position: 'absolute', bottom: 90, left: SPACING.md,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,22,40,0.85)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendIcon: { fontSize: 14, marginRight: 4 },
  legendText: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  legendDivider: { width: 1, height: 16, backgroundColor: COLORS.cardBorder, marginHorizontal: SPACING.sm },
});

export default MapScreen;