/*
 * MISSION 4: CLIMATE PULSE
 * Objective: Sync DHT22 data with A.R.I.A.'s atmospheric engine.
 * 
 * --- WIRING DIRECTIVE ---
 * [KEEP PREVIOUS CONNECTIONS]
 * 1. DHT22 DATA -> Pin D3
 * 2. DHT22 VCC  -> 3.3V
 * ------------------------
 */

#include "DHT.h"

#define DHTPIN D3
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// [ CHALLENGE ZONE ]
// Update this ID based on your Team ID from the dashboard!
String teamID = "0"; // REPLACE WITH YOUR ID (e.g., "7")

void setup() {
  Serial.begin(115200);
  dht.begin();

  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | ATMOSPHERIC SCANNER");
  Serial.println("-----------------------------------------");
}

void loop() {
  delay(2000);

  float t = dht.readTemperature();
  if (isnan(t)) {
    Serial.println("> ERROR: DHT SENSOR OFFLINE");
    return;
  }

  // [ CHALLENGE LOGIC ]
  // A.R.I.A. expects: BEACON_CORE_X: [TEMP]
  Serial.print("BEACON_CORE_");
  Serial.print(teamID);
  Serial.print(": ");
  Serial.println(t);
}
