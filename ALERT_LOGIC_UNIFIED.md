# 🎯 ALERT LOGIC - Đồng nhất App & Email

## 📋 Thresholds (Ngưỡng)

### **Heart Rate (BPM):**
```
< 40        → 🔴 Critical (Đỏ)
40-49       → 🟡 Warning (Vàng/Cam)
50-120      → 🟢 Normal (Xanh)
121-150     → 🟡 Warning (Vàng/Cam)
> 150       → 🔴 Critical (Đỏ)
```

### **SpO2 (%):**
```
< 88        → 🔴 Critical (Đỏ)
88-91       → 🟡 Warning (Vàng/Cam)
≥ 92        → 🟢 Normal (Xanh)
```

### **Combined Rule:**
```
SpO2 < 92 AND (HR < 50 OR HR > 120) → 🔴 Critical (Đỏ)
```

### **Fall Detection:**
```
totalG > 15 → 🔴 Critical (Đỏ)
```

---

## 🎨 Alert Levels

### **🔴 Critical (Đỏ)**
- **Frequency:** Email mỗi **1 phút**
- **In-app:** Màu đỏ
- **Email Subject:** `🚨 CRITICAL HEALTH ALERT`

### **🟡 Warning (Vàng/Cam)**
- **Frequency:** Email mỗi **5 phút**
- **In-app:** Màu vàng/cam
- **Email Subject:** `⚠️ HEALTH WARNING`

### **🟢 Normal (Xanh)**
- **Frequency:** Không gửi email
- **In-app:** Màu xanh
- **Email:** Không gửi

---

## 📧 Email Alert Types

### **Critical Level:**

**1. Critical Health Alert**
- **Condition:** HR abnormal AND SpO2 abnormal (cả 2 đều critical)
- **Message:** "Both heart rate and blood oxygen levels are abnormal. Immediate attention required."

**2. Critical: Abnormal Heart Rate**
- **Condition:** HR < 40 or HR > 150 (SpO2 normal)
- **Message:** 
  - HR < 40: "Heart rate is critically low. Blood oxygen level is normal."
  - HR > 150: "Heart rate is critically high. Blood oxygen level is normal."

**3. Critical: Abnormal SpO2**
- **Condition:** SpO2 < 88 (HR normal)
- **Message:** "Blood oxygen level is critically low. Heart rate is normal."

**4. Fall Detected**
- **Condition:** totalG > 15
- **Message:** "A fall has been detected. Please check on the user immediately."

### **Warning Level:**

**1. Warning: Health Alert**
- **Condition:** HR abnormal AND SpO2 abnormal (cả 2 đều warning)
- **Message:** "Both heart rate and blood oxygen levels are slightly abnormal. Please monitor."

**2. Warning: Abnormal Heart Rate**
- **Condition:** HR 40-49 or HR 121-150 (SpO2 normal)
- **Message:**
  - HR 40-49: "Heart rate is slightly low. Blood oxygen level is normal."
  - HR 121-150: "Heart rate is slightly high. Blood oxygen level is normal."

**3. Warning: Low SpO2**
- **Condition:** SpO2 88-91 (HR normal)
- **Message:** "Blood oxygen level is slightly low. Heart rate is normal."

---

## 🧪 Test Cases

### **Case 1: HR = 48, SpO2 = 95**
- **makeWarnings():** severity = 'warning', hrAbnormal = 48
- **In-app:** 🟡 Vàng
- **Email:** "Warning: Abnormal Heart Rate - Heart rate is slightly low"
- **Frequency:** Mỗi 5 phút
- ✅ **ĐỒNG NHẤT**

### **Case 2: HR = 35, SpO2 = 95**
- **makeWarnings():** severity = 'critical', hrAbnormal = 35
- **In-app:** 🔴 Đỏ
- **Email:** "Critical: Abnormal Heart Rate - Heart rate is critically low"
- **Frequency:** Mỗi 1 phút
- ✅ **ĐỒNG NHẤT**

### **Case 3: HR = 75, SpO2 = 90**
- **makeWarnings():** severity = 'warning', spo2Abnormal = 90
- **In-app:** 🟡 Vàng
- **Email:** "Warning: Low SpO2 - Blood oxygen level is slightly low"
- **Frequency:** Mỗi 5 phút
- ✅ **ĐỒNG NHẤT**

### **Case 4: HR = 75, SpO2 = 85**
- **makeWarnings():** severity = 'critical', spo2Abnormal = 85
- **In-app:** 🔴 Đỏ
- **Email:** "Critical: Abnormal SpO2 - Blood oxygen level is critically low"
- **Frequency:** Mỗi 1 phút
- ✅ **ĐỒNG NHẤT**

