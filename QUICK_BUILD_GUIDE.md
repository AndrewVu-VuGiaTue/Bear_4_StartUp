# 🚀 Hướng dẫn Build APK Nhanh (5 phút)

## ⚡ Cách nhanh nhất để có file APK

### **Bước 1: Cài EAS CLI (1 lần duy nhất)**
```bash
npm install -g eas-cli
```

### **Bước 2: Login Expo**
```bash
cd d:\BEAR_4_StartUp\frontend
eas login
```
- Email: [Tài khoản Expo của bạn]
- Password: [Mật khẩu]
- Chưa có tài khoản? → https://expo.dev/signup

### **Bước 3: Build AAB (Khuyến nghị)**
```bash
eas build --platform android --profile production
```

**Hoặc build APK trực tiếp:**
```bash
eas build --platform android --profile apk
```

### **Bước 4: Đợi & Download**
- Đợi 10-20 phút
- Vào: https://expo.dev
- Click vào build → Download file

### **Bước 5: Cài đặt**

**Nếu có file APK:**
1. Copy APK vào điện thoại
2. Mở file → Cài đặt
3. Xong!

**Nếu có file AAB:**
- **Option 1:** Upload lên Google Play (cho production)
- **Option 2:** Convert sang APK online: https://www.apkmirror.com/apk-tools/aab-to-apk-converter/

---

## 🔍 Lỗi thường gặp

### **Lỗi: "No matching variant"**
→ Dùng profile `production` thay vì `apk`:
```bash
eas build --platform android --profile production
```

### **Lỗi: "Build failed"**
→ Check logs tại https://expo.dev/builds
→ Thường do thiếu config hoặc dependencies

### **File AAB không cài được**
→ AAB chỉ dùng cho Google Play Store
→ Cần convert sang APK (xem hướng dẫn trên)

---

## ✅ Checklist trước khi build

- [ ] `app.json` có `version` và `versionCode` đúng
- [ ] `EXPO_PUBLIC_API_URL` trỏ đến Render (không phải localhost)
- [ ] Đã test app trên emulator/device
- [ ] Backend đang chạy trên Render

---

## 🎯 Kết quả

Sau khi build xong:
- ✅ File APK/AAB (~50-100MB)
- ✅ Cài trên điện thoại Android
- ✅ Chạy độc lập, không cần máy tính
- ✅ Tự động kết nối backend Render

---

## 📱 Test APK

1. Cài APK trên điện thoại
2. Mở app BEAR
3. Sign in/Sign up
4. Test các tính năng:
   - Dashboard
   - Bluetooth
   - Avatar upload
   - Emergency contacts
   - Settings

---

**Tổng thời gian: ~15-20 phút (build 10-15 phút + cài đặt 1-2 phút)** ⚡
