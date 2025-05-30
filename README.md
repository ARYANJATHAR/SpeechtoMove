# 🎤 SpeechtoMove — Voice Scroll Controller

Effortlessly scroll any webpage using **voice commands**!  
Unlock hands-free browsing for accessibility, productivity, and convenience.


---

## 🚀 Features

- 🎙️ **Voice-controlled scrolling** — Just say "up", "down", "top", "bottom", "page up", or "page down"
- 📝 **Works on PDFs** — Detects and scrolls within most embedded PDF viewers
- 💡 **Simple to use** — Clean interface and instant status notifications
- 🌐 **Universal** — Supports all websites and tabs

---

## 🛠️ Getting Started

### 1. **Install the Extension**

1. **Download or clone** this repository:
   ```bash
   git clone https://github.com/ARYANJATHAR/SpeechtoMove.git
   ```
2. Open your browser’s extensions page:  
   - **Chrome:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
3. **Enable Developer mode**
4. Click **Load unpacked** and select the `SpeechtoMove` folder

### 2. **Permissions**

The extension requires:
- `activeTab`
- `storage`
- `tabs`
- Access to all URLs

To enable scrolling everywhere you browse.

---

## 🎯 Usage

1. **Click the SpeechtoMove icon** in your browser toolbar
2. In the popup, **start voice recognition**
3. **Speak any of these commands:**  
   - `up`
   - `down`
   - `top`
   - `bottom`
   - `page up`
   - `page down`
4. **Watch the page scroll** based on your voice!

> **PDF Support:**  
> The extension auto-detects many PDF viewers and scrolls their content as well.

> **Status messages** will appear to confirm when recognition starts or stops.

---

## 📂 Project Structure

```
SpeechtoMove/
├── background.js       # Handles communication and recognition states
├── content.js          # Injected, listens for and executes scroll commands
├── popup.html          # UI for starting/stopping recognition
├── manifest.json       # Extension metadata and permissions
├── icon16.png, ...
```

---

## 📣 Feedback

Have an idea? Found a bug?  
[Open an issue](https://github.com/ARYANJATHAR/SpeechtoMove/issues) or star ⭐ the repo if you find it useful!

---

<p align="center">
  <b>Enhance your browsing experience with your voice!</b><br>
  <a href="https://github.com/ARYANJATHAR/SpeechtoMove">ARYANJATHAR/SpeechtoMove</a>
</p>
