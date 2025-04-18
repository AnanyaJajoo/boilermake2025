import json
import requests
import time, math, shutil
from moviepy.video.VideoClip import ImageClip
from mutagen.mp3 import MP3
from filestack import Client
import os
from pathlib import Path
import cv2
from dotenv import load_dotenv

load_dotenv()
SYNC_API_KEY = os.getenv("SYNC_API_KEY")


from groq_api import get_text

def gen_video_from_img(img_path, time=5.0, fps=25, output_path="output.mp4", client=None):
    """
    Generates a silent video from an image.

    Args:
        img_path (str): Path to the input image.
        time (float): Duration of the video in seconds.
        fps (int): Frames per second.
        output_path (str): Path to the output video file.
    """
    # Create an ImageClip from the given image
    clip = ImageClip(img_path, duration=time)
    
    # Set the frames per second (fps) and write the video to the specified output path
    clip.write_videofile(output_path, fps=fps, codec="libx264", audio=False)

    # Upload the video file
    # new_filelink = client.upload(filepath=output_path)
    # return new_filelink.url

def gen_video_from_img_2(img_path, time=5.0, fps=25, output_path="output.mp4", client=None):
    # dont use moviepy but do the exact same thign

    # Create video using CV2
    img = cv2.imread(img_path)
    height, width, _ = img.shape

    output_path_temp = output_path.split(".")[0] + "_temp.mp4"

    # if output_path exists, delete it
    if os.path.exists(output_path):
        os.remove(output_path)

    if os.path.exists(output_path_temp):
        os.remove(output_path_temp)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path_temp, fourcc, fps, (width, height))

    for i in range(int(fps * time)):
        out.write(img)

    out.release()
    res = os.system(f"ffmpeg -y -i {output_path_temp} -vcodec libx264 {output_path}")
    if res != 0:
        raise Exception(f"Error: {res}")
    return output_path


