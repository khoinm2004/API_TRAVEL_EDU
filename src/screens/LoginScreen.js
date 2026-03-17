// src/screens/LoginScreen.js
// Màn hình đăng nhập

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../services/authService';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Xử lý đăng nhập
   */
  const handleLogin = async () => {
    // Validation cơ bản
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    const result = await loginUser(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Đăng nhập thất bại', result.error);
    }
    // Nếu thành công, AuthContext sẽ tự động cập nhật và Navigator sẽ chuyển màn hình
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, '#162447']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo và tiêu đề */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🗺️</Text>
            </View>
            <Text style={styles.appName}>EduTravel</Text>
            <Text style={styles.tagline}>Khám phá · Học hỏi · Trải nghiệm</Text>
          </View>

          {/* Form đăng nhập */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Chào mừng trở lại!</Text>
            <Text style={styles.formSubtitle}>Đăng nhập để tiếp tục hành trình</Text>

            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Mật khẩu"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Nút đăng nhập */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng Nhập</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Link đăng ký */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerLinkText}>
                Chưa có tài khoản?{' '}
                <Text style={styles.registerLinkBold}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>🌏 Khám phá di sản văn hóa Việt Nam</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },

  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logoContainer: {
    width: 80, height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
    borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: FONTS.xxxl, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 1 },
  tagline: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },

  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  formTitle: { fontSize: FONTS.xxl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  formSubtitle: { fontSize: FONTS.md, color: COLORS.textSecondary, marginBottom: SPACING.lg },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, paddingHorizontal: SPACING.md,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, height: 52, color: COLORS.textPrimary, fontSize: FONTS.md },
  passwordInput: { paddingRight: 40 },
  eyeButton: { padding: SPACING.sm },

  loginButton: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  loginGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#fff', fontSize: FONTS.lg, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { color: COLORS.textMuted, marginHorizontal: SPACING.md, fontSize: FONTS.sm },

  registerLink: { alignItems: 'center' },
  registerLinkText: { color: COLORS.textSecondary, fontSize: FONTS.md },
  registerLinkBold: { color: COLORS.primary, fontWeight: '700' },

  footer: { alignItems: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textMuted, fontSize: FONTS.sm },
});

export default LoginScreen;
