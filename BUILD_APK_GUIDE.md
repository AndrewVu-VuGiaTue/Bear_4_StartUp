# 📱 Hướng dẫn Build APK cho BEAR

## 🎯 Mục đích
Build file APK để cài đặt trên điện thoại Android, sử dụng như app bình thường (không cần máy tính).

---

## ✅ Cách 1: EAS Build (Cloud - Khuyến nghị)

### **Bước 1: Cài đặt EAS CLI**
```bash
npm install -g eas-cli
```

### **Bước 2: Login vào Expo**
```bash
cd frontend
eas login
```
- Nhập email/password của tài khoản Expo
- Nếu chưa có tài khoản: https://expo.dev/signup

### **Bước 3: Configure project**
```bash
eas build:configure
```
- Chọn platform: **Android**
- Sẽ tự động tạo file `eas.json` (đã có sẵn)

### **Bước 4: Build APK**

**Build Preview (Test):**
```bash
eas build --platform android --profile preview
```

**Build Production (Release):**
```bash
eas build --platform android --profile production
```

### **Bước 5: Đợi build hoàn thành**
- Build trên cloud, mất khoảng 10-20 phút
- Theo dõi progress tại: https://expo.dev/accounts/[your-account]/projects/bear/builds
- Sau khi xong, download file APK

### **Bước 6: Cài đặt APK**
1. Download APK về điện thoại
2. Mở file APK
3. Cho phép "Install from unknown sources"
4. Cài đặt và sử dụng!

---

## 🔧 Cách 2: Build Local (Nhanh hơn nhưng phức tạp)

### **Yêu cầu:**
- Android Studio đã cài đặt
- Android SDK
- Java JDK 17+

### **Các bước:**

**1. Cài dependencies:**
```bash
cd frontend
npm install
```

**2. Generate Android project:**
```bash
npx expo prebuild --platform android
```

**3. Build APK:**
```bash
cd android
./gradlew assembleRelease
```

**4. File APK sẽ ở:**
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

**5. Copy APK sang điện thoại và cài đặt**

---

## 📝 Lưu ý quan trọng

### **Backend URL:**
- Đảm bảo `API_URL` trong `frontend/src/api/client.ts` đang trỏ đến Render:
  ```typescript
  const API_URL = 'https://bear-backend-xe69.onrender.com/api';
  ```
- **KHÔNG** dùng `localhost` hoặc `10.0.2.2` trong production build

### **App Version:**
- Mỗi lần build mới, tăng version trong `frontend/app.json`:
  ```json
  {
    "expo": {
      "version": "1.0.1",
      "android": {
        "versionCode": 2
      }
    }
  }
  ```

### **Permissions:**
- APK đã có đủ permissions: Camera, Bluetooth, Internet
- Người dùng sẽ được hỏi khi lần đầu sử dụng tính năng

---

## 🚀 Sau khi build xong

### **Test APK:**
1. Cài đặt trên điện thoại
2. Mở app (không cần máy tính)
3. Sign in/Sign up
4. Test các tính năng:
   - Dashboard
   - Bluetooth connection
   - Avatar upload
   - Emergency contacts
   - Settings

### **Phân phối:**
- **Internal testing:** Share file APK trực tiếp
- **Google Play Store:** Dùng `eas submit` để upload lên Play Store
- **Update:** Build version mới và cài đè lên

---

## 🔍 Troubleshooting

### **Lỗi: "App not installed"**
- Gỡ version cũ trước
- Hoặc tăng `versionCode` trong `app.json`

### **Lỗi: "Unable to connect to server"**
- Check API_URL đúng chưa
- Đảm bảo Render backend đang chạy
- Kiểm tra internet trên điện thoại

### **Lỗi: "Bluetooth not working"**
- Cấp quyền Bluetooth trong Settings
- Android 12+ cần thêm quyền `BLUETOOTH_CONNECT`

---

## 📦 So sánh 2 cách

| Feature | EAS Build | Local Build |
|---------|-----------|-------------|
| Setup | Dễ | Khó |
| Tốc độ | Chậm (10-20 phút) | Nhanh (5-10 phút) |
| Yêu cầu | Internet + Expo account | Android Studio |
| Signing | Tự động | Thủ công |
| CI/CD | Dễ integrate | Khó |
| **Khuyến nghị** | ✅ Cho người mới | Cho dev có kinh nghiệm |

---

## 🎉 Kết quả

Sau khi build xong, bạn sẽ có:
- ✅ File APK (~50-100MB)
- ✅ Có thể cài trên bất kỳ điện thoại Android nào
- ✅ Chạy độc lập, không cần máy tính
- ✅ Tự động update từ backend (Render)
- ✅ Sẵn sàng để test hoặc publish lên Play Store

---

**Khuyến nghị: Dùng EAS Build cho lần đầu!** 🚀
