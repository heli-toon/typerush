# 🎮 TypeRush Typing Test Web App

A beautiful, interactive typing test application with multiple modes, games, and themes. Built with Flask backend and modern web technologies.

## ✨ Features

### 🎯 Typing Modes
- **Standard Typing Test**: Practice with random texts and track your WPM and accuracy
- **HTML Practice Mode**: Improve your coding speed with HTML snippets
- **Real-time Stats**: Live WPM, accuracy, and timer tracking

### 🎮 Mini Games
- **Word Race**: Race against the clock to type as many words as possible
- **Typing Shooter**: Shoot falling words by typing them correctly

### 🎨 Customization
- **4 Beautiful Themes**: Dark, Blue, and Light
- **Theme Persistence**: Your theme choice is saved automatically
- **Responsive Design**: Works perfectly on all devices
### 📊 Stats
- **List of relevant stats**
### ⚙️ Content Management
- **Dynamic Content**: Add/edit typing texts and HTML snippets from the UI
- **No File Editing**: Update content directly in the browser
- **Persistent Storage**: Changes are saved to JSON files

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher

### Installation & Running

1. **Clone or navigate to the project directory**

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

3. **Run the Application**:
```bash
python app.py
```

* **Native Desktop Window (Default)**: Automatically launches TypeRush in a clean, self-contained desktop application window (powered by `pywebview`) without opening your browser.
* **Browser Mode**: If you ever want to run it in a regular browser tab, simply pass the flag:
```bash
python app.py --browser
```

## 📱 Usage

### Getting Started
1. **Choose Your Theme**: Select from 3 beautiful themes in the top-right corner
2. **Pick a Mode**: Use the navigation tabs to switch between different typing modes
3. **Start Typing**: Click "Start Test" and begin typing!

### Typing Test Mode
- Click "🚀 Start Test" to begin
- Type the displayed text as accurately as possible
- Watch your WPM and accuracy update in real-time
- Use "📄 New Text" to get a different text

### HTML Practice Mode
- Perfect for developers wanting to improve coding speed
- Practice with real HTML snippets
- Same timing and accuracy tracking as the standard test

### Word Race Game
- 30-second challenge to type as many words as possible
- Press Enter after each word
- Score points based on word length

### Typing Shooter Game
- Type falling words to "shoot" them before they hit the bottom
- 3 lives to start with
- Score points for each successful hit

### Content Management
- Go to "⚙️ Manage Content" tab
- Add your own typing texts (one per line)
- Add your own HTML snippets (one per line)
- Click "💾 Save" to update the content
- Changes take effect immediately

## 🎨 Themes

- **🌙 Dark**: Classic dark theme for comfortable typing
- **💙 Blue**: Cool blue theme for focus
- **☀️ Light**: Clean light theme for day use

## 📦 Packaging for Distribution

This app is designed to work with PyInstaller for standalone distribution:

```bash
# Install PyInstaller
python -m pip install pyinstaller

# Create executable (run from project directory)
pyinstaller --onefile --windowed --add-data "templates;templates" --add-data "static;static" --icon "logo.ico" app.py

```

## 🛠️ Technical Details

### Backend
- **Flask**: Lightweight Python web framework
- **Auto Port Detection**: Finds available ports automatically
- **JSON Storage**: Simple file-based content storage
- **RESTful API**: Clean API endpoints for content management

### Frontend
- **Vanilla JavaScript**: No heavy frameworks, just clean JS
- **CSS3**: Modern styling with animations and transitions
- **Responsive Design**: Mobile-first approach
- **Local Storage**: Theme preferences and scores saved locally

### Project Structure
```
├── app.py                 # Flask backend
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── styles.css    # All styles and themes
│   ├── js/
│   │   └── script.js     # Application logic
│   └── data/
│       ├── typing-texts.json    # Typing test texts
│       └── html-snippets.json   # HTML practice snippets
└── README.md
```

## 🎯 Pro Tips

1. **Use all 10 fingers** for maximum typing speed
2. **Focus on accuracy first**, speed will follow
3. **Take regular breaks** to avoid strain
4. **Practice different types of content** using the content manager
5. **Try all themes** to find what works best for you
6. **Play the games** to make practice more engaging

## 🐛 Troubleshooting

**App won't start?**
- Make sure Python and Flask are installed
- Check if the port is available
- Try running with `python -m flask run`

**Browser doesn't open automatically?**
- Check the terminal for the URL
- Manually navigate to `http://127.0.0.1:5000` (or the displayed port)

**Content not saving?**
- Check file permissions in the project directory
- Ensure the `static/data/` folder exists

## 🤝 Contributing

Feel free to enhance this app! Some ideas:
- Add more typing games
- Implement user accounts and statistics
- Add sound effects and animations
- Create more themes
- Add difficulty levels

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Typing! 🎉**

Made with ❤️ for typing enthusiasts everywhere!