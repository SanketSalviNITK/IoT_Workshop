# THE LAST BEACON: Engineer's Setup Guide

Before arriving at the Island of Dharani, all engineers must prepare their workstations. Follow these steps to ensure your "Neural Core" (NodeMCU) is ready for deployment.

---

## 🛠️ Step 1: Install Arduino IDE
1. Download and install the latest version of **Arduino IDE 2.x**.
2. [Download Link](https://www.arduino.cc/en/software)

---

## 🔌 Step 2: Setup ESP8266 Board Manager
1. Open Arduino IDE.
2. Go to `File` > `Preferences`.
3. In "Additional Boards Manager URLs", paste the following:
   `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
4. Go to `Tools` > `Board` > `Boards Manager`.
5. Search for **ESP8266** and click **Install**.

---

## 📚 Step 3: Install Required Libraries
You need the following "Data Protocols" to communicate with your hardware:
1. Go to `Sketch` > `Include Library` > `Manage Libraries`.
2. Search and Install:
   - **DHT sensor library** (by Adafruit) - *Install all dependencies when prompted.*
   - **Blynk** (by Volodymyr Shymanskyy).

---

## ☁️ Step 4: Blynk Cloud Account
1. Create a free account at [Blynk.cloud](https://blynk.cloud).
2. Download the **Blynk IoT App** on your smartphone.

---

## ✅ Step 5: Connectivity Check
1. Connect your NodeMCU to your laptop via Micro-USB.
2. In Arduino IDE, go to `Tools` > `Board` > `ESP8266 Boards` > **NodeMCU 1.0 (ESP-12E Module)**.
3. Select the correct **Port** (e.g., COM3 or COM4).
4. Upload an empty sketch to verify the connection.

---

**Status: READY FOR MISSION 1.**
