from flask import Flask, send_file
import os

app = Flask(__name__)

@app.route('/video')
def serve_video():
    # Make sure to use absolute path or correct relative path
    video_path = os.path.abspath("input.mp4")
    return send_file(video_path, mimetype='video/mp4')

@app.route('/audio/')
def serve_audio():
    # Make sure to use absolute path or correct relative path
    audio_path = os.path.abspath(f"input_audio.mp3")
    return send_file(audio_path, mimetype='audio/mpeg')

if __name__ == "__main__":
    app.run(port=80)