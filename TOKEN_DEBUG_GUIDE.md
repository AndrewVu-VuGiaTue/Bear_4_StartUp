# 🔍 DEBUG TOKEN ISSUE - Step by Step

## 🚨 Vấn đề hiện tại

```
LOG  [HEALTH] sendCriticalAlert called, token: null
LOG  [HEALTH] User: null
LOG  [HEALTH] No token, skipping alert email
```

**Nghĩa là:** User chưa sign in HOẶC session bị mất.

---

## ✅ Debug Logs đã thêm

### **AuthContext logs:**

**Khi app khởi động:**
```
[Auth] AsyncStorage not available  // Nếu không có AsyncStorage
[Auth] No saved session found      // Nếu chưa có session
[Auth] Session loaded - User: xxx, Token: exists  // Nếu có session
```

**Khi sign in:**
```
[Auth] setSession called - User: xxx, Token: exists
[Auth] Session saved to AsyncStorage
```

**Khi context update:**
```
[Auth] Context value updated - User: xxx, Token: exists, Loading: false
```

---

## 🔧 Rebuild APK với Debug Logs

**QUAN TRỌNG:** Phải rebuild để có logs mới!

```bash
cd d:\BEAR_4_StartUp\frontend
build-apk.bat
```

---

## 🧪 Test Scenarios

### **Scenario 1: Fresh Install (Chưa sign in)**

**Expected logs:**
```
1. [Auth] AsyncStorage not available / No saved session found
2. [Auth] Context value updated - User: null, Token: null, Loading: false
3. → User thấy Sign In screen
```

**Action:** Sign in

**Expected logs sau sign in:**
```
4. [SignIn] Token received: exists
5. [Auth] setSession called - User: xxx, Token: exists
6. [Auth] Session saved to AsyncStorage
7. [Auth] Context value updated - User: xxx, Token: exists, Loading: false
8. → Navigate to Dashboard
```

---

### **Scenario 2: App đã sign in trước đó**

**Expected logs khi mở app:**
```
1. [Auth] Session loaded - User: xxx, Token: exists
2. [Auth] Context value updated - User: xxx, Token: exists, Loading: false
3. → Auto navigate to Dashboard
```

---

### **Scenario 3: Trigger Critical Alert**

**Prerequisites:**
- User đã sign in ✅
- Emergency contact đã thêm ✅
- ESP32 đã connected ✅

**Expected logs:**
```
1. [BT] Data received: { hr: 35, spo2: 85 }
2. [HEALTH] sendCriticalAlert called, token: exists  ✅
3. [HEALTH] User: xxx  ✅
4. [HEALTH] Sending alert to API: { ... }
5. [API] Request POST /health/alert
6. [API] Response 200 /health/alert
7. [HEALTH] Critical alert email sent successfully
```

---

## 🔍 Nếu vẫn thấy "token: null"

### **Check 1: User có sign in không?**

**Cách check:**
- Mở app
- Xem có ở Dashboard không?
- Nếu ở Sign In screen → Chưa sign in

**Logs để verify:**
```
[Auth] Context value updated - User: null, Token: null
```
→ User chưa sign in

**Fix:** Sign in trước khi test

---

### **Check 2: Session có được save không?**

**Logs khi sign in:**
```
[Auth] setSession called - User: xxx, Token: exists  ✅
[Auth] Session saved to AsyncStorage  ✅
```

**Nếu không thấy logs này:**
- SignInScreen không gọi `auth.setSession()`
- Hoặc APK cũ chưa có code mới

**Fix:** Rebuild APK

---

### **Check 3: HealthContext có nhận được auth không?**

**Thêm log vào HealthContext:**

```typescript
// frontend/src/context/HealthContext.tsx
export function HealthProvider({ children }) {
  const auth = useAuth();
  
  useEffect(() => {
    console.log('[HEALTH] Auth context received - User:', auth.user?.username, 'Token:', auth.token ? 'exists' : 'null');
  }, [auth.user, auth.token]);
  
  // ... rest of code
}
```

**Expected log:**
```
[HEALTH] Auth context received - User: xxx, Token: exists
```

**Nếu thấy:**
```
[HEALTH] Auth context received - User: null, Token: null
```
→ AuthContext chưa có user/token

---

### **Check 4: Timing Issue**

**Có thể:** HealthContext mount trước khi session load xong.

**Verify:**
```
[Auth] Context value updated - User: null, Token: null, Loading: true
[HEALTH] sendCriticalAlert called, token: null  ❌
[Auth] Session loaded - User: xxx, Token: exists
[Auth] Context value updated - User: xxx, Token: exists, Loading: false
```

**Fix:** Đợi `isLoading = false` trước khi render HealthProvider

---

## 🔧 Possible Fixes

