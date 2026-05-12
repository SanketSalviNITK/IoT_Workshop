# THE LAST BEACON: Operational Dossier

**A Gamified IoT Experience by Dr. Sanket Salvi**

---

## 🌌 OVERVIEW
The world has gone dark. The global communication grid is shattered. You are a team of **Beacon Engineers** deployed to "The Island of Dharani." Your mission: Restore the abandoned Relay Station and transmit the "Last Beacon" signal to initiate a global rescue.

### 🎭 CHARACTER: A.R.I.A. (Automated Relay Interface Assistant)
A.R.I.A. is the station's AI. She is partially corrupted, her memory banks are fragmented, and her voice is glitchy. As the engineers repair subsystems, her personality becomes clearer and more stable.

---

## 🎖️ MISSION LOGISTICS

### MISSION 1: THE SPARK (Power Core Awakening)
*   **Narrative:** "Systems... failing... core temperature... absolute zero. I need... a pulse. Ignite the emergency core."
*   **Objective:** Blink the NodeMCU onboard LED or an external Red LED.
*   **IoT Concept:** GPIO Output, `digitalWrite()`, `delay()`.
*   **Success Condition:** Continuous rhythmic blinking.
*   **A.R.I.A. Log:** "> EMERGENCY POWER DETECTED. CORE STABILIZING."

### MISSION 2: ENGINEER AUTHENTICATION (Manual Override)
*   **Narrative:** "Identity... unknown. Access denied. Locate the manual override switch. Prove you are... flesh and blood."
*   **Objective:** Use a Push Button to toggle an LED.
*   **IoT Concept:** Digital Input, `digitalRead()`, Internal Pull-up.
*   **Success Condition:** LED toggles only when button is pressed.
*   **A.R.I.A. Log:** "> IDENTITY VERIFIED: BEACON ENGINEER ONLINE."

### MISSION 3: THE SIREN PROTOCOL (Defense Grid)
*   **Narrative:** "Perimeter compromised. Intruders in the shadows. We need... noise. Activate the warning sirens."
*   **Objective:** Generate an alarm sound using the Buzzer.
*   **IoT Concept:** PWM, `tone()`, Frequency modulation.
*   **Success Condition:** A clear, repeating siren pattern.
*   **A.R.I.A. Log:** "> DEFENSE GRID ACTIVE. INTRUDERS RETREATING."

### MISSION 4: THE GHOST IN THE CORRIDOR (Movement Tracking)
*   **Narrative:** "Something is moving... in Sector 7. The darkness... it has eyes. Restore the proximity detectors."
*   **Objective:** Use the IR Sensor to detect motion and trigger an LED.
*   **IoT Concept:** Sensor-based events, Boolean logic.
*   **Success Condition:** LED lights up immediately when IR detects an object.
*   **A.R.I.A. Log:** "> MOTION TRACKING ONLINE. SECTOR 7 CLEAR."

### MISSION 5: RADAR CALIBRATION (Drone Docking)
*   **Narrative:** "A rescue drone is approaching... but the landing lights are dead. Calculate the distance. Guide it home."
*   **Objective:** Use the Ultrasonic Sensor to measure distance.
*   **IoT Concept:** Pulse timing (`pulseIn`), Distance formula (Speed of sound).
*   **Success Condition:** Serial monitor prints accurate distance in cm.
*   **A.R.I.A. Log:** "> RADAR ARRAY CALIBRATED. DONE DOCKING INITIATED."

### MISSION 6: THE GARDEN OF EDEN (Life Support)
*   **Narrative:** "The atmosphere is thin... Oxygen scrubbers failing. Monitor the humidity and heat. Balance the world."
*   **Objective:** Interface with the DHT22 sensor.
*   **IoT Concept:** Data protocols (1-Wire), Float data types, Thresholds.
*   **Success Condition:** Real-time Temp/Humidity reading.
*   **A.R.I.A. Log:** "> LIFE SUPPORT RECOVERED. ATMOSPHERE: BREATHABLE."

---

## 🏆 FINAL MISSION: THE LAST BEACON
*   **Task:** Combine ALL previous code into one master system.
*   **Logic:**
    1.  Wait for Button Press (Engineer Auth).
    2.  Check IR (Security).
    3.  Verify Ultrasonic < 10cm (Drone Docked).
    4.  Verify DHT22 Temp < 40°C (Core Safe).
*   **Victory:** If all pass, LEDs Flash, Buzzer plays a melody, and Serial prints: **"BEACON SIGNAL TRANSMITTED. HUMANITY LIVES."**

---

## 🎮 GAMIFICATION MECHANICS
*   **XP System:** 100 XP per mission. +50 XP for the first team to finish.
*   **Badges:** 
    *   *Bug Hunter*: For fixing a compilation error.
    *   *Ghost Hunter*: For perfect IR sensor implementation.
*   **Leaderboard:** Tracked on the 3D Dashboard.
