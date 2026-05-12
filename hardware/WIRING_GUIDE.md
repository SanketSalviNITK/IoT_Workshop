# 🔌 THE LAST BEACON: MASTER WIRING GUIDE

This guide provides the official pin mapping for the NodeMCU (ESP8266) Command Station. Ensure all ground (GND) lines are common.

## 📍 Pin Mapping Table

| NodeMCU Pin | Component | Description |
| :--- | :--- | :--- |
| **D0** | **Push Button** | Master Ignition / Reset Switch (Use INPUT_PULLUP) |
| **D1** | **Red LED** | Primary Warning Light |
| **D2** | **Green LED** | System Ready Light |
| **D3** | **DHT22** | Atmospheric / Climate Sensor (Data Pin) |
| **D5** | **Buzzer** | Audio Alarm / Siren |
| **D6** | **Ultrasonic (Trig)** | Distance Sensor Trigger Pin |
| **D7** | **Ultrasonic (Echo)** | Distance Sensor Echo Pin |
| **D8** | **IR Sensor** | Motion Detection (Digital Out) |

---

## ⚡ Power Connections
*   **VCC / 3.3V**: Connect to the positive rail for the DHT22, IR Sensor, and Ultrasonic Sensor.
*   **GND**: Connect all component Ground pins to the NodeMCU GND pin.
*   **Resistors**: 
    *   LEDs: 220Ω resistor in series with the positive leg.
    *   Button: No external resistor needed if using `INPUT_PULLUP` in code.

---

## 📸 Component Specifics
### 1. DHT22
*   Pin 1: 3.3V
*   Pin 2: D3 (Data)
*   Pin 4: GND

### 2. Ultrasonic Sensor (HC-SR04)
*   VCC: 3.3V (or 5V if available on Vin)
*   Trig: D6
*   Echo: D7
*   GND: GND

### 3. IR Sensor
*   VCC: 3.3V
*   Out: D8
*   GND: GND

---

## 🛡️ A.R.I.A. Calibration Note
Ensure the **Push Button** is connected between **D0** and **GND**. The software uses internal pull-up resistors, so the button will read `LOW` when pressed.
