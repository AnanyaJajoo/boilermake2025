import requests
import os
from dotenv import load_dotenv

load_dotenv()
CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY")

VOICE_IDS = {
    "aaron_judge": "7feb8f27-828b-4fb2-b659-6b31284bb8f8",
    "mbappe": "96e2ffc0-bbb3-4f90-b5af-a1fa4f8ce13b",
    "gal_gadot": "6bec89b7-f64e-4ba4-9d56-9f17400ff814",
    "robert_pattinson": "7d751ed8-8f13-4223-ab2f-a428298194eb",
    "jason_momoa": "91e0c8fc-26bd-4adb-9c9b-37afa6714b08",
    "GENERIC_FEMALE" :"6f84f4b8-58a2-430c-8c79-688dad597532",
    "GENERIC_MALE" : "8d110413-2f14-44a2-8203-2104db4340e9"
}

def clone_voice(api_key, file1):
    url = "https://api.cartesia.ai/voices/clone"

    files = { "clip": open(file1, 'rb') }
    payload = {
        "name": "\"A high-stability cloned voice\"",
        "description": "\"Copied from Cartesia docs\"",
        "language": "\"en\"",
        "mode": "\"similarity\"",
        "enhance": "true",
    }
    headers = {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": api_key
    }

    response = requests.post(url, data=payload, files=files, headers=headers)

    return response

def generate_audio(api_key, voice_id, text, out_path="test.mp3"):
    url = "https://api.cartesia.ai/tts/bytes"

    payload = {
        "model_id": "sonic-2",
        "transcript": text,
        "language": "en",
        "voice": {
            "id": voice_id
        },
        "output_format": {
            "container": "mp3",
            "bit_rate": 192000,
            "sample_rate": 44100
        }
    }
    headers = {
        "Cartesia-Version": "2024-11-13",
        "X-API-Key": api_key,
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    
    print(response)

    if response.ok:
        with open(out_path, "wb") as f:
            f.write(response.content)

def old_main():
    key = open("cartesia_api_key.txt", "r").read().strip()
    file1 = "Recording.mp3"

    voice_clone = clone_voice(key, file1)
    print("[DEBUG] voice clone: ", voice_clone)

def main():
    # create ./db/audio if not exists
    if not os.path.exists("./db/audio"):
        os.makedirs("./db/audio")

    # for each file in below list, get audio
    metadata_files = {
        './db/metadata/aaron_judge.txt' : VOICE_IDS["aaron_judge"],
        './db/metadata/mickey_17.txt' : VOICE_IDS["robert_pattinson"],
        './db/metadata/snow_white.txt' : VOICE_IDS["gal_gadot"],
        './db/metadata/minecraft_movie.txt' : VOICE_IDS["jason_momoa"],
    }

    for file, voice_id in metadata_files.items():
        print("[DEBUG] file: ", file)
        # check if file exists
        if not os.path.exists(file):
            print("[DEBUG] file does not exist: ", file)
            continue
        with open(file, 'r', errors="replace") as f:
            text = ""
            for char in f.read():
                if ord(char) > 127:
                    print("[DEBUG] non-ascii char: ", char)
                    continue
                else:
                    text += char

        # print("[DEBUG] text: ", text)

        # find each line break 
        answers = text.split("\n")
        # remove all ""
        answers = [answer for answer in answers if answer != ""]
        [print(i, answers[i]) for i in range(len(answers))]

        # save as db/audio/filestem_n.mp3, where n is answers[i]
        for i in range(len(answers)):
            out_path = f"./db/audio/{os.path.splitext(os.path.basename(file))[0]}_{i}.mp3"
            print("[DEBUG] out_path: ", out_path)
            generate_audio(CARTESIA_API_KEY, voice_id, answers[i], out_path=out_path)
            



if __name__  == "__main__":
    key = CARTESIA_API_KEY
    # string = "I might swerve, bend that corner, woah."
    # generate_audio(key, VOICE_IDS["robert_pattinson"], string)

    main()

