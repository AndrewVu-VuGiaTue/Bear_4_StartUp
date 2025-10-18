# 📧 SendGrid Setup cho BEAR App

## ✅ Đã hoàn thành

Email alert giờ dùng **SendGrid** (giống như OTP emails).

---

## 🔑 Environment Variables cần thiết

### **Trên Render:**

1. Vào https://dashboard.render.com
2. Click "bear-backend"
3. Environment → Add/Verify:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=buddyforemergencyaandr@gmail.com
```

---

## 📋 Lấy SendGrid API Key

### **Nếu đã có API Key:**
- Dùng key cũ (đã dùng cho OTP)
- Check trong Render Environment Variables

### **Nếu cần tạo mới:**

1. **Login SendGrid:**
   - Vào https://app.sendgrid.com/login
   - Login bằng account đã tạo trước đó

2. **Create API Key:**
   - Settings → API Keys
   - Click "Create API Key"
   - Name: `BEAR_Production`
   - Permissions: **Full Access** (hoặc ít nhất Mail Send)
   - Click "Create & View"
   - **Copy API Key ngay** (chỉ hiện 1 lần!)

3. **Add to Render:**
   - Render Dashboard → bear-backend → Environment
   - Key: `SENDGRID_API_KEY`
   - Value: [paste API key]
   - Save Changes

---

## ✉️ Verify Sender Email

**QUAN TRỌNG:** SendGrid yêu cầu verify sender email trước khi gửi.

### **Check Verification Status:**

1. Vào https://app.sendgrid.com/settings/sender_auth
2. Check `buddyforemergencyaandr@gmail.com` có verified chưa

### **Nếu chưa verified:**

**Option 1: Single Sender Verification (Khuyến nghị)**

1. Settings → Sender Authentication → Single Sender Verification
2. Click "Create New Sender"
3. Fill form:
   - From Name: `BEAR Health Alert`
   - From Email: `buddyforemergencyaandr@gmail.com`
   - Reply To: `buddyforemergencyaandr@gmail.com`
   - Company: `BEAR`
   - Address: [Any address]
4. Submit
5. Check email `buddyforemergencyaandr@gmail.com`
6. Click verification link
7. ✅ Done!

**Option 2: Domain Authentication (Advanced)**

Nếu có domain riêng (e.g., `bear-health.com`):
1. Settings → Sender Authentication → Authenticate Your Domain
2. Follow DNS setup instructions
3. Verify domain

---

## 🧪 Test SendGrid

### **Test 1: Check API Key**

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "your-email@example.com"}]
    }],
    "from": {"email": "buddyforemergencyaandr@gmail.com"},
    "subject": "Test Email",
    "content": [{
      "type": "text/plain",
      "value": "This is a test"
    }]
  }'
```

**Expected:** Status 202 Accepted

### **Test 2: Test từ Backend**

