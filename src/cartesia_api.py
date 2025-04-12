import requests

VOICE_IDS = {
    "aaron_judge": "7feb8f27-828b-4fb2-b659-6b31284bb8f8",
    "mbappe": "96e2ffc0-bbb3-4f90-b5af-a1fa4f8ce13b",
    "gal_gadot": "6bec89b7-f64e-4ba4-9d56-9f17400ff814",
    "robert_pattinson": "7d751ed8-8f13-4223-ab2f-a428298194eb",
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

def generate_audio(api_key, voice_id, text):
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
        with open("test.mp3", "wb") as f:
            f.write(response.content)

def old_main():
    key = open("cartesia_api_key.txt", "r").read().strip()
    file1 = "Recording.mp3"

    voice_clone = clone_voice(key, file1)
    print("[DEBUG] voice clone: ", voice_clone)

if __name__  == "__main__":
    key = open("cartesia_api_key.txt", "r").read().strip()
    string = "So Mickey’s an “Expendable”—he does the deadly jobs no one else wants, dies, and they just regen him. But now there are two of him at once, which isn’t supposed to happen. Meanwhile, there’s tension between the colony’s leaders and these alien natives. It’s a mix of sci-fi, satire, and some dark comedy."
    generate_audio(key, VOICE_IDS["GENERIC_MALE"], string)

