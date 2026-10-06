# 🛒 Stock Watcher — Chrome Extension (Manifest V3)

**Stock Watcher** is a modern, lightweight browser extension built for automated stock tracking across online retailers in Spain. Operating quietly in the background via a Service Worker, it delivers real-time notifications to both your desktop and smartphone the moment a product comes back in stock.

> 📢 **Language Notice:** This extension is currently only available in Spanish (Castellano).

---

## 🎯 Why I Built This

I created **Stock Watcher** out of sheer frustration with existing "free" stock-tracking extensions hidden behind heavy paywalls and severe feature limits. 

The real catalyst was trying to buy the **Nintendo Switch 2 Zelda Edition**—a console that was constantly sold out due to scalpers sweeping up stock instantly. I needed a fast, reliable, and completely unrestricted tool that could monitor store pages in real time and alert my phone immediately without charging a subscription fee.

---

## ✨ Key Features

* **🧭 SidePanel UI:** Native interface integrated into Chrome's side panel for quick management without interrupting your browsing session.
* **⚡ Lightweight Background Monitoring:** Uses the `chrome.alarms` API and an optimized Service Worker to minimize CPU and RAM usage.
* **⏸️ Flexible Pause Controls:** 
  * **Global Pause:** Freeze stock checking across all products with a single click.
  * **Individual Pause:** Pause or resume tracking for specific items without removing them.
* **📱 Mobile & Desktop Alerts:**
  * Native Chrome notifications on your desktop.
  * Free **Telegram Bot API** integration to receive instant push alerts on your smartphone.
* **🎨 Color-Coded Status Cards:** Pastel color scheme for instant visual identification:
  * 🟢 **Pastel Green:** In Stock (`IN_STOCK`).
  * 🔴 **Pastel Red:** Out of Stock (`OUT_OF_STOCK`).
  * 🟡 **Pastel Yellow:** Unknown or unverified status.
* **🛡️ Safe Tab Management (`activeTabs`):** Opens store pages in background tabs to inspect content and automatically closes them, cleanly distinguishing between extension tabs and your manual browsing tabs.

---

## 🛠️ Tech Stack

* **JavaScript (ES6+)**
* **Chrome Extension API Manifest V3** (`chrome.alarms`, `chrome.sidePanel`, `chrome.storage.local`, `chrome.notifications`)
* **HTML5 / CSS3 (Flexbox & CSS Variables)**
* **Telegram Bot API (fetch HTTP)**

---

## 📲 Mobile Notifications Setup (Telegram)

To receive availability alerts directly on your phone:

1. Create a bot on Telegram using **[@BotFather](https://t.me/BotFather)** and copy your **Bot Token**.
2. Get your **Chat ID** by sending a message to your bot and querying the Telegram API.
3. Update the `BOT_TOKEN` and `CHAT_ID` variables inside the notification function in `background.js`:
   ```javascript
   const BOT_TOKEN = "YOUR_BOT_TOKEN";
   const CHAT_ID = "YOUR_CHAT_ID";
