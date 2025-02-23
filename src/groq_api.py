from groq import Groq
import base64


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

if __name__ == "__main__":
    get_text()