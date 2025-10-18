# 🔧 Fix Gradle Build Error - No Matching Variant

## 📋 Vấn đề

```
Could not resolve project :react-native-bluetooth-classic
Could not resolve project :react-native-gesture-handler
...
No matching variant was found
```

## 🔍 Nguyên nhân

EAS Build không thể resolve native modules vì:
1. Android project chưa được prebuild đúng
2. Autolinking không hoạt động
3. Gradle cache bị lỗi

## ✅ Giải pháp

### **Option 1: Prebuild Android project (Khuyến nghị)**

**1. Commit code hiện tại:**
```bash
cd d:\BEAR_4_StartUp
git add .
git commit -m "Update email alert logic and fix token issue"
git push
```

**2. Prebuild Android:**
```bash
cd frontend
npx expo prebuild --platform android --clean
```

**3. Commit android folder:**
```bash
git add android
git commit -m "Prebuild Android project"
git push
```

**4. Build APK:**
```bash
eas build --profile apk --platform android
```

---

### **Option 2: Build local (Nếu có Android Studio)**

**1. Clean project:**
```bash
cd d:\BEAR_4_StartUp\frontend\android
gradlew clean
```

**2. Build APK:**
```bash
gradlew assembleRelease
```

**3. APK location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

### **Option 3: Simplify eas.json**

**Update `eas.json`:**
```json
{
  "build": {
    "apk": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**Build:**
```bash
eas build --profile apk --platform android --clear-cache
```

---

## 🚀 Recommended Steps

### **Step 1: Prebuild**

```bash
cd d:\BEAR_4_StartUp\frontend
npx expo prebuild --platform android --clean
```

**Expected output:**
```
✔ Created native projects
› Android: Gradle project created at android
```

### **Step 2: Commit**

```bash
cd d:\BEAR_4_StartUp
git add .
git commit -m "Prebuild Android project for EAS Build"
git push
```

### **Step 3: Build**

```bash
cd frontend
eas build --profile apk --platform android
```

---

## 📝 Nếu prebuild không hoạt động

### **Check Expo version:**
```bash
cd frontend
npx expo --version
```

### **Update Expo CLI:**
```bash
npm install -g expo-cli
npm install -g eas-cli
```

### **Check dependencies:**
```bash
npm install
```

### **Clean cache:**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 🔍 Debug Gradle locally

**1. Install Android Studio**

**2. Open project:**
```
File → Open → d:\BEAR_4_StartUp\frontend\android
```

**3. Sync Gradle:**
```
File → Sync Project with Gradle Files
```

**4. Check errors in Build tab**

**5. Build APK:**
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## ⚠️ Known Issues

### **Issue 1: Expo SDK 54 + React Native 0.81**

Một số native modules có thể không tương thích.

**Fix:** Prebuild để generate Android project đúng.

### **Issue 2: Autolinking**

EAS Build có thể không autolinking đúng.

**Fix:** Set `EXPO_USE_COMMUNITY_AUTOLINKING=0` trong eas.json (đã thêm).

### **Issue 3: Gradle version**

Gradle 8.14.3 có thể có issues với một số plugins.

**Fix:** Prebuild sẽ generate đúng Gradle version.

---

## 🎯 Quick Fix

**Chạy lần lượt:**

```bash
# 1. Prebuild
cd d:\BEAR_4_StartUp\frontend
npx expo prebuild --platform android --clean

# 2. Commit
cd ..
git add .
git commit -m "Prebuild Android"
git push

# 3. Build
cd frontend
eas build --profile apk --platform android
```

---

## 📧 Nếu vẫn lỗi

Share full error logs từ EAS Build:
1. Vào https://expo.dev
2. Click vào build failed
3. Copy full logs
4. Share để debug tiếp

---

**Thử prebuild trước!** 🚀
