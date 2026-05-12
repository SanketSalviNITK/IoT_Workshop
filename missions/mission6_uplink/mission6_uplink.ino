/*
 * MISSION 6: VOID UPLINK
 * Objective: Establish a secure Blynk cloud telemetry uplink.
 * 
 * --- WIRING DIRECTIVE ---
 * [ALL SYSTEMS ONLINE]
 * No new components. Ensure WiFi is available.
 * ------------------------
 */

/* Fill-in your Template ID (from Blynk Device Info) */
#define BLYNK_TEMPLATE_ID   "TMPL0000"
#define BLYNK_TEMPLATE_NAME "TheLastBeacon"
#define BLYNK_AUTH_TOKEN    "YourAuthToken"

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include "DHT.h"

char ssid[] = "YourNetworkName";
char pass[] = "YourPassword";

#define DHTPIN D3
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

BlynkTimer timer;

// [ CHALLENGE ZONE ]
// Set this to the Virtual Pin assigned to your team!
const int V_PIN = V1; // REPLACE WITH YOUR ASSIGNED PIN

void sendSensorData() {
  float h = dht.readHumidity();
  if (!isnan(h)) {
    // [ CHALLENGE LOGIC ]
    Blynk.virtualWrite(V_PIN, h);
    Serial.print("> Humidity Uplinked: ");
    Serial.println(h);
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
  
  // Send data every 2 seconds
  timer.setInterval(2000L, sendSensorData);
  
  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | CLOUD UPLINK ENGAGED");
  Serial.println("-----------------------------------------");
}

void loop() {
  Blynk.run();
  timer.run();
}
