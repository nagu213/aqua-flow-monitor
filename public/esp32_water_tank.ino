/*
 * ESP32 Water Tank Level Indicator with Float Sensors
 * --------------------------------------------------
 * - Overhead tank: HIGH float (auto-stop pump) + LOW float (auto-start pump)
 * - Sump tank:    LOW float (dry-run protection - stop pump if sump empty)
 * - Relay drives motor pump contactor
 * - Sends JSON status over Serial + simple WiFi web UI
 *
 * Wiring (ESP32 DevKit):
 *   GPIO 25  -> Overhead HIGH float (one wire to GND, INPUT_PULLUP)
 *   GPIO 26  -> Overhead LOW  float (one wire to GND, INPUT_PULLUP)
 *   GPIO 27  -> Sump      LOW  float (one wire to GND, INPUT_PULLUP)
 *   GPIO 23  -> Relay IN  (active LOW)  -> Motor contactor coil
 *   GPIO 2   -> Built-in LED (status)
 *
 * Float convention used here:
 *   Float UP  (water reaches sensor) -> reed switch CLOSED -> pin reads LOW
 *   Float DOWN (no water at sensor)  -> pin reads HIGH (pull-up)
 */

#include <WiFi.h>
#include <WebServer.h>

// ===== USER CONFIG =====
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASSWORD";

// ===== PINS =====
#define PIN_OVERHEAD_HIGH 25
#define PIN_OVERHEAD_LOW  26
#define PIN_SUMP_LOW      27
#define PIN_RELAY         23
#define PIN_LED           2

// Relay logic (most modules are active-LOW)
#define RELAY_ON   LOW
#define RELAY_OFF  HIGH

// Debounce
const unsigned long DEBOUNCE_MS = 200;

WebServer server(80);

bool overheadHigh = false; // true = water at HIGH mark (tank ~full)
bool overheadLow  = false; // true = water at LOW  mark (tank not empty)
bool sumpLow      = false; // true = water at LOW  mark in sump (sump has water)
bool pumpOn       = false;
bool autoMode     = true;

unsigned long lastRead = 0;

bool readFloat(int pin) {
  // LOW = float lifted (water present)
  return digitalRead(pin) == LOW;
}

void setPump(bool on) {
  pumpOn = on;
  digitalWrite(PIN_RELAY, on ? RELAY_ON : RELAY_OFF);
  digitalWrite(PIN_LED, on ? HIGH : LOW);
}

void readSensors() {
  overheadHigh = readFloat(PIN_OVERHEAD_HIGH);
  overheadLow  = readFloat(PIN_OVERHEAD_LOW);
  sumpLow      = readFloat(PIN_SUMP_LOW);
}

void controlLogic() {
  if (!autoMode) return;

  // Dry-run protection: never run pump if sump is empty
  if (!sumpLow) {
    if (pumpOn) {
      Serial.println("[AUTO] Sump empty - stopping pump (dry-run protection)");
      setPump(false);
    }
    return;
  }

  // Auto stop when overhead full
  if (overheadHigh && pumpOn) {
    Serial.println("[AUTO] Overhead FULL - stopping pump");
    setPump(false);
  }

  // Auto start when overhead drops below LOW mark
  if (!overheadLow && !pumpOn) {
    Serial.println("[AUTO] Overhead LOW - starting pump");
    setPump(true);
  }
}

String jsonStatus() {
  String s = "{";
  s += "\"overheadHigh\":" + String(overheadHigh ? "true" : "false") + ",";
  s += "\"overheadLow\":"  + String(overheadLow  ? "true" : "false") + ",";
  s += "\"sumpLow\":"      + String(sumpLow      ? "true" : "false") + ",";
  s += "\"pumpOn\":"       + String(pumpOn       ? "true" : "false") + ",";
  s += "\"autoMode\":"     + String(autoMode     ? "true" : "false");
  s += "}";
  return s;
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
                "<title>Water Tank</title><style>body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:20px}"
                ".card{background:#1e293b;border-radius:8px;padding:16px;margin:10px 0}"
                "button{background:#3b82f6;color:#fff;border:0;padding:12px 24px;border-radius:6px;font-size:16px;margin:4px}"
                ".off{background:#ef4444}</style></head><body>"
                "<h1>Water Tank Monitor</h1>"
                "<div class='card'><h2>Status</h2>"
                "<p>Overhead HIGH: <b>" + String(overheadHigh ? "WET" : "DRY") + "</b></p>"
                "<p>Overhead LOW:  <b>" + String(overheadLow  ? "WET" : "DRY") + "</b></p>"
                "<p>Sump LOW:      <b>" + String(sumpLow      ? "WET" : "DRY") + "</b></p>"
                "<p>Pump: <b>" + String(pumpOn ? "RUNNING" : "STOPPED") + "</b></p>"
                "<p>Mode: <b>" + String(autoMode ? "AUTO" : "MANUAL") + "</b></p>"
                "</div>"
                "<a href='/pump/on'><button>Start Pump</button></a>"
                "<a href='/pump/off'><button class='off'>Stop Pump</button></a>"
                "<a href='/mode'><button>Toggle Auto/Manual</button></a>"
                "<script>setTimeout(()=>location.reload(),2000)</script>"
                "</body></html>";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_OVERHEAD_HIGH, INPUT_PULLUP);
  pinMode(PIN_OVERHEAD_LOW,  INPUT_PULLUP);
  pinMode(PIN_SUMP_LOW,      INPUT_PULLUP);
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_LED,   OUTPUT);
  setPump(false);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 15000) {
    delay(300); Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("IP: "); Serial.println(WiFi.localIP());
  }

  server.on("/",         handleRoot);
  server.on("/status",   [](){ server.send(200, "application/json", jsonStatus()); });
  server.on("/pump/on",  [](){ autoMode = false; setPump(true);  server.sendHeader("Location","/"); server.send(303); });
  server.on("/pump/off", [](){ autoMode = false; setPump(false); server.sendHeader("Location","/"); server.send(303); });
  server.on("/mode",     [](){ autoMode = !autoMode; server.sendHeader("Location","/"); server.send(303); });
  server.begin();
}

void loop() {
  server.handleClient();

  if (millis() - lastRead > DEBOUNCE_MS) {
    lastRead = millis();
    readSensors();
    controlLogic();
    Serial.println(jsonStatus());
  }
}
