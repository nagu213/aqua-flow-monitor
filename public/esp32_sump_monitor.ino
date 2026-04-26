/*
 * ESP32 Sump (Underground) Tank Monitor - Standalone
 * --------------------------------------------------
 * Dedicated monitor for the underground sump tank using float sensors.
 * Provides:
 *   - 3-level float sensing (LOW / MID / HIGH) for percentage estimation
 *   - Buzzer + LED alerts for sump empty (dry-run risk) and sump full
 *   - Optional relay output to disable main pump when sump is empty
 *   - Serial JSON output + simple WiFi web dashboard
 *
 * Wiring (ESP32 DevKit):
 *   GPIO 32  -> Sump LOW   float (INPUT_PULLUP, one wire to GND)
 *   GPIO 33  -> Sump MID   float (INPUT_PULLUP, one wire to GND)
 *   GPIO 34  -> Sump HIGH  float (INPUT only - use external 10k pull-up to 3.3V)
 *   GPIO 19  -> Buzzer (active HIGH)
 *   GPIO 18  -> Status LED (RED = empty alarm)
 *   GPIO 23  -> Relay OUT (active LOW) - cuts pump if sump empty
 *
 * Float convention:
 *   Float UP (water present) -> reed switch CLOSED -> pin reads LOW
 *   Float DOWN (no water)    -> pin reads HIGH (pull-up)
 *
 * NOTE: GPIO 34-39 are input-only and have NO internal pull-ups.
 *       Add an external 10k resistor from the pin to 3.3V for HIGH float.
 */

#include <WiFi.h>
#include <WebServer.h>

// ===== USER CONFIG =====
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASSWORD";

// ===== PINS =====
#define PIN_SUMP_LOW    32
#define PIN_SUMP_MID    33
#define PIN_SUMP_HIGH   34   // input-only, needs external pull-up
#define PIN_BUZZER      19
#define PIN_LED_ALARM   18
#define PIN_PUMP_RELAY  23

#define RELAY_ON   LOW
#define RELAY_OFF  HIGH

// Timings
const unsigned long SAMPLE_MS    = 250;
const unsigned long ALARM_BEEP   = 500;   // buzzer on/off period when alarming

WebServer server(80);

bool sumpLow  = false;
bool sumpMid  = false;
bool sumpHigh = false;
int  sumpPercent = 0;
bool emptyAlarm  = false;
bool fullAlarm   = false;
bool pumpAllowed = true;

unsigned long lastSample = 0;
unsigned long lastBeep   = 0;
bool beepState = false;

bool readFloat(int pin) {
  return digitalRead(pin) == LOW;  // LOW = water present
}

void readSensors() {
  sumpLow  = readFloat(PIN_SUMP_LOW);
  sumpMid  = readFloat(PIN_SUMP_MID);
  sumpHigh = readFloat(PIN_SUMP_HIGH);

  // Estimate percentage from 3 floats
  if (sumpHigh)      sumpPercent = 100;
  else if (sumpMid)  sumpPercent = 65;
  else if (sumpLow)  sumpPercent = 30;
  else               sumpPercent = 5;

  emptyAlarm = !sumpLow;            // no water at the bottom float
  fullAlarm  =  sumpHigh;           // overflow risk

  // Pump dry-run protection
  pumpAllowed = sumpLow;
  digitalWrite(PIN_PUMP_RELAY, pumpAllowed ? RELAY_ON : RELAY_OFF);
  digitalWrite(PIN_LED_ALARM,  emptyAlarm  ? HIGH : LOW);
}

void handleAlarmBuzzer() {
  if (emptyAlarm || fullAlarm) {
    if (millis() - lastBeep > ALARM_BEEP) {
      lastBeep = millis();
      beepState = !beepState;
      digitalWrite(PIN_BUZZER, beepState ? HIGH : LOW);
    }
  } else {
    digitalWrite(PIN_BUZZER, LOW);
    beepState = false;
  }
}

String jsonStatus() {
  String s = "{";
  s += "\"sumpLow\":"     + String(sumpLow  ? "true" : "false") + ",";
  s += "\"sumpMid\":"     + String(sumpMid  ? "true" : "false") + ",";
  s += "\"sumpHigh\":"    + String(sumpHigh ? "true" : "false") + ",";
  s += "\"percent\":"     + String(sumpPercent) + ",";
  s += "\"emptyAlarm\":"  + String(emptyAlarm  ? "true" : "false") + ",";
  s += "\"fullAlarm\":"   + String(fullAlarm   ? "true" : "false") + ",";
  s += "\"pumpAllowed\":" + String(pumpAllowed ? "true" : "false");
  s += "}";
  return s;
}

void handleRoot() {
  String color = emptyAlarm ? "#ef4444" : (fullAlarm ? "#f59e0b" : "#22c55e");
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
                "<title>Sump Monitor</title><style>"
                "body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;text-align:center}"
                ".gauge{width:200px;height:200px;border-radius:50%;margin:20px auto;"
                "background:conic-gradient(" + color + " " + String(sumpPercent*3.6) + "deg,#1e293b 0);"
                "display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold}"
                ".inner{width:160px;height:160px;border-radius:50%;background:#0f172a;"
                "display:flex;align-items:center;justify-content:center}"
                ".card{background:#1e293b;border-radius:8px;padding:16px;margin:10px auto;max-width:400px}"
                ".alarm{color:#ef4444;font-weight:bold;font-size:20px}"
                "</style></head><body>"
                "<h1>Sump Tank Monitor</h1>"
                "<div class='gauge'><div class='inner'>" + String(sumpPercent) + "%</div></div>"
                "<div class='card'>"
                "<p>HIGH float: <b>" + String(sumpHigh ? "WET" : "DRY") + "</b></p>"
                "<p>MID  float: <b>" + String(sumpMid  ? "WET" : "DRY") + "</b></p>"
                "<p>LOW  float: <b>" + String(sumpLow  ? "WET" : "DRY") + "</b></p>"
                "<p>Pump relay: <b>" + String(pumpAllowed ? "ENABLED" : "BLOCKED (dry-run)") + "</b></p>";
  if (emptyAlarm) html += "<p class='alarm'>SUMP EMPTY!</p>";
  if (fullAlarm)  html += "<p class='alarm'>SUMP FULL!</p>";
  html += "</div><script>setTimeout(()=>location.reload(),2000)</script></body></html>";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_SUMP_LOW,   INPUT_PULLUP);
  pinMode(PIN_SUMP_MID,   INPUT_PULLUP);
  pinMode(PIN_SUMP_HIGH,  INPUT);          // external pull-up required
  pinMode(PIN_BUZZER,     OUTPUT);
  pinMode(PIN_LED_ALARM,  OUTPUT);
  pinMode(PIN_PUMP_RELAY, OUTPUT);
  digitalWrite(PIN_PUMP_RELAY, RELAY_OFF);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 15000) {
    delay(300); Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Sump monitor IP: "); Serial.println(WiFi.localIP());
  }

  server.on("/",       handleRoot);
  server.on("/status", [](){ server.send(200, "application/json", jsonStatus()); });
  server.begin();
}

void loop() {
  server.handleClient();
  if (millis() - lastSample > SAMPLE_MS) {
    lastSample = millis();
    readSensors();
    Serial.println(jsonStatus());
  }
  handleAlarmBuzzer();
}