### **Fix 1: Đảm bảo user đã sign in**

```typescript
// App.tsx
if (isLoading) {
  return null; // Đợi load session
}

// Chỉ render HealthProvider khi user đã sign in
{user ? (
  <HealthProvider>
    <MainTabs />
  </HealthProvider>
) : (
  <SignInScreen />
)}
```

### **Fix 2: Thêm guard trong sendCriticalAlert**

```typescript
const sendCriticalAlert = async (warning, sample) => {
  const currentToken = auth.token;
  const currentUser = auth.user;
  
  console.log('[HEALTH] sendCriticalAlert called');
  console.log('[HEALTH] Token:', currentToken ? 'exists' : 'null');
  console.log('[HEALTH] User:', currentUser?.username || 'null');
  console.log('[HEALTH] Auth loading:', auth.isLoading);
  
  if (auth.isLoading) {
    console.log('[HEALTH] Auth still loading, skipping');
    return;
  }
  
  if (!currentToken || !currentUser) {
    console.log('[HEALTH] No token or user, skipping alert email');
    return;
  }
  
  // ... send alert
};
```

### **Fix 3: Retry mechanism**

```typescript
const sendCriticalAlert = async (warning, sample) => {
  // Retry after 1 second if no token
  if (!auth.token && !auth.isLoading) {
    console.log('[HEALTH] No token, retrying in 1 second...');
    setTimeout(() => sendCriticalAlert(warning, sample), 1000);
    return;
  }
  
  // ... rest of code
};
```

---

## 📊 Complete Log Flow (Expected)

**App Start → Sign In → Trigger Alert:**

```
1. App Start:
   [Auth] No saved session found
   [Auth] Context value updated - User: null, Token: null, Loading: false
   → Show Sign In screen

2. User Sign In:
   [API] Request POST /auth/signin
   [API] Response 200 /auth/signin
   [SignIn] Token received: exists
   [Auth] setSession called - User: testuser, Token: exists
   [Auth] Session saved to AsyncStorage
   [Auth] Context value updated - User: testuser, Token: exists, Loading: false
   → Navigate to Dashboard

3. Connect ESP32:
   [BT] Connected to ESP32_HealthBand
   [BT] Subscribed to onDataReceived

4. Critical Alert Triggered:
   [BT] Data received: { hr: 35, spo2: 85, ts: 1234567890 }
   [HEALTH] sendCriticalAlert called, token: exists  ✅
   [HEALTH] User: testuser  ✅
   [HEALTH] Sending alert to API: { alertType: 'Critical: Abnormal Heart Rate', heartRate: 35 }
   [API] Request POST /health/alert
   [API] Response 200 /health/alert
   [HEALTH] Critical alert email sent successfully: { sent: 1, total: 1 }
```

---

## 🚀 Action Plan

### **Step 1: Rebuild APK**
```bash
cd d:\BEAR_4_StartUp\frontend
build-apk.bat
```

### **Step 2: Uninstall old app**
```
Settings → Apps → BEAR → Uninstall
```

### **Step 3: Install new APK**
```
Copy APK to phone → Install
```

### **Step 4: Test Sign In**
```
1. Open app
2. Sign in
3. Check logs:
   [Auth] setSession called - User: xxx, Token: exists
   [Auth] Session saved to AsyncStorage
```

### **Step 5: Test Alert**
```
1. Add emergency contact
2. Connect ESP32
3. Trigger critical alert (HR < 40)
4. Check logs:
   [HEALTH] sendCriticalAlert called, token: exists
   [HEALTH] User: xxx
```

### **Step 6: Check Email**
```
1. Check inbox of emergency contact
2. Subject: 🚨 CRITICAL HEALTH ALERT - [Your Name]
3. From: BEAR Health Alert
```

---

## 🔍 If Still Fails

### **Collect Full Logs:**

```bash
# Android
adb logcat | grep -E "Auth|HEALTH|API"

# Or use React Native Debugger
# Or Metro logs
```

### **Share logs:**
```
[Auth] ...
[HEALTH] ...
[API] ...
```

---

## 📝 Checklist

- [ ] APK rebuilt with debug logs
- [ ] Old app uninstalled
- [ ] New APK installed
- [ ] User signed in successfully
- [ ] Logs show: `[Auth] setSession called - User: xxx, Token: exists`
- [ ] Logs show: `[Auth] Session saved to AsyncStorage`
- [ ] Emergency contact added
- [ ] ESP32 connected
- [ ] Critical alert triggered
- [ ] Logs show: `[HEALTH] sendCriticalAlert called, token: exists`
- [ ] Email received

---

**Rebuild APK và test với debug logs!** 🚀

**Logs sẽ cho biết chính xác vấn đề ở đâu!** 🔍
