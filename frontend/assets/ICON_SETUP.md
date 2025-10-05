# App Icon Setup Guide

## Bước 1: Chuẩn bị hình ảnh gấu

Bạn đã có hình gấu (ảnh 5). Cần tạo các kích thước sau:

### Android Icons (cần tạo):
- `icon.png` - 1024x1024px (adaptive icon foreground)
- `adaptive-icon.png` - 1024x1024px (cho Android adaptive icon)

### iOS Icons (nếu cần):
- `icon.png` - 1024x1024px

## Bước 2: Tạo icon từ hình gấu

### Cách 1: Dùng online tool (Khuyến nghị)
1. Vào: https://www.appicon.co/
2. Upload hình gấu của bạn
3. Chọn "Android" và "iOS"
4. Download và giải nén
5. Copy các file vào `assets/`

### Cách 2: Dùng Expo
```bash
# Cài expo-asset
npm install -g @expo/image-utils

# Tạo icon
npx expo-optimize
```

## Bước 3: Update app.json

Sau khi có file icon, update `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#B31B1B"
      }
    },
    "ios": {
      "icon": "./assets/icon.png"
    }
  }
}
```

## Bước 4: Rebuild app

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

## Lưu ý:
- Icon phải là PNG
- Nền trong suốt (transparent) cho adaptive icon
- Background color: #B31B1B (màu đỏ BEAR)
