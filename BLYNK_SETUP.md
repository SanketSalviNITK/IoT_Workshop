# THE LAST BEACON: Blynk Cloud Configuration

To link your Relay Station to the global grid, you must configure a **Blynk Template**. Follow these specifications exactly.

---

## 🏗️ 1. Create Template
1. Name: `The Last Beacon`
2. Hardware: `ESP8266`
3. Connection: `WiFi`

---

## 📊 2. DataStreams Setup
Create the following DataStreams under the **Datastreams** tab:

| Name | Virtual Pin | Data Type | Min/Max |
| :--- | :--- | :--- | :--- |
| **Authentication** | V0 | Integer | 0-1 |
| **Station Temp** | V1 | Double | -40 to 80 |
| **Station Hum** | V2 | Double | 0 to 100 |
| **Drone Dist** | V3 | Integer | 0 to 400 |
| **Security Alert** | V4 | String | N/A |

---

## 📱 3. Mobile Dashboard (App)
Add the following widgets to your smartphone dashboard:
- **Button Widget**: Linked to `V0` (Mode: Push).
- **Gauge Widget**: Linked to `V1` (Label: Temperature).
- **Gauge Widget**: Linked to `V2` (Label: Humidity).
- **Value Display**: Linked to `V3` (Label: Drone Distance).
- **LCD or Terminal**: Linked to `V4` (For A.R.I.A status messages).

---

## 🔔 4. Automation & Events
1. Go to the **Events** tab.
2. Create an Event called `Security Alert`.
3. Event Code: `security_breach`.
4. Message: `INTRUDER DETECTED IN SECTOR 7!`.
5. Notification: Enable Push Notifications.

---

## 🔑 5. The Auth Token
Once the Template is saved, go to **Search** > **Your Device**. Copy the `BLYNK_AUTH_TOKEN` and paste it into your `final_beacon.ino` sketch.
