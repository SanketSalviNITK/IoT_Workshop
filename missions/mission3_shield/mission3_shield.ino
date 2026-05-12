/*
 * MISSION 3: SONIC SHIELD
 * Objective: Deploy a sonar perimeter using the Ultrasonic Sensor.
 * 
 * --- WIRING DIRECTIVE ---
 * [KEEP PREVIOUS CONNECTIONS]
 * 1. ULTRASONIC TRIG -> Pin D6
 * 2. ULTRASONIC ECHO -> Pin D7
 * 3. BUZZER          -> Pin D5 & GND
 * ------------------------
 */

#include <Arduino.h>

const int TRIG_PIN = D6;
const int ECHO_PIN = D7;
const int BUZZER_PIN = D5;

// [ CHALLENGE ZONE ]
// Set this value based on your Dashboard briefing!
const int DISTANCE_LIMIT = 20; // REPLACE THIS VALUE (in cm)

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | SONAR PERIMETER ACTIVE");
  Serial.println("-----------------------------------------");
}

void loop() {
  // Trigger Ultrasonic
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read Echo
  long duration = pulseIn(ECHO_PIN, HIGH);
  int distance = duration * 0.034 / 2;

  Serial.print("> Current Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // [ CHALLENGE LOGIC ]
  if (distance < DISTANCE_LIMIT && distance > 0) {
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("> ALERT: PERIMETER BREACH DETECTED!");
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  delay(200);
}
