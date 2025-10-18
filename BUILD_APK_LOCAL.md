# 🔧 Build APK Local (Không dùng EAS)

## ⚠️ Khi nào dùng cách này?

- EAS build bị lỗi "No matching variant"
- Muốn build nhanh hơn (5-10 phút thay vì 15-20 phút)
- Có Android Studio hoặc Android SDK đã cài

---

## 📋 Yêu cầu

### **1. Java JDK 17+**
```bash
java -version
```
Nếu chưa có: https://adoptium.net/

### **2. Android SDK**

**Option A: Cài Android Studio (Khuyến nghị)**
- Download: https://developer.android.com/studio
- Cài đặt và mở 1 lần
- SDK sẽ tự động được cài

**Option B: Chỉ cài SDK (Nhẹ hơn)**
- Download: https://developer.android.com/studio#command-tools
- Extract vào `C:\Android\sdk`
- Set environment variable:
  ```
  ANDROID_HOME=C:\Android\sdk
  ```

### **3. Kiểm tra**
```bash
# Check Java
java -version

# Check Android SDK
echo %ANDROID_HOME%
```

---

## 🚀 Cách 1: Dùng script tự động (Đơn giản nhất)

### **Bước 1: Chạy script**
```bash
cd d:\BEAR_4_StartUp\frontend
build-apk.bat
```

### **Bước 2: Đợi 5-10 phút**
Script sẽ tự động:
1. Clean build cũ
2. Install dependencies
3. Prebuild Android project
4. Build APK

### **Bước 3: Lấy APK**
File APK ở: `frontend\android\app\build\outputs\apk\release\app-release.apk`

---

## 🔧 Cách 2: Build thủ công (Nếu script lỗi)

### **Bước 1: Install dependencies**
```bash
cd d:\BEAR_4_StartUp\frontend
npm install
```

### **Bước 2: Prebuild Android project**
```bash
npx expo prebuild --platform android --clean
```
- Tạo folder `android/` với native code
- Config tự động từ `app.json`

### **Bước 3: Build APK**
```bash
cd android
gradlew assembleRelease
```
- Build mất 5-10 phút
- Nếu lỗi, xem phần Troubleshooting

### **Bước 4: Lấy APK**
```bash
cd ..
explorer android\app\build\outputs\apk\release
```
File: `app-release.apk`

---

## 📱 Cài đặt APK

### **Cách 1: USB**
1. Bật USB Debugging trên điện thoại
2. Kết nối USB
3. Chạy:
   ```bash
   cd android
   gradlew installRelease
   ```

### **Cách 2: Copy file**
1. Copy `app-release.apk` vào điện thoại
2. Mở file
3. Cho phép "Install from unknown sources"
4. Cài đặt

---

## 🔍 Troubleshooting

### **Lỗi: "ANDROID_HOME not set"**
```bash
# Windows
set ANDROID_HOME=C:\Users\[YourName]\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

# Hoặc set permanent trong System Environment Variables
```

### **Lỗi: "SDK location not found"**
Tạo file `frontend/android/local.properties`:
```properties
sdk.dir=C:\\Users\\[YourName]\\AppData\\Local\\Android\\Sdk
```

### **Lỗi: "No matching variant"**
```bash
# Clean và rebuild
cd android
gradlew clean
gradlew assembleRelease
```

### **Lỗi: "Execution failed for task ':app:mergeReleaseResources'"**
```bash
# Tăng memory cho Gradle
# Tạo file frontend/android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### **Lỗi: "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"**
```bash
# Download Gradle wrapper lại
cd android
gradle wrapper
```

### **Build chậm**
```bash
# Enable Gradle daemon
# Thêm vào android/gradle.properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

---

## ⚡ Tối ưu build speed

### **1. Tạo file `android/gradle.properties`:**
```properties
# Memory
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m

# Performance
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true

# Android
android.useAndroidX=true
android.enableJetifier=true
```

### **2. Disable unnecessary tasks:**
```bash
# Build without tests
gradlew assembleRelease -x test -x lint
```

---

## 📊 So sánh EAS vs Local Build

| Feature | EAS Build | Local Build |
|---------|-----------|-------------|
| Setup | Dễ | Cần Android SDK |
| Tốc độ | 15-20 phút | 5-10 phút |
| Internet | Cần | Không cần |
| Lỗi "No matching variant" | Có thể gặp | Ít gặp |
| Signing | Tự động | Cần config |
| **Khuyến nghị** | Cho production | Cho development |

---

## ✅ Checklist

- [ ] Java JDK 17+ đã cài
- [ ] Android SDK đã cài
- [ ] ANDROID_HOME đã set
- [ ] `npm install` đã chạy
- [ ] `npx expo prebuild` thành công
- [ ] `gradlew assembleRelease` thành công
- [ ] File APK đã tạo
- [ ] APK cài được trên điện thoại

---

## 🎯 Kết quả

Sau khi build xong:
- ✅ File APK (~50-100MB)
- ✅ Không cần EAS account
- ✅ Build nhanh hơn
- ✅ Ít lỗi hơn
- ✅ Full control

---

## 📝 Lưu ý

### **Signing APK:**
APK build local dùng debug keystore. Để release production:

1. Tạo keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore bear-release.keystore -alias bear -keyalg RSA -keysize 2048 -validity 10000
```

2. Config trong `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('bear-release.keystore')
        storePassword 'your-password'
        keyAlias 'bear'
        keyPassword 'your-password'
    }
}
```

3. Build:
```bash
gradlew assembleRelease
```

---

**Build APK local là cách tốt nhất khi EAS build gặp lỗi!** 🚀
