/*
 * MISSION 1: THE SPARK
 * Objective: Initialize the Beacon's status lights.
 * 
 * --- WIRING DIRECTIVE ---
 * 1. RED LED   -> Pin D1 (via 220ohm resistor)
 * 2. GREEN LED -> Pin D2 (via 220ohm resistor)
 * 3. Both LEDs -> GND
 * ------------------------
 */

const int RED = D1;
const int GREEN = D2;

// [ CHALLENGE ZONE ]
// Update with your team's delay value from the dashboard!
const int SPARK_DELAY = 150; 

void setup() {
  Serial.begin(115200);
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);

  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | SPARK PROTOCOL ENGAGED");
  Serial.println("-----------------------------------------");
}

void loop() {
  digitalWrite(RED, HIGH);
  digitalWrite(GREEN, LOW);
  delay(SPARK_DELAY);

  digitalWrite(RED, LOW);
  digitalWrite(GREEN, HIGH);
  delay(SPARK_DELAY);
  
  Serial.println("> PULSE_DETECTED: System warming up...");
}