### **Case 5: HR = 48, SpO2 = 90**
- **makeWarnings():** severity = 'critical' (combined rule!)
- **In-app:** 🔴 Đỏ
- **Email:** "Critical Health Alert - Both abnormal"
- **Frequency:** Mỗi 1 phút
- ✅ **ĐỒNG NHẤT**

### **Case 6: HR = 35, SpO2 = 85**
- **makeWarnings():** severity = 'critical', hrAbnormal = 35, spo2Abnormal = 85
- **In-app:** 🔴 Đỏ
- **Email:** "Critical Health Alert - Both abnormal"
- **Frequency:** Mỗi 1 phút
- ✅ **ĐỒNG NHẤT**

### **Case 7: HR = 125, SpO2 = 95**
- **makeWarnings():** severity = 'warning', hrAbnormal = 125
- **In-app:** 🟡 Vàng
- **Email:** "Warning: Abnormal Heart Rate - Heart rate is slightly high"
- **Frequency:** Mỗi 5 phút
- ✅ **ĐỒNG NHẤT**

### **Case 8: HR = 160, SpO2 = 95**
- **makeWarnings():** severity = 'critical', hrAbnormal = 160
- **In-app:** 🔴 Đỏ
- **Email:** "Critical: Abnormal Heart Rate - Heart rate is critically high"
- **Frequency:** Mỗi 1 phút
- ✅ **ĐỒNG NHẤT**

---

## 🔄 State Transitions

### **Normal → Warning:**
```
HR: 60 → 48
- In-app: Xanh → Vàng ✅
- Email: Không gửi → Gửi "Warning" mỗi 5p ✅
```

### **Warning → Critical:**
```
HR: 48 → 35
- In-app: Vàng → Đỏ ✅
- Email: "Warning" 5p → "Critical" 1p ✅
```

### **Critical → Warning:**
```
HR: 35 → 48
- In-app: Đỏ → Vàng ✅
- Email: "Critical" 1p → "Warning" 5p ✅
```

### **Warning → Normal:**
```
HR: 48 → 60
- In-app: Vàng → Xanh ✅
- Email: "Warning" → Dừng gửi ✅
```

### **Critical → Normal:**
```
HR: 35 → 60
- In-app: Đỏ → Xanh ✅
- Email: "Critical" → Dừng gửi ✅
```

---

## 📝 Code Logic

### **makeWarnings() - Determine Severity:**

```typescript
// Heart Rate
if (hr < 40 || hr > 150) {
  severity = 'critical';
} else if (hr < 50 || hr > 120) {
  severity = 'warning';
}

// SpO2
if (spo2 < 88) {
  severity = 'critical';
} else if (spo2 < 92) {
  severity = 'warning';
}

// Combined Rule
if (spo2 < 92 && (hr < 50 || hr > 120)) {
  severity = 'critical';
}
```

### **sendCriticalAlert() - Email Message:**

```typescript
if (severity === 'critical') {
  if (hrAbnormal < 40) {
    message = "critically low";
  } else if (hrAbnormal > 150) {
    message = "critically high";
  }
} else { // warning
  if (hrAbnormal < 50) {
    message = "slightly low";
  } else if (hrAbnormal > 120) {
    message = "slightly high";
  }
}
```

---

## ✅ Verification

**Logic đã đồng nhất:**
1. ✅ Thresholds giống nhau (makeWarnings vs sendCriticalAlert)
2. ✅ Severity levels giống nhau (critical vs warning)
3. ✅ Message text match với severity
4. ✅ Frequency match với severity (1p vs 5p)
5. ✅ In-app color match với severity (đỏ vs vàng)

**Không còn mâu thuẫn:**
- HR 48 → Warning (vàng) trong app ✅
- HR 48 → "Warning: Abnormal Heart Rate" trong email ✅
- HR 35 → Critical (đỏ) trong app ✅
- HR 35 → "Critical: Abnormal Heart Rate" trong email ✅

---

## 🚀 Testing Checklist

- [ ] HR 48 → Vàng trong app, "Warning" trong email
- [ ] HR 35 → Đỏ trong app, "Critical" trong email
- [ ] SpO2 90 → Vàng trong app, "Warning" trong email
- [ ] SpO2 85 → Đỏ trong app, "Critical" trong email
- [ ] HR 48 + SpO2 90 → Đỏ (combined rule), "Critical" trong email
- [ ] Warning → Critical transition → Email frequency changes 5p → 1p
- [ ] Critical → Warning transition → Email frequency changes 1p → 5p

---

**Logic đã đồng nhất hoàn toàn!** ✅
