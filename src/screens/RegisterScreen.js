// src/screens/RegisterScreen.js
// Màn hình đăng ký tài khoản mới

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../services/authService';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

const RegisterScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Xử lý đăng ký
   */
  const handleRegister = async () => {
    // Validation
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    const result = await registerUser(email.trim(), password, displayName.trim());
    setLoading(false);

    if (!result.success) {
      Alert.alert('Đăng ký thất bại', result.error);
    }
    // Nếu thành công, AuthContext tự động cập nhật
  };

  return (
    <LinearGradient colors={[COLORS.background, COLORS.backgroundLight, '#162447']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header với nút back */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Tiêu đề */}
          <View style={styles.header}>
            <Text style={styles.title}>Tạo Tài Khoản</Text>
            <Text style={styles.subtitle}>Bắt đầu hành trình khám phá của bạn</Text>
          </View>

          {/* Form đăng ký */}
          <View style={styles.formContainer}>

            {/* Tên hiển thị */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên hiển thị"
                placeholderTextColor={COLORS.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            {/* Email */}
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
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Nút đăng ký */}
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Đăng Ký</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Link về login */}
            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Đã có tài khoản? <Text style={styles.loginLinkBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ghi chú */}
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.noteText}>Bằng cách đăng ký, bạn đồng ý với điều khoản sử dụng của EduTravel</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: SPACING.lg, paddingTop: 60 },
  backButton: { width: 44, height: 44, justifyContent: 'center', marginBottom: SPACING.md },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: FONTS.xxxl, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: FONTS.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  formContainer: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, paddingHorizontal: SPACING.md,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, height: 52, color: COLORS.textPrimary, fontSize: FONTS.md },
  button: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  buttonGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: FONTS.lg, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: SPACING.lg },
  loginLinkText: { color: COLORS.textSecondary, fontSize: FONTS.md },
  loginLinkBold: { color: COLORS.primary, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', marginTop: SPACING.lg, paddingHorizontal: SPACING.sm },
  noteText: { flex: 1, color: COLORS.textMuted, fontSize: FONTS.xs, marginLeft: SPACING.xs, lineHeight: 16 },
});

export default RegisterScreen;
