#include <Wire.h>
#include <Adafruit_ADXL345_U.h>
#include "MAX30100_PulseOximeter.h"
#include "battery.h"
#include "BluetoothSerial.h"
#include <math.h>

// ===== Sensors =====
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
PulseOximeter pox;

// ===== Bluetooth =====
BluetoothSerial SerialBT;

// ===== Step Counter =====
int stepCount = 0;
bool stepDetected = false;
const float STEP_THRESHOLD = 1.2;  // threshold for step detection
float lastTotalG = 1.0;

// ===== Timing =====
unsigned long lastPrintTime = 0;
unsigned long startTime = 0;  // Time when device started (in milliseconds)

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32_HealthBand");

  Serial.println("🔵 Bluetooth started: ESP32_HealthBand");
  SerialBT.println("🔵 ESP32 Bluetooth started");

  delay(100);

  // Init battery
  battery_begin();

  // Init accelerometer
  if (!accel.begin()) {
    Serial.println("❌ ADXL345 not detected.");
    SerialBT.println("❌ ADXL345 not detected.");
  } else {
    accel.setRange(ADXL345_RANGE_4_G);
    Serial.println("✅ ADXL345 ready.");
    SerialBT.println("✅ ADXL345 ready.");
  }

  // Init MAX30100
  if (!pox.begin()) {
    Serial.println("❌ MAX30100 not detected.");
    SerialBT.println("❌ MAX30100 not detected.");
  } else {
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
    Serial.println("✅ MAX30100 ready.");
    SerialBT.println("✅ MAX30100 ready.");
  }

  // Record start time (milliseconds since boot)
  startTime = millis();

  Serial.println("🚀 System started!");
  SerialBT.println("🚀 System started!");
}

void loop() {
  pox.update();  // update HR sensor

  // Every 10s, send data
  if (millis() - lastPrintTime >= 10000) {
    lastPrintTime = millis();

    // Calculate timestamp (milliseconds since device started)
    unsigned long timestamp = millis() - startTime;

    // Read accelerometer
    sensors_event_t event;
    accel.getEvent(&event);

    float x = event.acceleration.x;
    float y = event.acceleration.y;
    float z = event.acceleration.z;
    float totalG = sqrt(x * x + y * y + z * z);

    // Step detection (very basic)
    if (fabs(totalG - lastTotalG) > STEP_THRESHOLD) {
      if (!stepDetected) {
        stepCount++;
        stepDetected = true;
      }
    } else {
      stepDetected = false;
    }
    lastTotalG = totalG;

    // Read heart rate & SpO2
    float bpm = pox.getHeartRate();
    float spo2 = pox.getSpO2();

    // Read battery
    int percent = battery_get_level();

    // Create message with timestamp (in milliseconds)
    // Format: ts: <milliseconds> | x: <x> | y: <y> | z: <z> | G: <G> | Steps: <steps> | BPM: <bpm> | SpO2: <spo2>% | Battery: <battery>%
    String message = "ts: " + String(timestamp) +
                     " | x: " + String(x, 2) +
                     " | y: " + String(y, 2) +
                     " | z: " + String(z, 2) +
                     " | G: " + String(totalG, 2) +
                     " | Steps: " + String(stepCount) +
                     " | BPM: " + String(bpm, 1) +
                     " | SpO2: " + String(spo2, 1) +
                     "% | Battery: " + String(percent) + "%";

    // Send via UART & Bluetooth
    Serial.println(message);
    SerialBT.println(message);
  }
}
