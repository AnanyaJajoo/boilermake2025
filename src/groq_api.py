from groq import Groq
import base64
import glob
from pathlib import Path


# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

def get_text(path):
    # Path to your image
    image_path = path

    # Getting the base64 string
    base64_image = encode_image(image_path)

    client = Groq()

    text = "Create a 5-second, 25-word audio script for an in-person mall billboard ad based on this picture. Say it in first-person from the perspective of the person on the ad. It should not include instructions or directives, as it will be directly spoken. Do not include 'Scene', 'Narrator', 'Sound Effects', 'Note', or anything similar. Begin directly with the script, do not say anything similar to 'Here is a script for ___'. Begin directly with what is spoken. Focus on the product placement and the celebrity's identity. If you can't identify the product, guess. ONLY include words that are to be spoken in your response"


    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": text},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        model="llama-3.2-90b-vision-preview",
    )

    print(x:=chat_completion.choices[0].message.content)
    return x

def get_text2(path):
    # Path to your image
    image_path = path

    # Getting the base64 string
    base64_image = encode_image(image_path)

    client = Groq()
    completion = client.chat.completions.create(
    model="meta-llama/llama-4-maverick-17b-128e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "You are a user who is scanning this picture to learn more about the product, service, or thing it is about. What are 10 questions that the user might verbally ask someone who is an attendant at a location where this image might be found? Do not add extraneous words, ONLY give me the 10 verbal questions separated by line breaks, without spaces."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ],
    temperature=1,
    max_completion_tokens=1024,
    top_p=1,
    stream=False,
    stop=None,
    )

    return completion.choices[0].message.content
    
def main1():
    get_text() # idk

if __name__ == "__main__":
    # check if metadata path exists, if not create i
    DB_PATH = Path("db/metadata/metadata.csv")
    if not DB_PATH.parent.exists():
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        DB_PATH.touch()

    queries = dict()
    for img_path in glob.glob("db/images/*"):
        # resolve, conver back to string
        img_path = Path(img_path).as_posix()
        print("img_path: ", img_path)
        print("get_text2: ")
        message = get_text2(img_path)
        print(message)
        queries[img_path] = message

    # write to csv (./metadata/metadata.csv)
    # headers:
    # img_path, query

    # rows:
    # img_path, query

    with open("db/metadata/metadata.csv", "w") as f:
        f.write("img_path,query\n")
        for img_path, query in queries.items():
            f.write(f"{img_path},{query}\n")
