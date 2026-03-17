// src/screens/AIChatScreen.js
// Màn hình chat với AI Gemini - Học kiến thức về địa điểm

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { generateEducationalContent, getSuggestedQuestions } from '../services/geminiService';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

// Kiểu tin nhắn
const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
};

const AIChatScreen = ({ navigation, route }) => {
  const { destination } = route.params;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState(getSuggestedQuestions(destination.name));

  // Tin nhắn chào mừng ban đầu
  useEffect(() => {
    const welcomeMsg = {
      id: '0',
      type: MESSAGE_TYPES.AI,
      text: `Xin chào! 👋 Tôi là AI hướng dẫn viên của EduTravel.\n\nTôi sẽ giúp bạn khám phá và học hỏi về **${destination.name}**.\n\nBạn có thể hỏi tôi bất cứ điều gì về lịch sử, văn hóa, kiến trúc hay những điều thú vị tại đây! 🎓`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);

    // Tự động tạo nội dung giáo dục ban đầu
    loadInitialContent();
  }, []);

  /**
   * Tải nội dung giáo dục ban đầu về địa điểm
   */
  const loadInitialContent = async () => {
    setLoading(true);
    const result = await generateEducationalContent(destination.name);
    setLoading(false);

    if (result.success) {
      addMessage(MESSAGE_TYPES.AI, result.content);
    }
  };

  /**
   * Thêm tin nhắn vào danh sách
   */
  const addMessage = (type, text) => {
    const newMsg = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);

    // Cuộn xuống cuối sau khi thêm tin nhắn
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /**
   * Gửi câu hỏi đến AI
   */
  const sendMessage = async (question = null) => {
    const text = question || inputText.trim();
    if (!text || loading) return;

    // Thêm tin nhắn của user
    addMessage(MESSAGE_TYPES.USER, text);
    setInputText('');
    Keyboard.dismiss();

    // Gọi Gemini API
    setLoading(true);
    const result = await generateEducationalContent(destination.name, text);
    setLoading(false);

    if (result.success) {
      addMessage(MESSAGE_TYPES.AI, result.content);
    } else {
      addMessage(MESSAGE_TYPES.AI, result.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  /**
   * Render một tin nhắn
   */
  const renderMessage = ({ item }) => {
    const isUser = item.type === MESSAGE_TYPES.USER;
    const isAI = item.type === MESSAGE_TYPES.AI;

    return (
      <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
        {/* Avatar AI */}
        {isAI && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}

        {/* Bubble tin nhắn */}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}>
          {isAI && (
            <Text style={styles.aiLabel}>AI Hướng dẫn viên</Text>
          )}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render các câu hỏi gợi ý
   */
  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsLabel}>💡 Câu hỏi gợi ý:</Text>
      {suggestions.slice(0, 3).map((q, index) => (
        <TouchableOpacity
          key={index}
          style={styles.suggestionChip}
          onPress={() => sendMessage(q)}
          disabled={loading}
        >
          <Text style={styles.suggestionText}>{q}</Text>
          <Ionicons name="send" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>🤖 AI Học Tập</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{destination.name}</Text>
        </View>
        <View style={styles.aiStatus}>
          <View style={styles.aiStatusDot} />
          <Text style={styles.aiStatusText}>Gemini</Text>
        </View>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {/* Loading indicator */}
            {loading && (
              <View style={styles.typingIndicator}>
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>🤖</Text>
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.typingText}>AI đang soạn câu trả lời...</Text>
                </View>
              </View>
            )}
            {/* Câu hỏi gợi ý */}
            {!loading && messages.length > 0 && renderSuggestions()}
          </>
        }
      />

      {/* Input box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder={`Hỏi về ${destination.name}...`}
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <LinearGradient
              colors={inputText.trim() && !loading ? [COLORS.primary, COLORS.primaryDark] : [COLORS.locked, COLORS.locked]}
              style={styles.sendGradient}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerInfo: { flex: 1 },
  headerTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.md },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 1 },
  aiStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.primary}20`, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  aiStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 4 },
  aiStatusText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '600' },

  messageList: { padding: SPACING.md, paddingBottom: SPACING.xl },

  messageRow: { flexDirection: 'row', marginBottom: SPACING.md, alignItems: 'flex-end' },
  userMessageRow: { flexDirection: 'row-reverse' },

  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  aiAvatarText: { fontSize: 16 },

  messageBubble: {
    maxWidth: '80%', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1,
  },
  aiBubble: { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark, borderBottomRightRadius: 4 },

  aiLabel: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '700', marginBottom: 4 },
  messageText: { color: COLORS.textSecondary, fontSize: FONTS.md, lineHeight: 22 },
  userMessageText: { color: '#fff' },
  messageTime: { color: COLORS.textMuted, fontSize: 10, marginTop: SPACING.xs, alignSelf: 'flex-end' },

  typingIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  typingText: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginLeft: SPACING.sm },

  suggestionsContainer: { marginTop: SPACING.sm },
  suggestionsLabel: { color: COLORS.textMuted, fontSize: FONTS.xs, marginBottom: SPACING.sm },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  suggestionText: { flex: 1, color: COLORS.textSecondary, fontSize: FONTS.sm, marginRight: SPACING.sm },

  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1, color: COLORS.textPrimary, fontSize: FONTS.md,
    backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    maxHeight: 100, borderWidth: 1, borderColor: COLORS.cardBorder,
    marginRight: SPACING.sm,
  },
  sendButton: { borderRadius: RADIUS.md, overflow: 'hidden' },
  sendButtonDisabled: { opacity: 0.5 },
  sendGradient: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});

export default AIChatScreen;
