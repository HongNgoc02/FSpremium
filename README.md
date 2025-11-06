# FoodShopApp - Expo

Ứng dụng FoodShop được xây dựng bằng Expo với TypeScript.

## Màu chủ đạo
- Primary Color: `#FF004C`

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
# Khởi động Expo
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS (cần macOS)
npm run ios

# Chạy trên Web
npm run web
```

## Cấu trúc dự án

```
expo-app/
├── screens/
│   └── LoginScreen.tsx    # Trang đăng nhập
├── App.tsx                # Entry point
├── app.json              # Cấu hình Expo
└── package.json          # Dependencies
```

## Tính năng hiện tại

- ✅ Trang đăng nhập với UI hiện đại
- ✅ Gradient background với màu chủ đạo #FF004C
- ✅ Validation form cơ bản
- ✅ Loading state khi đăng nhập
- ✅ Keyboard aware
- ✅ Safe area support

## Lưu ý

- Dự án sử dụng Expo SDK 54
- React Native 0.81.5
- TypeScript được cấu hình sẵn
- Tất cả các giá trị boolean trong app.json đều đúng kiểu để tránh lỗi type casting

