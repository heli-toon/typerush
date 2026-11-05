# TypeRush — GameMonetize Web Edition

This directory contains the standalone web version of **TypeRush**, specifically packaged and formatted according to [GameMonetize.com](https://gamemonetize.com) publishing requirements and the [GameMonetize SDK](https://github.com/MonetizeGame/GameMonetize.com-SDK).

---

## 📁 Directory Structure (GameMonetize Format)

GameMonetize strictly requires that `index.html` resides directly at the **root** of the `.zip` archive:

```text
web/
├── index.html            # Main HTML5 entrypoint with GameMonetize SDK integration
├── css/
│   └── styles.css        # Responsive stylesheets, themes, and ad overlay styles
├── js/
│   └── script.js         # Pure client-side game logic & GameMonetize ad lifecycle hooks
├── images/
│   └── logo.png          # Game icon / logo asset
├── data/
│   ├── typing-texts.json # Default typing practice corpus
│   └── html-snippets.json# Default code snippets
├── build_zip.py          # Helper script to create a GameMonetize-compliant .zip
└── README.md             # Integration & publishing guide
```

---

## 🔑 What You Need To Fill In: Game ID

Before publishing, GameMonetize requires your unique **Game ID** (Game Hash) generated when you add a game in your developer portal.

### Steps to retrieve and set your Game ID:
1. Log in to your [GameMonetize Developer Panel](https://gamemonetize.com).
2. Go to **Game Management** > **Add Game** (or select your existing game under **My Games**).
3. Copy your assigned **Game ID / Game Hash**.
4. Open `web/index.html` and locate line 19:
   ```javascript
   window.SDK_OPTIONS = {
       gameId: "YOUR_GAMEMONETIZE_GAME_ID", // <-- Replace with your actual Game ID
       ...
   };
   ```
5. Replace `"YOUR_GAMEMONETIZE_GAME_ID"` with your actual ID string (e.g. `"abcdef1234567890abcdef1234567890"`).

---

## 📺 Ad Integration Details

The GameMonetize SDK is integrated via the official asynchronous loader snippet in `<head>`.

### 1. Ad Triggers (`sdk.showBanner()`)
Ads are invoked at natural gameplay breaks and transition points:
* **Typing Test Complete**: Triggers when the user completes a typing test.
* **HTML Practice Complete**: Triggers when an HTML code snippet drill finishes.
* **Word Race Finished**: Triggers when the 30-second countdown expires.
* **Typing Shooter Game Over**: Triggers when all 3 shield lives are lost.

### 2. Pause & Resume Handling
GameMonetize strictly requires audio muting and gameplay pausing while video ads play:
* `SDK_GAME_PAUSE`: Automatically halts active timers, stops falling words in the shooter mode, disables input textareas, and displays a friendly **"Game Paused — Ad in Progress"** overlay. Time elapsed during ads is offset so user WPM is never penalized.
* `SDK_GAME_START`: Hides the overlay, restores timer intervals with the proper time offset, and refocuses the active input so the player can immediately resume. Any end-of-game alert dialog is gracefully held until after the ad finishes.

---

## 🧪 Testing Locally

To test the web build locally with a static web server:

```bash
cd web
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

> [!NOTE]
> During local testing, GameMonetize SDK may display a notice or placeholder in your browser console indicating the SDK is running in local/test mode or if an ad blocker is enabled.

---

## 📦 Packaging for GameMonetize Upload

GameMonetize rejects archives if the zip contains an outer enclosing folder. To produce a compliant zip:

### Option A: Using the included build script (Recommended)
From the project root:
```bash
python3 web/build_zip.py
```
This generates `typerush-gamemonetize.zip` with `index.html` directly at the top level.

### Option B: Manual compression
1. Open the `web` folder.
2. Select all files and folders inside (`index.html`, `css`, `js`, `images`, `data`).
3. Right-click and choose **Compress / Send to Zip**.

---

## 🚀 GameMonetize Submission Checklist

1. [ ] Replaced `YOUR_GAMEMONETIZE_GAME_ID` in `web/index.html`.
2. [ ] Built `typerush-gamemonetize.zip` using `python3 web/build_zip.py`.
3. [ ] Uploaded `typerush-gamemonetize.zip` to GameMonetize dashboard under **Upload Game**.
4. [ ] Clicked **Verify Game** on GameMonetize to test SDK detection.
5. [ ] Clicked **Request Activation** to submit for monetization!
