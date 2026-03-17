// scripts/seedFirestore.js
// Script để seed dữ liệu địa điểm vào Firestore
// Chạy: node scripts/seedFirestore.js

// Cài: npm install firebase-admin
const admin = require('firebase-admin');

// ⚠️ Tải service account key từ Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Dữ liệu địa điểm du lịch Việt Nam
const destinations = [
  {
    id: '1',
    name: 'Văn Miếu - Quốc Tử Giám',
    description: 'Trường đại học đầu tiên của Việt Nam, được xây dựng năm 1070 thời nhà Lý.',
    fullDescription: `Văn Miếu - Quốc Tử Giám là quần thể di tích đặc biệt quan trọng bậc nhất của Hà Nội. 
Xây dựng từ năm 1070 đời vua Lý Thánh Tông, đây là nơi thờ phụng Khổng Tử và các bậc hiền triết, 
đồng thời là trường đại học đầu tiên của Việt Nam, đào tạo nhân tài cho quốc gia trong suốt gần 700 năm.

Quần thể gồm 5 khu vực chính với Khuê Văn Các - biểu tượng của Hà Nội, hồ Văn, và 82 tấm bia đá 
ghi tên những tiến sĩ đã đỗ trong các kỳ thi Nho học từ năm 1484. Đây là kho tàng quý giá 
về lịch sử giáo dục và văn hóa Việt Nam.`,
    latitude: 21.0275,
    longitude: 105.8347,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Lịch sử',
    city: 'Hà Nội',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Hội An Ancient Town',
    description: 'Phố cổ Hội An - Di sản Văn hóa Thế giới UNESCO với kiến trúc độc đáo.',
    fullDescription: `Hội An là một thành phố cổ nằm bên bờ sông Thu Bồn, tỉnh Quảng Nam. 
Được UNESCO công nhận là Di sản Văn hóa Thế giới năm 1999, phố cổ Hội An lưu giữ gần như 
nguyên vẹn kiến trúc đô thị thương cảng truyền thống Đông Nam Á thế kỷ 15-19.

Nơi đây từng là thương cảng quốc tế sầm uất, nơi giao thoa văn hóa Việt-Nhật-Trung. 
Chùa Cầu Nhật Bản (xây năm 1593), các hội quán của người Hoa, nhà cổ Tấn Ký... 
đều là những chứng nhân lịch sử quý giá của một thời kỳ vàng son.`,
    latitude: 15.8801,
    longitude: 108.3380,
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    category: 'Di sản',
    city: 'Quảng Nam',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Vịnh Hạ Long',
    description: 'Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi hùng vĩ.',
    fullDescription: `Vịnh Hạ Long là một trong những kỳ quan thiên nhiên đẹp nhất thế giới, 
được UNESCO công nhận là Di sản Thiên nhiên Thế giới hai lần (1994 và 2000). 
Vịnh có diện tích khoảng 1.553 km² với hơn 1.600 hòn đảo đá vôi, trong đó có khoảng 
40 hang động tuyệt đẹp.

Truyền thuyết kể rằng các đảo đá là do Rồng phun xuống để bảo vệ đất nước. 
Khoa học giải thích đây là kết quả của quá trình karst hóa hàng triệu năm. 
Hang Đầu Gỗ, hang Thiên Cung, đảo Ti Tốp... mỗi nơi đều ẩn chứa vẻ đẹp huyền bí.`,
    latitude: 20.9101,
    longitude: 107.1839,
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    category: 'Thiên nhiên',
    city: 'Quảng Ninh',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Mỹ Sơn Sanctuary',
    description: 'Thánh địa Mỹ Sơn - Di tích Chăm Pa cổ đại huyền bí.',
    fullDescription: `Thánh địa Mỹ Sơn là quần thể đền tháp Chăm Pa được xây dựng từ thế kỷ 4 
đến thế kỷ 13, nằm trong thung lũng núi Mã Nhai. Được UNESCO công nhận là Di sản Văn hóa 
Thế giới năm 1999.

Đây là nơi cúng tế của vương triều Chăm Pa và là nơi chôn cất của các vị vua, thầy tu 
có quyền năng. Các tháp được xây bằng gạch nung đỏ với kỹ thuật xây dựng bí ẩn - 
không dùng vữa mà vẫn đứng vững hàng trăm năm. Nghệ thuật điêu khắc đá tinh xảo 
thể hiện ảnh hưởng của văn hóa Ấn Độ giáo.`,
    latitude: 15.7767,
    longitude: 108.1233,
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    category: 'Khảo cổ',
    city: 'Quảng Nam',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Hoàng Thành Thăng Long',
    description: 'Khu trung tâm của thành Thăng Long - kinh đô Đại Việt suốt 13 thế kỷ.',
    fullDescription: `Hoàng thành Thăng Long là di tích quan trọng bậc nhất trong hệ thống 
các di tích Việt Nam, được UNESCO công nhận là Di sản Văn hóa Thế giới năm 2010.

Xây dựng từ thế kỷ 7, phát triển qua các triều đại Lý, Trần, Lê, đây là trung tâm 
quyền lực của quốc gia trong suốt 13 thế kỷ. Các cuộc khai quật từ 2002 đã phát lộ 
hàng triệu hiện vật quý giá, hé lộ nhiều bí ẩn về lịch sử và văn hóa Đại Việt. 
Kỳ đài Hà Nội và Đoan Môn vẫn còn đứng vững như biểu tượng của kinh thành xưa.`,
    latitude: 21.0358,
    longitude: 105.8352,
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    category: 'Lịch sử',
    city: 'Hà Nội',
    rating: 4.7,
  },
  {
    id: '6',
    name: 'Phong Nha - Kẻ Bàng',
    description: 'Vườn quốc gia với hệ thống hang động đẹp nhất thế giới.',
    fullDescription: `Vườn quốc gia Phong Nha-Kẻ Bàng được UNESCO công nhận là Di sản Thiên nhiên 
Thế giới năm 2003 và mở rộng năm 2015. Nơi đây có hệ thống hang động lớn nhất thế giới 
với hơn 300 hang động được khám phá.

Hang Sơn Đoòng - được phát hiện năm 2009 - là hang động tự nhiên lớn nhất thế giới, 
đủ chỗ cho một chiếc máy bay Boeing 747 bay qua! Hang có hệ sinh thái riêng với rừng 
cây và sông ngầm bên trong. Phong Nha và Thiên Đường cũng là những kỳ quan thạch nhũ 
tuyệt đẹp, được chiếu sáng lấp lánh như cung điện pha lê.`,
    latitude: 17.5553,
    longitude: 106.2801,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'Thiên nhiên',
    city: 'Quảng Bình',
    rating: 4.9,
  },
];

// Seed dữ liệu vào Firestore
async function seedData() {
  console.log('🚀 Bắt đầu seed dữ liệu vào Firestore...\n');

  const batch = db.batch();

  for (const dest of destinations) {
    const ref = db.collection('destinations').doc(dest.id);
    batch.set(ref, {
      ...dest,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Chuẩn bị: ${dest.name}`);
  }

  await batch.commit();
  console.log('\n🎉 Seed thành công! Đã thêm', destinations.length, 'địa điểm vào Firestore.');
  process.exit(0);
}

seedData().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
