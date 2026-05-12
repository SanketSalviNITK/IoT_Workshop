/*
 * MISSION 7: THE LAST BEACON
 * Objective: Integrated launch sequence requiring local and remote keys.
 * 
 * --- WIRING DIRECTIVE ---
 * [ALL SYSTEMS ONLINE]
 * No new components. Double-Key Handshake mode.
 * ------------------------
 */

#define BLYNK_TEMPLATE_ID   "TMPL0000"
#define BLYNK_TEMPLATE_NAME "TheLastBeacon"
#define BLYNK_AUTH_TOKEN    "YourAuthToken"

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

char ssid[] = "YourNetworkName";
char pass[] = "YourPassword";

const int PHYSICAL_BUTTON = D0;
bool remoteKeyPressed = false;

// [ CHALLENGE ZONE ]
// Use your team name as shown on the dashboard
String teamName = "Vajra Vanguard"; 

BLYNK_WRITE(V10) {
  remoteKeyPressed = (param.asInt() == 1);
  if(remoteKeyPressed) Serial.println("> REMOTE KEY DETECTED. AWAITING LOCAL KEY...");
}

void setup() {
  Serial.begin(115200);
  pinMode(PHYSICAL_BUTTON, INPUT_PULLUP);
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | DOUBLE-KEY HANDSHAKE");
  Serial.println("-----------------------------------------");
  Serial.println("> READY. PRESS LOCAL BUTTON AND BLYNK V10.");
}

void loop() {
  Blynk.run();

  // [ CHALLENGE LOGIC ]
  // Check if BOTH the physical button AND the Blynk button are active
  if (digitalRead(PHYSICAL_BUTTON) == LOW && remoteKeyPressed) {
    Serial.print("[");
    Serial.print(teamName);
    Serial.println("]: BEACON_LAUNCH");
    
    Serial.println("> HANDSHAKE COMPLETE. BEACON LAUNCHED!");
    delay(5000); // Prevent double triggering
  }
}
