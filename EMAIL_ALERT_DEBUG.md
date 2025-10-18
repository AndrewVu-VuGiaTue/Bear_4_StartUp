# 🔍 Debug Email Alert Issue

## 📋 Vấn đề hiện tại

Log hiển thị: `[HEALTH] No token, skipping alert email`

Nghĩa là khi có critical alert, HealthContext không có token để gửi API request.

---

## ✅ Checklist Debug

### **1. Check User đã Sign In chưa?**

**Cách check:**
- Mở app
- Xem có ở Dashboard không?
- Nếu ở Sign In screen → Chưa sign in

**Fix:** Sign in trước khi test

---

### **2. Check Token có được lưu không?**

**Thêm log vào SignInScreen:**

```typescript
// frontend/src/screens/SignInScreen.tsx
const res = await api.post('/auth/signin', { identifier, password });
const user = res?.data?.user;
const token = res?.data?.token;

console.log('[SignIn] Token received:', token ? 'exists' : 'null');

if (user) {
  auth.setSession(user, token);
  console.log('[SignIn] Session set with token');
}
```

**Expected logs:**
```
[SignIn] Token received: exists
[SignIn] Session set with token
```

---

### **3. Check HealthContext nhận được token không?**

**Logs đã thêm:**

```typescript
// frontend/src/context/HealthContext.tsx
const sendCriticalAlert = async (warning, sample) => {
  console.log('[HEALTH] sendCriticalAlert called, token:', token ? 'exists' : 'null');
  // ...
}
```

**Expected logs khi có critical alert:**
```
[HEALTH] sendCriticalAlert called, token: exists
[HEALTH] Sending alert to API: { alertType: '...', heartRate: 35, spo2: 85 }
[HEALTH] Critical alert email sent successfully: { message: '...', sent: 1 }
```

**Nếu thấy:**
```
[HEALTH] sendCriticalAlert called, token: null
[HEALTH] No token, skipping alert email
```

→ **Vấn đề:** Token không được truyền vào HealthContext

---

## 🔧 Giải pháp nếu token = null

### **Option 1: Rebuild APK**

Có thể do code cũ chưa có fix:

```bash
cd d:\BEAR_4_StartUp\frontend
build-apk.bat
```

### **Option 2: Check Context Order**

Verify trong `App.tsx`:

```typescript
<AuthProvider>           // ← Token ở đây
  <SettingsProvider>
    <ThemeProvider>
      <HealthProvider>   // ← Dùng token ở đây
        <AppShell />
      </HealthProvider>
    </ThemeProvider>
  </SettingsProvider>
</AuthProvider>
```

✅ Order đúng rồi

### **Option 3: Force Re-render**

Thử sign out và sign in lại:
1. Sign Out
2. Close app hoàn toàn
3. Mở app
4. Sign In
5. Connect ESP32
6. Trigger critical alert

---

## 🧪 Test Email Alert

### **Cách 1: Dùng ESP32 thật**

**Trigger Fall Detection:**
```
1. Connect ESP32
2. Lắc mạnh device (totalG > 15)
3. Check logs
```

**Trigger Low Heart Rate:**
```
1. Connect ESP32
2. Giả lập HR < 40
3. Check logs
```

**Trigger Low SpO2:**
```
1. Connect ESP32
2. Giả lập SpO2 < 88
3. Check logs
```

### **Cách 2: Test API trực tiếp (Postman)**

**Endpoint:**
```
POST https://bear-backend-xe69.onrender.com/api/health/alert
```

**Headers:**
```
Authorization: Bearer [YOUR_TOKEN]
Content-Type: application/json
```

**Body:**
```json
{
  "alertType": "Test Critical Alert",
  "message": "This is a test alert",
  "heartRate": 35,
  "spo2": 85,
  "temperature": null
}
```

**Expected Response:**
```json
{
  "message": "Alert sent to 1 of 1 contacts",
  "sent": 1,
  "total": 1
}
```

---

## 📧 Check Email Settings

### **Backend Environment Variables (Render)**

1. Vào https://dashboard.render.com
2. Click "bear-backend"
3. Environment → Check:

```
EMAIL_USER=buddyforemergencyaandr@gmail.com
EMAIL_PASS=[App Password từ Google]
```

**Nếu thiếu → Thêm vào:**

1. Click "Environment"
2. Add Environment Variable
3. Key: `EMAIL_USER`, Value: `buddyforemergencyaandr@gmail.com`
4. Key: `EMAIL_PASS`, Value: `[App Password]`
5. Save Changes
6. Redeploy

### **Get Gmail App Password:**

1. Vào https://myaccount.google.com/security
2. 2-Step Verification → App passwords
3. Generate new app password
4. Copy password
5. Paste vào `EMAIL_PASS` trên Render

---

## 🔍 Debug Logs Sequence

**Khi có critical alert, logs nên như sau:**

```
1. [BT] Data received: { hr: 35, spo2: 85, ... }
2. [HEALTH] sendCriticalAlert called, token: exists
3. [HEALTH] Sending alert to API: { alertType: 'Critical: Abnormal Heart Rate', heartRate: 35, spo2: 85 }
4. [API] Request POST https://bear-backend-xe69.onrender.com/api/health/alert
5. [API] Response 200 /health/alert
6. [HEALTH] Critical alert email sent successfully: { message: 'Alert sent to 1 of 1 contacts', sent: 1, total: 1 }
```

**Nếu thấy lỗi:**

```
[HEALTH] Failed to send alert email: { message: 'User not found' }
```
→ Token không hợp lệ hoặc user không tồn tại

```
[HEALTH] Failed to send alert email: { message: 'No emergency contacts' }
```
→ Chưa thêm emergency contacts

```
[HEALTH] Failed to send alert email: Network Error
```
→ Backend không chạy hoặc không có internet

---

## ✅ Checklist đầy đủ

- [ ] User đã sign in
- [ ] Token có trong AsyncStorage
- [ ] HealthContext nhận được token
- [ ] Emergency contacts đã được thêm (Settings → Emergency Contact)
- [ ] Backend đã deploy với code mới
- [ ] Environment variables (EMAIL_USER, EMAIL_PASS) đã set trên Render
- [ ] APK đã rebuild với code mới
- [ ] ESP32 đang connected
- [ ] Critical alert được trigger

---

## 🚀 Quick Fix Steps

**Nếu vẫn không gửi email:**

1. **Rebuild APK:**
   ```bash
   cd d:\BEAR_4_StartUp\frontend
   build-apk.bat
   ```

2. **Redeploy Backend:**
   ```bash
   cd d:\BEAR_4_StartUp
   git add .
   git commit -m "Add debug logs for email alert"
   git push
   ```
   
   Sau đó vào Render → Manual Deploy

3. **Test lại:**
   - Uninstall app cũ
   - Cài APK mới
   - Sign in
   - Thêm emergency contact
   - Connect ESP32
   - Trigger critical alert
   - Check logs

---

## 📝 Expected Email Content

**Subject:**
```
🚨 CRITICAL HEALTH ALERT - [Your Name]
```

**Body:**
```
CRITICAL HEALTH ALERT

User: [Your Name]
Alert Type: Critical: Abnormal Heart Rate
Time: 18/10/2025, 12:30:00

Heart rate is too low.

Vital Signs:
- Heart Rate: 35 BPM
- SpO2: 85%

This is an automated alert from BEAR Health monitoring system.
Please check on [Your Name] immediately.

© 2025 BEAR Health. All rights reserved.
```

---

**Rebuild APK + Redeploy Backend + Test lại!** 🚀