def start_gen_video(text: str, out_url: str):
    url = "https://api.sync.so/v2/generate"

    payload = {
        "model": "lipsync-1.9.0-beta",
        "input": [
            {
                "type": "video",
                "url": out_url,
            },
            # {
            # "type": "audio",
            # "url": "https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortaud-27623a4f-edab-4c6a-8383-871b18961a4a.wav"
            # }
            {
                "type": "text",
                "provider": {
                    "name": "elevenlabs",
                    "voiceId":  "2EiwWnXFnvU5JabPnv8n",# "21m00Tcm4TlvDq8ikWAM", "2EiwWnXFnvU5JabPnv8n", # 
                    # "script": "\"Hey, I'm LeBron James, and I'm here to tell you about Sprite. It's the perfect drink to quench your thirst on a hot day like today.\""
                    "script": text
                }
            }
        ]
    }

    print("SYNC_API_KEY: ", SYNC_API_KEY)

    headers = {
        "x-api-key": SYNC_API_KEY, 
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    
    try:
        response.raise_for_status()
    except Exception as e:
        print("Error: ", response.text)
        raise e

    data = response.json()

    return data

def start_gen_video_2(audio_url: Path, video_url: str, fps=25, dims=(1280, 720)):
    payload = {
        "model": "lipsync-1.9.0-beta",
        "input": [
            {
                "type": "video",
                "url": video_url,
            },
            {
                "type": "audio",
                "url": audio_url,
            }
        ]
    }
    headers = {
        "x-api-key": SYNC_API_KEY,
        "Content-Type": "application/json"
    }
    
    url = "https://api.sync.so/v2/generate"
    response = requests.post(url, json=payload, headers=headers)
    try:
        response.raise_for_status()
    except Exception as e:
        print("Error: ", response.text)
        raise e
    
    return response.json()

def get_video(id):
    url = f"https://api.sync.so/v2/generate/{id}"

    headers = {"x-api-key": SYNC_API_KEY}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()

def new_main():
    # for each audio file in ./db/audio, generate a video
    # file name videos/x_y.mp4 (x is name, y is number)
    # for each file in ./db/audio, get audio (audio/x_y.mp3)
    # get corresponding image (images/x.jpg)

    FPS = 25

    # serve images
    image_paths_header = Path("db/images")
    audio_stubs = [
        "aaron_judge",
        "mickey_17",
        "minecraft_movie",
        "snow_white",
    ]

    server_url = "https://b1b4-2607-ac80-404-2-5a8-38b5-852-902c.ngrok-free.app"
    audio_url = server_url + "/audio"
    video_url = server_url + "/video"

    # for each image, find image file
    db = dict()
    for audio_stub in audio_stubs:
        # get image
        image_path = image_paths_header / f"{audio_stub}"
        # get actual image
        image_path = Path(f"db/images/{audio_stub}.jpg")
        print("[DEBUG] image_path: ", image_path)
        # check if file exists
        if not image_path.exists():
            print("[DEBUG] file does not exist: ", image_path)
            continue
        db[audio_stub] = {"image_path": image_path}
        # get audio files
        audio_files = list(Path("db/audio").glob(f"{audio_stub}_*.mp3"))
        # check if audio files exist
        if not audio_files:
            print("[DEBUG] no audio files found for: ", audio_stub)
            continue
        print("[DEBUG] audio_files: ", audio_files)
        db[audio_stub]["audio_files"] = audio_files

        # serve video
        # find length of each audio file
        video_lengths = []
        vid_paths = []
        for iter, audio_file in enumerate(audio_files):
            audio = MP3(audio_file)
            length = float(audio.info.length)
            length = math.ceil(length * FPS) // FPS + 1
            video_lengths.append(length)
            print("[DEBUG] length: ", length)

            # serve video and audio
            gen_video_from_img_2(image_path, time=length, fps=FPS, output_path=f"input.mp4")
            # copy audio_file to .input_audio.mp3
            shutil.copy(audio_file, "input_audio.mp3")
            
            time.sleep(0.5) # wait for changes to propagate. doesn't actually matter...

            # gen video
            img_dims = cv2.imread(image_path).shape[:2]
            print("[DEBUG] img_dims: ", img_dims)
            video_gen = start_gen_video_2(
                audio_url=audio_url,
                video_url=video_url,
                fps=FPS,
                dims=img_dims,
            )

            video_gen_id = video_gen["id"]

            print()
            i = 0

            while video_gen["status"] in ["PENDING", "PROCESSING"]:
                i+=(dt:=0.25)
                time.sleep(dt)
                video_gen = get_video(video_gen_id)
                print("             ", end="\r")
                print(f"{i}", end="\r")

            output_url = (video_out:=video_gen)["outputUrl"]
            response = requests.get(output_url)
            # touch the file first
            vid_path = f"db/videos/{audio_stub}_{iter}.mp4"
            Path(vid_path).touch()  # Ensure the file exists (empty) before writing
            if not os.path.exists(vid_path):
                print("hell nah")

            with open(vid_path, "wb") as f:
                f.write(response.content)

            vid_paths.append(vid_path)

        db[audio_stub]["clip_lengths"] = video_lengths
        db[audio_stub]["video_paths"] = vid_paths

    
    # ----- end of db creation -----
    # recursively traverse db, if not string/int/float, convert to str
    def traverse_dict(d):
        for k, v in d.items():
            if isinstance(v, dict):
                traverse_dict(v)
            elif not isinstance(v, (str, int, float)):
                d[k] = str(v)
            elif isinstance(v, list):
                for i in range(len(v)):
                    if isinstance(v[i], dict):
                        traverse_dict(v[i])
                    elif not isinstance(v[i], (str, int, float)):
                        v[i] = str(v[i])

    traverse_dict(db)

    # outta the SLOOP!!!!
    # save db as json in db/db.json
    try:
        with open("db/db.json", "w") as f:
            json.dump(db, f, indent=4)
    except Exception as e:
        print("Error: ", e)
        # pickle it instead
        import pickle
        with open("db/db.pickle", "wb") as f:
            pickle.dump(db, f)
        print("Pickled db instead of json")

    # done!


def main():
    # Step 1: Generate video from still image
    client = Client(apikey=open("filestack_api_key.txt", "r").read().strip())

    cap = cv2.VideoCapture(0)
    input("Press Enter to take a picture...")
    ret, frame = cap.read()
    cv2.imwrite("camera_input.jpg", frame)

    out_url = gen_video_from_img_2(input_img:="camera_input.jpg",
                             time=5.0, 
                             fps=25, 
                             output_path="input_old.mp4",
                             client=client)
    print("out_url: ", out_url)

    # run server for ngrok
    # app.run(port=80)

    print("HELLO")
    
    # Step 2: Generate text to say
    text = get_text(input_img) # from groq_api.py
    text = text[:150] # limit to 250 characters
    # text = "You can buy the Chanel perfume at Target, located on the second floor of this mall!"
    print("Text: ", text)
    input("[DEBUG] Press Enter to continue...")

    out_url = "https://20b1-128-210-106-81.ngrok-free.app/video"
    # out_url = "https://604e-128-210-107-130.ngrok-free.app/video"
    # out_url = "https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortvid-03a10044-7741-4cfc-816a-5bccd392d1ee.mp4"

    # step 3: video gen
    with open("sync_api_key.txt", "r") as f:
        key = f.read().strip()

    video_gen = start_gen_video(text, out_url)
    print("[DEBUG] original video gen: ", video_gen)
    video_gen_id = video_gen["id"]
    i = 0
    # while video_gen["status"] != "COMPLETED":
    while video_gen["status"] in ["PENDING", "PROCESSING"]:
        i+=1
        time.sleep(0.5)
        video_gen = get_video(key, video_gen_id)
        print(f"{i%1000}", end="\r")
        # print("[DEBUG] video gen: ", video_gen)
        # input("[DEBUG] Press Enter to continue...")
    output_url = (video_out:=video_gen)["outputUrl"]

    # Download the video
    print("Downloading the video at: ", output_url)
    print("Debug: Video out: ", video_out)
    response = requests.get(output_url)
    with open("sync_output.mp4", "wb") as f:
        f.write(response.content)

if __name__ == "__main__":
    # main()
    new_main()