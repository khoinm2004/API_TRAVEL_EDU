// src/services/geminiService.js
// Dịch vụ tích hợp Gemini AI để tạo nội dung giáo dục

import { API_KEYS } from '../constants';

// Endpoint của Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Gọi Gemini API để tạo nội dung giáo dục về địa điểm
 * @param {string} destinationName - Tên địa điểm
 * @param {string} userQuestion - Câu hỏi của người dùng (tùy chọn)
 */
export const generateEducationalContent = async (destinationName, userQuestion = null) => {
  try {
    // Tạo prompt phù hợp với mục đích giáo dục
    const prompt = userQuestion
      ? `Bạn là hướng dẫn viên du lịch kiêm chuyên gia lịch sử Việt Nam. 
         Người dùng đang ở ${destinationName} và hỏi: "${userQuestion}"
         Hãy trả lời bằng tiếng Việt, ngắn gọn, súc tích và thú vị. 
         Chia sẻ thông tin giáo dục hữu ích về địa điểm này.`
      : `Bạn là hướng dẫn viên du lịch kiêm chuyên gia lịch sử Việt Nam.
         Hãy giải thích về "${destinationName}" theo cách giáo dục, hấp dẫn bằng tiếng Việt.
         Bao gồm:
         1. 📜 Lịch sử hình thành và phát triển
         2. 🎭 Văn hóa và phong tục đặc trưng  
         3. 🏛️ Kiến trúc và nghệ thuật nổi bật
         4. 💡 Những điều thú vị ít người biết
         5. 🎓 Bài học lịch sử có thể rút ra
         
         Viết ngắn gọn, dễ hiểu, phù hợp cho học sinh và du khách.`;

    // Gọi Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEYS.GEMINI}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        // Cấu hình generation để đảm bảo nội dung an toàn và phù hợp
        generationConfig: {
          temperature: 0.7,        // Độ sáng tạo vừa phải
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,   // Giới hạn độ dài phản hồi
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Trích xuất text từ response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    return { success: true, content: text };
  } catch (error) {
    console.error('Lỗi Gemini API:', error);
    return {
      success: false,
      error: 'Không thể kết nối AI. Vui lòng thử lại sau.',
      // Fallback content nếu API không hoạt động
      content: `Không thể tải nội dung AI cho ${destinationName}. 
      Vui lòng kiểm tra kết nối mạng và API key của bạn.`,
    };
  }
};

/**
 * Tạo câu hỏi gợi ý cho người dùng
 * @param {string} destinationName
 */
export const getSuggestedQuestions = (destinationName) => {
  return [
    `Lịch sử của ${destinationName} bắt đầu như thế nào?`,
    `Có những lễ hội đặc biệt nào tại ${destinationName}?`,
    `Kiến trúc của ${destinationName} có điểm gì đặc biệt?`,
    `Tại sao ${destinationName} lại quan trọng với văn hóa Việt Nam?`,
    `Những bí ẩn thú vị nào còn ẩn giấu tại ${destinationName}?`,
  ];
};
