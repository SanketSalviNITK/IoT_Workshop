/*
 * MISSION 2: MANUAL IGNITION
 * Objective: Hold the ignition button to prime the power core.
 * 
 * --- WIRING DIRECTIVE ---
 * [KEEP PREVIOUS CONNECTIONS]
 * 1. PUSH BUTTON -> Pin D0 & GND
 * ------------------------
 */

const int BUTTON_PIN = D0;
const int RED_LED = D1;
const int GREEN_LED = D2;

// [ CHALLENGE ZONE ]
// Hold time in milliseconds (e.g., 3000 for 3 seconds)
const unsigned long REQUIRED_HOLD = 3000; 

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | IGNITION SEQUENCE");
  Serial.println("-----------------------------------------");
}

void loop() {
  // Check if button is pressed (LOW when using INPUT_PULLUP)
  if (digitalRead(BUTTON_PIN) == LOW) {
    Serial.println("> PRIMARY IGNITION DETECTED. CHARGING...");
    
    // Simple verification for the workshop: use a specific delay
    // that matches the team's assigned hold time.
    delay(REQUIRED_HOLD);
    
    if (digitalRead(BUTTON_PIN) == LOW) {
      digitalWrite(RED_LED, HIGH);
      digitalWrite(GREEN_LED, HIGH);
      Serial.println("IGNITION_COMPLETE");
      Serial.println("> CORE STABILIZED. POWER GRID ONLINE.");
      while(true); // Stop here
    }
  } else {
    // Pulse LEDs to show it's waiting
    digitalWrite(RED_LED, HIGH);
    delay(100);
    digitalWrite(RED_LED, LOW);
    delay(100);
  }
}
