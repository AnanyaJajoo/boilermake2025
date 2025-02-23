from flask import Flask, send_file
import os

app = Flask(__name__)

@app.route('/video')
def serve_video():
    # Make sure to use absolute path or correct relative path
    video_path = os.path.abspath("input.mp4")
    return send_file(video_path, mimetype='video/mp4')

if __name__ == "__main__":
    app.run(port=80)