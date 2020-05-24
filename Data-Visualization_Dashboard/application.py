from flask import Flask, render_template, request, jsonify, send_file, current_app
import os

app = Flask(__name__, static_url_path='/static')
APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')
FILES_STATIC = os.path.join(APP_STATIC, 'files')
print(APP_ROOT, APP_STATIC, FILES_STATIC)

# Pages Assignment 1
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/<filename>', methods=['GET'])
def download(filename):
    uploads = os.path.join(APP_STATIC, 'data', filename)
    return send_file(uploads)
