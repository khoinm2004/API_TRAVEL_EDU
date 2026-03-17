// App.js
// Điểm khởi đầu của ứng dụng EduTravel

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // GestureHandlerRootView: Bắt buộc cho react-native-gesture-handler
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider: Xử lý notch và status bar trên iOS/Android */}
      <SafeAreaProvider>
        {/* AuthProvider: Cung cấp trạng thái auth cho toàn bộ app */}
        <AuthProvider>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
