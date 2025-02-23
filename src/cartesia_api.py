import requests

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

def generate_audio():
    ...

if __name__ == "__main__":
    key = open("cartesia_api_key.txt", "r").read().strip()
    file1 = "Recording.mp3"

    voice_clone = clone_voice(key, file1)
    print("[DEBUG] voice clone: ", voice_clone)
