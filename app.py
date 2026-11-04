import os
import sys
import json
import socket
import argparse
import threading
from flask import Flask, render_template, jsonify, request

# Determine base and data storage directories
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
    USER_DATA_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    USER_DATA_DIR = BASE_DIR

DATA_DIR = os.path.join(USER_DATA_DIR, 'static', 'data')
DEFAULT_DATA_DIR = os.path.join(BASE_DIR, 'static', 'data')

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/typing-texts')
def get_typing_texts():
    target_path = os.path.join(DATA_DIR, 'typing-texts.json')
    fallback_path = os.path.join(DEFAULT_DATA_DIR, 'typing-texts.json')
    
    path_to_read = target_path if os.path.exists(target_path) else fallback_path
    try:
        with open(path_to_read, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({"texts": ["The quick brown fox jumps over the lazy dog."]})

@app.route('/api/html-snippets')
def get_html_snippets():
    target_path = os.path.join(DATA_DIR, 'html-snippets.json')
    fallback_path = os.path.join(DEFAULT_DATA_DIR, 'html-snippets.json')
    
    path_to_read = target_path if os.path.exists(target_path) else fallback_path
    try:
        with open(path_to_read, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({"snippets": ["<div class=\"container\">Hello World</div>"]})

@app.route('/api/typing-texts', methods=['POST'])
def update_typing_texts():
    try:
        data = request.get_json()
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(os.path.join(DATA_DIR, 'typing-texts.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/html-snippets', methods=['POST'])
def update_html_snippets():
    try:
        data = request.get_json()
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(os.path.join(DATA_DIR, 'html-snippets.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

def find_available_port(host='127.0.0.1', start_port=5000, max_attempts=100):
    """Find an available local port starting from `start_port`."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue
    raise RuntimeError("No available port found")

def launch_browser_mode():
    """Runs Flask and opens in the system browser."""
    import webbrowser
    port = find_available_port('127.0.0.1', 5000, 100)
    threading.Timer(1.2, lambda: webbrowser.open(f'http://127.0.0.1:{port}')).start()
    print(f"🚀 Starting TypeRush in browser mode on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False)

def launch_desktop_mode(debug=False):
    """Option A: Launches TypeRush in a native desktop window using pywebview."""
    try:
        import webview
    except ImportError:
        print("⚠️  'pywebview' is not installed. Falling back to browser mode.")
        print("💡 Run: pip install -r requirements.txt to enable native desktop mode.")
        launch_browser_mode()
        return

    # On Linux, detect available GUI toolkit to prevent spurious warnings
    gui_backend = None
    if sys.platform.startswith('linux'):
        try:
            import gi
            for ver in ['4.1', '4.0', '6.0']:
                try:
                    gi.require_version('WebKit2' if ver != '6.0' else 'WebKit', ver)
                    gui_backend = 'gtk'
                    break
                except ValueError:
                    continue
        except ImportError:
            pass

    print("⚡ Launching TypeRush Native Desktop Window...")
    try:
        window = webview.create_window(
            title='TypeRush — Precision Typing & Code Trainer',
            url=app,
            width=1120,
            height=820,
            min_size=(780, 580),
            background_color='#090b10',
            text_select=True
        )
        if gui_backend:
            webview.start(gui=gui_backend, debug=debug)
        else:
            webview.start(debug=debug)
    except Exception as e:
        print(f"⚠️  Could not start desktop window ({e}). Falling back to browser mode...")
        launch_browser_mode()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="TypeRush Typing & Code Trainer")
    parser.add_argument('--browser', action='store_true', help="Force launch in external web browser")
    parser.add_argument('--debug', action='store_true', help="Enable inspector devtools in desktop window")
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)

    if args.browser:
        launch_browser_mode()
    else:
        launch_desktop_mode(debug=args.debug)
