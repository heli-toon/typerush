import os
import json
import webbrowser
import threading
import socket
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Get the directory where the script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/typing-texts')
def get_typing_texts():
    try:
        with open(os.path.join(BASE_DIR, 'static', 'data', 'typing-texts.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({"texts": ["The quick brown fox jumps over the lazy dog."]})

@app.route('/api/html-snippets')
def get_html_snippets():
    try:
        with open(os.path.join(BASE_DIR, 'static', 'data', 'html-snippets.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({"snippets": ["<div class=\"container\">Hello World</div>"]})

@app.route('/api/typing-texts', methods=['POST'])
def update_typing_texts():
    try:
        data = request.get_json()
        os.makedirs(os.path.join(BASE_DIR, 'static', 'data'), exist_ok=True)
        with open(os.path.join(BASE_DIR, 'static', 'data', 'typing-texts.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/html-snippets', methods=['POST'])
def update_html_snippets():
    try:
        data = request.get_json()
        os.makedirs(os.path.join(BASE_DIR, 'static', 'data'), exist_ok=True)
        with open(os.path.join(BASE_DIR, 'static', 'data', 'html-snippets.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

def find_available_port(host, start_port, max_attempts):
    """Find an available port starting from `start_port`."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue
    raise RuntimeError("No available port found")

def open_browser(port):
    webbrowser.open(f'http://127.0.0.1:{port}')

if __name__ == '__main__':
    # Find available port
    port = find_available_port('127.0.0.1', 5000, 100)
    
    # Open browser after a short delay
    threading.Timer(1.5, lambda: open_browser(port)).start()
    
    print(f"🚀 Starting Typing Test App on http://127.0.0.1:{port}")
    print("📝 The app will open in your default browser...")
    
    # Create data directory and files if they don't exist
    os.makedirs(os.path.join(BASE_DIR, 'static', 'data'), exist_ok=True)
    
    app.run(host='127.0.0.1', port=port, debug=False)