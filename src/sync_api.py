import requests
import time
from moviepy.video.VideoClip import ImageClip
from filestack import Client
import os
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

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    for i in range(int(fps * time)):
        out.write(img)

    out.release()
    os.system(f"ffmpeg -i {output_path} -vcodec libx264 input.mp4")
    return output_path


def start_gen_video(text: str, out_url: str):
    url = "https://api.sync.so/v2/generate"

    payload = {
        "model": "lipsync-2-preview",
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


def get_video(key, id):
    url = f"https://api.sync.so/v2/generate/{id}"

    headers = {"x-api-key": SYNC_API_KEY}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()

if __name__ == "__main__":
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

