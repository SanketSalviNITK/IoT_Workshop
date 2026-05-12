/*
 * MISSION 5: SENTRY ACKNOWLEDGE
 * Objective: Reset the security alarm using the physical button.
 * 
 * --- WIRING DIRECTIVE ---
 * [KEEP PREVIOUS CONNECTIONS]
 * 1. IR SENSOR OUT -> Pin D8
 * 2. IR SENSOR VCC -> 3.3V
 * ------------------------
 */

const int IR_PIN = D8;
const int BUZZER_PIN = D5;
const int BUTTON_PIN = D0;

// [ CHALLENGE ZONE ]
// Update with your Team ID from the dashboard
String teamID = "0"; 

bool alarmActive = false;

void setup() {
  Serial.begin(115200);
  pinMode(IR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  Serial.println("\n\n-----------------------------------------");
  Serial.println("A.R.I.A. v4.2 | SENTRY ACKNOWLEDGE");
  Serial.println("-----------------------------------------");
}

void loop() {
  int motion = digitalRead(IR_PIN);

  if (motion == LOW && !alarmActive) {
    alarmActive = true;
    Serial.println("> SECURITY BREACH! WAITING FOR ACKNOWLEDGMENT...");
  }

  if (alarmActive) {
    // Sound the alarm
    digitalWrite(BUZZER_PIN, HIGH);
    
    // Check for physical reset button press
    if (digitalRead(BUTTON_PIN) == LOW) {
      digitalWrite(BUZZER_PIN, LOW);
      alarmActive = false;
      
      // [ CHALLENGE LOGIC ]
      Serial.print("SEC_ACK_");
      Serial.println(teamID);
      Serial.println("> ALARM SILENCED. STATION SECURED.");
      delay(1000);
    }
  }
}