**Postman:**
```
POST https://bear-backend-xe69.onrender.com/api/health/alert
Headers:
  Authorization: Bearer [YOUR_TOKEN]
  Content-Type: application/json
Body:
{
  "alertType": "Test Alert",
  "message": "Testing SendGrid integration",
  "heartRate": 35,
  "spo2": 85
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

### **Test 3: Check Email Activity**

1. Vào https://app.sendgrid.com/email_activity
2. Search email của emergency contact
3. Check status:
   - ✅ **Delivered** - Email đã gửi thành công
   - ⏳ **Processed** - Đang gửi
   - ❌ **Bounced** - Email không tồn tại
   - ❌ **Blocked** - Sender chưa verified

---

## 🔍 Troubleshooting

### **Issue 1: "The from email does not contain a valid address"**

**Nguyên nhân:** Sender email chưa verified

**Fix:**
1. Vào https://app.sendgrid.com/settings/sender_auth
2. Verify `buddyforemergencyaandr@gmail.com`
3. Check email và click verification link

### **Issue 2: "Unauthorized"**

**Nguyên nhân:** API Key sai hoặc không có quyền

**Fix:**
1. Check `SENDGRID_API_KEY` trên Render
2. Tạo API Key mới với Full Access
3. Update trên Render
4. Redeploy

### **Issue 3: Email không đến**

**Check:**
1. SendGrid Activity: https://app.sendgrid.com/email_activity
2. Status = "Delivered"?
3. Check Spam folder
4. Verify email address đúng

### **Issue 4: "403 Forbidden"**

**Nguyên nhân:** Account bị suspend hoặc limit

**Fix:**
1. Check SendGrid dashboard
2. Verify account
3. Check billing (free tier: 100 emails/day)

---

## 📊 SendGrid Free Tier Limits

- **100 emails/day** (đủ cho BEAR app)
- Unlimited contacts
- Email validation
- Activity tracking
- 30 days of email activity history

**Nếu cần nhiều hơn:**
- Essentials Plan: $19.95/month (50,000 emails)
- Pro Plan: $89.95/month (100,000 emails)

---

## 🎯 Email Types trong BEAR

### **1. OTP Emails (Đã có)**
- Sign up verification
- Password reset
- Category: `otp`, `signup`, `password-reset`

### **2. Critical Health Alerts (Mới)**
- Fall detection
- Abnormal heart rate
- Low SpO2
- Category: `health-alert`, `critical`

---

## 📧 Email Template

**Subject:**
```
🚨 CRITICAL HEALTH ALERT - [User Name]
```

**Content:**
- Alert type (Fall, Low HR, Low SpO2)
- Vital signs (HR, SpO2, Temperature)
- Timestamp
- User name
- Call to action

**Design:**
- Same style as OTP emails
- Red theme (#B31B1B)
- Professional layout
- Mobile-responsive

---

## 🔐 Security Best Practices

1. **API Key:**
   - Never commit to Git
   - Store in environment variables only
   - Use Full Access or Mail Send permission only
   - Rotate regularly

2. **Sender Email:**
   - Always verify
   - Use professional email
   - Match FROM_EMAIL in .env

3. **Rate Limiting:**
   - Max 5 alerts per 5 minutes (implemented)
   - Prevent spam
   - Track in `lastAlertSentRef`

---

## ✅ Deployment Checklist

- [ ] SendGrid API Key đã add vào Render
- [ ] FROM_EMAIL đã add vào Render
- [ ] Sender email đã verified trên SendGrid
- [ ] Backend code đã push lên Git
- [ ] Backend đã deploy trên Render
- [ ] Test email thành công
- [ ] APK đã rebuild với code mới

---

## 📝 Logs để Debug

**Backend logs (Render):**
```
[EMAIL] ✅ SendGrid initialized successfully
[EMAIL] 🚨 Sending critical alert to contact@example.com...
[EMAIL] ✅ Critical alert sent to contact@example.com
[EMAIL] SendGrid Response: 202
[EMAIL] Message ID: xxx
```

**Nếu có lỗi:**
```
[EMAIL] ❌ Failed to send critical alert to contact@example.com: [error]
[EMAIL] SendGrid Error Body: { ... }
```

**Frontend logs:**
```
[HEALTH] sendCriticalAlert called, token: exists
[HEALTH] Sending alert to API: { alertType: '...', heartRate: 35 }
[API] Request POST /health/alert
[API] Response 200 /health/alert
[HEALTH] Critical alert email sent successfully: { sent: 1, total: 1 }
```

---

## 🚀 Next Steps

1. **Deploy Backend:**
   ```bash
   cd d:\BEAR_4_StartUp
   git add .
   git commit -m "Switch email alerts to SendGrid"
   git push
   ```
   → Render Manual Deploy

2. **Verify SendGrid:**
   - Check API Key on Render
   - Verify sender email

3. **Rebuild APK:**
   ```bash
   cd frontend
   build-apk.bat
   ```

4. **Test:**
   - Cài APK mới
   - Sign in
   - Add emergency contact
   - Trigger critical alert
   - Check email

---

**SendGrid đã sẵn sàng! Deploy và test thôi!** 🚀
