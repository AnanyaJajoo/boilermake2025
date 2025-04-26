Simli Auto
Create interactive AI avatars with just a few API calls

​
Overview
Simli Auto is a powerful API that enables you to create and manage interactive AI avatars with real-time text-to-speech and facial animation capabilities. It provides a streamlined way to integrate conversational AI agents into your applications with minimal setup.

​
Key Features
End-to-End Sessions: Create interactive sessions with AI avatars that can engage in real-time conversations
Custom LLM Support: Bring your own Language Model by providing an OpenAI-compatible API endpoint
Multiple TTS Providers: Choose from various text-to-speech providers including ElevenLabs, PlayHT, and Cartesia
Multi-Language Support: Support for multiple languages through Deepgram’s language models
Session Management: Built-in session handling with configurable idle times and session lengths
Transcript Generation: Optional conversation transcript generation for record-keeping
​
Available APIs
​
Session Management
POST /createE2ESessionToken: Creates a new session token for authentication. Requires your Simli API key and optionally a TTS API key.
POST /startE2ESession: Initializes a new end-to-end interactive session with an AI avatar. Configure TTS provider, language, and other session parameters.
GET /session/{agent_id}: Retrieves session information for a specific agent using header-based authentication.
GET /session/{agent_id}/{session_token}: Retrieves session information for a specific agent using URL-based token authentication.
​
Conversation Management
GET /getE2ETranscript/{sessionId}: Retrieves the conversation transcript for a specific session if transcript generation was enabled.
​
Custom Integration
POST /textToVideoStream: Converts text to video stream with facial animations and speech.
POST /audioToVideoStream: Converts audio input to video stream with facial animations.
POST /getIceServers: Retrieves ICE (Interactive Connectivity Establishment) servers for WebRTC connections.
​
Getting Started
To start using the Simli Auto API, you’ll need:

A Simli API key
(Optional) API keys for your preferred TTS provider
(Optional) Custom LLM configuration if not using the default model
​
Quick Start
Here’s a basic flow to get started:

Create a session token:

Copy
POST /createE2ESessionToken
{
  "simliAPIKey": "your-api-key",
  "ttsAPIKey": "your-tts-api-key"  // Optional
}
Start an end-to-end session:

Copy
POST /startE2ESession
{
  "apiKey": "your-api-key",
  "faceId": "your-face-id",
  "ttsProvider": "Cartesia",  // Or "ElevenLabs"
  "language": "en",
  "createTranscript": false
}
​
Using Custom LLMs
Simli Auto supports integration with any OpenAI-compatible LLM API. To use your own LLM:


Copy
{
  "customLLMConfig": {
    "model": "your-model-name",
    "baseURL": "https://your-llm-api-endpoint.com",
    "llmAPIKey": "your-llm-api-key"
  }
}
​
Session Configuration
You can customize various session parameters:

maxSessionLength: Maximum duration of the session in seconds (default: 3600)
maxIdleTime: Maximum idle time before session timeout in seconds (default: 300)
systemPrompt: Custom prompt to define the AI’s behavior
firstMessage: Initial message from the AI when session starts
​
Best Practices
Session Management

Keep track of session tokens and handle expiration appropriately
Configure idle times based on your use case
Resource Optimization

Use appropriate batch sizes for audio processing
Handle session cleanup when no longer needed
Error Handling

Implement proper error handling for API responses
Monitor session status and handle timeouts gracefully
​
Rate Limits and Quotas
Please refer to your API plan for specific rate limits and quotas. Ensure your application handles rate limiting appropriately to maintain optimal performance.

​
Next Steps
Explore the detailed API reference for each endpoint
Check out our example implementations
Join our community for support and updates
For more detailed information about specific endpoints and features, navigate through the API reference sections.


JavaScript
SimliClient is a powerful tool for integrating real-time audio and video streaming capabilities into your web applications using WebRTC. This guide will walk you through the process of setting up and using SimliClient in your project.

​
Getting Started
​
Prerequisites
Before you begin, make sure you have:

A Simli account with an API key
Node.js and npm installed in your development environment
​
Installation
Install the simli-client package in your project:


Copy
npm install simli-client
​
Usage
​
Step 1: Import SimliClient
First, import the SimliClient class into your project:


Copy
import { SimliClient } from "simli-client";
​
Step 2: Create HTML Elements
In your React component, create video and audio elements with refs:


Copy
import React, { useRef } from "react";

function YourComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
      <audio ref={audioRef} autoPlay></audio>
    </div>
  );
}
​
Step 3: Initialize SimliClient
Create an instance of SimliClient and initialize it with your configuration:


Copy
const simliClient = new SimliClient();

const simliConfig = {
  apiKey: "YOUR_SIMLI_API_KEY",
  faceID: "YOUR_FACE_ID",
  handleSilence: true, // keep the face moving while in idle
  maxSessionLength: 3600, // in seconds
  maxIdleTime: 600, // in seconds
  videoRef: videoRef.current,
  audioRef: audioRef.current,
  enableConsoleLogs: true, // enables Simli console logs
};

simliClient.Initialize(simliConfig);
Make sure to replace 'YOUR_SIMLI_API_KEY' with your actual Simli API key, and 'YOUR_FACE_ID' with the desired face ID for your application.

If you’re using listenToMediastreamTrack() set handleSilence: false to avoid audio artifacts

​
Step 4: Start the WebRTC Connection
Call the start method to set up the WebRTC connection:


Copy
simliClient.start();
​
Step 5: Send Audio Data
Once the connection is established, you can start sending audio data:


Copy
// Example: sending audio data (should be PCM16 format, 16KHz sample rate)
const audioData = new Uint8Array(6000).fill(0); // Replace with your actual audio data
simliClient.sendAudioData(audioData);
Ensure that your audio data is in PCM16 format with a 16KHz sample rate.

​
simli-client API reference
​
Methods
Initialize(config: SimliClientConfig): Initializes the SimliClient with the provided configuration.
start(): Sets up the WebRTC connection and prepares for streaming.
close(): Closes the WebRTC connection and cleans up resources.
sendAudioData(audioData: Uint8Array): Sends audio data to the server.
listenToMediastreamTrack(stream: MediaStreamTrack): Listens to a MediaStreamTrack and sends audio data to the server. Can be used as an alternative to sendAudioData.
ClearBuffer(): Clears the audio buffer, best used when you want the avatar to stop talking.
​
Advanced Usage
​
Events
connected when the data channel is open and ready to use
disconnected when the data channel is closed
failed when the webRTC connection fails to connect
speaking when the avatar starts speaking
silent when the avatar stops speaking

Copy
simliClient.on("connected", () => {
  console.log("SimliClient is now connected!");
});

simliClient.on("disconnected", () => {
  console.log("SimliClient has disconnected!");
});

simliClient.on("failed", () => {
  console.log("SimliClient has failed to connect!");
});

simliClient.on("speaking", () => {
  console.log("Agent is now speaking!");
});

simliClient.on("silent", () => {
  console.log("Agent is now silent!");
});
​
Error Handling
SimliClient provides console logging for various events and errors. It’s recommended to implement proper error handling in your application to manage potential issues, such as network disconnections or initialization failures.

​
Customizing WebRTC Configuration
The SimliClient uses a default STUN server for ICE candidate gathering. If you need to use custom ICE servers or other WebRTC configurations, you may need to modify the createPeerConnection method in the SimliClient class.

​
Fork and Contribute to simli-client
simli-client
Fork and contribute to the simli-client repository on GitHub or clone for your own usecase.

​
Troubleshooting
If you encounter issues:

Ensure your API key is correct and active.
Verify that your face ID is valid and associated with your account.
Check that your audio data is in the correct format (PCM16, 16KHz).
Verify that you have the necessary permissions for accessing the user’s media devices.
Review the console logs for any error messages or warnings.
Reach out to our support team for further assistance on Discord.


Simli Auto API Reference

/createE2ESessionToken
POST
/
createE2ESessionToken
const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"expiryStamp":123,"simliAPIKey":"<string>","llmAPIKey":"<string>","ttsAPIKey":"<string>","originAllowList":["<string>"]}'
};

fetch('https://api.simli.ai/createE2ESessionToken', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Body
application/json
​
simliAPIKey
stringrequired
​
expiryStamp
integer | nulldefault:-1
​
llmAPIKey
string | nulldefault:
​
ttsAPIKey
string | nulldefault:
​
originAllowList
string[] | null
Response
200

200
application/json
Successful Response
The response is of type any.

/startE2ESession
POST
/
startE2ESession

const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"apiKey":"<string>","faceId":"tmp9i8bbq7c","ttsProvider":"Cartesia","ttsAPIKey":"<string>","ttsModel":"sonic-turbo-2025-03-07","voiceId":"a167e0f3-df7e-4d52-a9c3-f949145efdab","systemPrompt":"<string>","firstMessage":"<string>","maxSessionLength":3600,"maxIdleTime":300,"language":"en","customLLMConfig":{"model":"gpt-4o-mini","baseURL":"<string>","llmAPIKey":"<string>"},"createTranscript":false}'
};

fetch('https://api.simli.ai/startE2ESession', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
The Simli Auto API offers a quick and easy way to make an end-to-end real-time interaction. Simli Auto now supports custom LLMs, but if you need even more composability, check out the Simli Compose API Reference instead.

This endpoint allows you to start a new end-to-end session.

for changing the interaction languages, you can look at the support list on Deepgram’s website

Body
application/json
​
apiKey
stringrequired
​
faceId
stringdefault:tmp9i8bbq7c
​
ttsProvider
enum<string>
Available options: ElevenLabs, PlayHT, Cartesia, User 
​
ttsAPIKey
string | null
​
ttsModel
stringdefault:sonic-turbo-2025-03-07
​
voiceId
stringdefault:a167e0f3-df7e-4d52-a9c3-f949145efdab
​
systemPrompt
string | nulldefault:You are Chatbot, a friendly, helpful robot. Your goal is to demonstrate your capabilities in a succinct way. Your output will be converted to audio so don't include special characters in your answers. Respond to what the user said in a creative and helpful way, but keep your responses brief.
​
firstMessage
string | null
​
maxSessionLength
integerdefault:3600
​
maxIdleTime
integerdefault:300
​
language
stringdefault:en
​
customLLMConfig
object | null

Show child attributes

​
createTranscript
booleandefault:false
Response
200

200
application/json
Successful Response
The response is of type any.


Bring your own LLM
TL;DR, If you have an OpenAI compatible API (test it out with the python or JS SDKs), pass Simli the base url, an API key, and the model name and you’re golden!

​
Background
Using Simli Auto (our end-to-end API) is awesome! But it can be a bit difficult to tailor it out for your needs. You may have a custom knowledge base, a RAG powered system, using your fine-tuned LLM that’s the best doctor or tutor ever known to mankind that you self-host, or just want to use a model that we don’t readily support. If that’s you, you’re in the right place.

There’s a fun trick that you may already know about if you’re this deep into the weeds, if you look at the Deepseek api docs, you can see that they’re using the OpenAI SDK as if it was their own! They just put in the base_url for their API and the API key and then it works as if nothing weird is going on.

Well, this is a result of Deepseek, and a lot of LLM API providers copying most of OpenAI’s homework in terms of API design, having the same endpoint naming scheme and Response body structure. OpenAI API has a lot going on; however, there are 3 essential parts that everyone copied: Request path, Request Structure, Response Structure.

​
The basic OpenAI request
To make an OpenAI-compatible LLM API, you need to have something resembling the following

POST http(s)://my-awesome-llm-hosted-here/some/random/path */chat/completions*

With the header Authorization and value Bearer INSERT_SECRET_API_KEY

and Body


Copy
"model":"my-AGI",
"messages": [
    {"role":"system", "content":"This is a sample system message (AKA base prompt)"}
    {"role":"asssistant", "content":"This is a sample AI generated message"}
    {"role":"user","content":"This is a sample user Input"}
]
and the response(s)


Copy
{
    "id":0,
    "choices" :[ {
        "delta": {"content":"Chunk Completion Text Example"}
    }],
    "created": "Unix Time Stamp",
    "model":"the model name you had in request",
    "object": "chat.completion.chunk" // Just a literal
}
Response has the mimetype text/eventstream and the structure above is used for all chunks. You must ensure that the text body is correctly formatted. Additionally, you must indicate that your response is done by sending a DONE frame. All responses are followed by 2 newline delimiters. Using FastAPI for example, you would have an async generator looking like this:


Copy
import json
async def outputStream():
    ResultDict = [{
        "id":0,
        "choices" :[ {
            "delta": {"content":"Chunk Completion Text Example"}
        }],
        "created": "Unix Time Stamp",
        "model":"the model name you had in request",
        "object": "chat.completion.chunk" # Just a literal
    }]
    async for chunk in ResultDict:
        yield f"data: {json.dumps(chunk)}\n\n"
    yield "data: [DONE]\n\n"

Here’s an example server sending out a mock response with FastAPI, which can be simply run using python app.py and passing the hosting URL to Simli. (more examples in other languages coming soon)


Copy
import time
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json

app = FastAPI()


async def streamOutput():
    data = {
        "id": "",
        "choices": [
            {
                "delta": {"content": "This is a test. "},
                "index": 0,
            }
        ],
        "model": "gpt-4o-mini-2024-07-18",
        "created": 0,
        "object": "chat.completion.chunk",
    }
    for i in range(5):
        data["id"] = f"id-{i}"
        data["choices"][0]["index"] = i
        data["created"] = int(time.time())
        out = f"data: {json.dumps(data)}\n\n"
        yield out
    yield "data: [DONE]\n\n"


@app.post("/chat/completions")
async def chat_completions(_: Request):
    return StreamingResponse(streamOutput(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=11000)
and another exxample just wrapping OpenAI SDK on the server


Copy
import os
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionChunk
from typing import AsyncGenerator
from dotenv import load_dotenv

app = FastAPI()

load_dotenv(override=True)
OPEN_AI_API_KEY = os.getenv("OPENAI_API_KEY")
async_client = AsyncOpenAI(api_key=OPEN_AI_API_KEY)


async def streamOutput(request: Request):
    output: AsyncGenerator[
        ChatCompletionChunk
    ] = await async_client.chat.completions.create(**(await request.json()))

    async for item in output:
        out = f"data: {item.model_dump_json(exclude_unset=True)}\n\n"
        yield out
    yield "data: [DONE]\n\n"


@app.post("/chat/completions")
async def chat_completions(request: Request):
    return StreamingResponse(
        streamOutput(request),
        media_type="text/event-stream",
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=11000)


/session/{agent_id}/{session_token}
GET
/
session
/
{agent_id}
/
{session_token}
const options = {method: 'GET'};

fetch('https://api.simli.ai/session/{agent_id}/{session_token}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Path Parameters
​
agent_id
stringrequired
​
session_token
stringrequired
Query Parameters
​
redirect
booleandefault:false
Response
200

200
application/json
Successful Response
The response is of type any.


session/{agent_id}
GET
/
session
/
{agent_id}

const options = {method: 'GET', headers: {'session-token': '<session-token>'}};

fetch('https://api.simli.ai/session/{agent_id}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Headers
​
session-token
stringrequired
Path Parameters
​
agent_id
stringrequired
Query Parameters
​
redirect
booleandefault:false
Response
200

200
application/json
Successful Response
The response is of type any.


/getE2ETranscript/{sessionId}
GET
/
getE2ETranscript
/
{sessionId}

const options = {method: 'GET', headers: {'api-key': '<api-key>'}};

fetch('https://api.simli.ai/getE2ETranscript/{sessionId}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Headers
​
api-key
stringrequired
Path Parameters
​
sessionId
stringrequired
Response
200

200
application/json
Successful Response
The response is of type any.


FaceID API Reference

/generateFaceID
POST
/
generateFaceID

const form = new FormData();

const options = {
  method: 'POST',
  headers: {'api-key': '<api-key>', 'Content-Type': 'multipart/form-data'}
};

options.body = form;

fetch('https://api.simli.ai/generateFaceID', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Headers
​
api-key
stringrequired
Query Parameters
​
face_name
stringdefault:untitled_avatar
Body
multipart/form-data
​
image
filerequired
Response
200

200
application/json
Successful Response
The response is of type any


/getRequestStatus
POST
/
getRequestStatus

const options = {method: 'POST', headers: {'api-key': '<api-key>'}};

fetch('https://api.simli.ai/getRequestStatus', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Headers
​
api-key
stringrequired
Query Parameters
​
face_id
string
Response
200

200
application/json
Successful Response
The response is of type any.


Agents API Reference
Create Agent
Create a new agent

POST
/
agent

const options = {
  method: 'POST',
  headers: {'x-simli-api-key': '<api-key>', 'Content-Type': 'application/json'},
  body: '{"face_id":"3c90c3cc-0d44-4b50-8888-8dd25736052a","name":"Untitled Agent","first_message":"<string>","prompt":"<string>","voice_provider":"elevenlabs","voice_id":"3c90c3cc-0d44-4b50-8888-8dd25736052a","voice_model":"sonic-english","owner_id":"<string>","language":"<string>","llm_model":"gpt-4o-mini","llm_endpoint":"https://api.example.com/v1/chat/completions","max_idle_time":300,"max_session_length":3600,"created_at":"2023-11-07T05:31:56Z","updated_at":"2023-11-07T05:31:56Z"}'
};

fetch('https://api.simli.ai/agent', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Authorizations
​
x-simli-api-key
stringheaderrequired
API key for authentication

Body
application/json
​
face_id
stringrequired
​
name
stringdefault:Untitled Agentrequired
​
first_message
string
​
prompt
string
​
voice_provider
enum<string>
Available options: elevenlabs, cartesia 
​
voice_id
string
​
voice_model
string
Example:
"sonic-english"

​
owner_id
string
Unique identifier for the owner of the agent

​
language
string
​
llm_model
string
Example:
"gpt-4o-mini"

​
llm_endpoint
string
The URL of the custom LLM to use

Example:
"https://api.example.com/v1/chat/completions"

​
max_idle_time
integerdefault:300
​
max_session_length
integerdefault:3600
​
created_at
string
Timestamp when the agent was created

​
updated_at
string
Timestamp when the agent was updated

Response
201

201
application/json
Agent created successfully
​
id
stringrequired
Unique identifier for the agent, generated by the MySQL service

​
face_id
stringrequired
​
name
stringdefault:Untitled Agentrequired
​
first_message
stringrequired
​
prompt
stringrequired
​
voice_provider
enum<string>required
Available options: elevenlabs, cartesia 
​
voice_id
stringrequired
​
voice_model
stringrequired
Example:
"sonic-english"

​
language
stringrequired
​
llm_model
stringrequired
Example:
"gpt-4o-mini"

​
llm_endpoint
stringrequired
The URL of the custom LLM to use

Example:
"https://api.example.com/v1/chat/completions"

​
max_idle_time
integerdefault:300required
​
max_session_length
integerdefault:3600required
​
owner_id
stringrequired
Unique identifier for the owner of the agent

​
created_at
stringrequired
Timestamp when the agent was created

​
updated_at
stringrequired
Timestamp when the agent was last updated

{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "face_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "name": "Untitled Agent",
  "first_message": "<string>",
  "prompt": "<string>",
  "voice_provider": "elevenlabs",
  "voice_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "voice_model": "sonic-english",
  "language": "<string>",
  "llm_model": "gpt-4o-mini",
  "llm_endpoint": "https://api.example.com/v1/chat/completions",
  "max_idle_time": 300,
  "max_session_length": 3600,
  "owner_id": "<string>",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z"
}


Update Agent
Update an existing agent

PUT
/
agent
/
{id}

const options = {
  method: 'PUT',
  headers: {'x-simli-api-key': '<api-key>', 'Content-Type': 'application/json'},
  body: '{"face_id":"3c90c3cc-0d44-4b50-8888-8dd25736052a","name":"<string>","first_message":"<string>","prompt":"<string>","voice_provider":"elevenlabs","voice_id":"3c90c3cc-0d44-4b50-8888-8dd25736052a","voice_model":"sonic-english","llm_model":"gpt-4o-mini","llm_endpoint":"https://api.example.com/v1/chat/completions","language":"<string>","max_idle_time":123,"max_session_length":123,"created_at":"2023-11-07T05:31:56Z","updated_at":"2023-11-07T05:31:56Z"}'
};

fetch('https://api.simli.ai/agent/{id}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Authorizations
​
x-simli-api-key
stringheaderrequired
API key for authentication

Path Parameters
​
id
stringrequired
Body
application/json
​
face_id
string
​
name
string
​
first_message
string
​
prompt
string
​
voice_provider
enum<string>
Available options: elevenlabs, cartesia 
​
voice_id
string
​
voice_model
string
Example:
"sonic-english"

​
llm_model
string
Example:
"gpt-4o-mini"

​
llm_endpoint
string
The URL of the custom LLM to use

Example:
"https://api.example.com/v1/chat/completions"

​
language
string
​
max_idle_time
integer
​
max_session_length
integer
​
created_at
string
Timestamp when the agent was created

​
updated_at
string
Timestamp when the agent was updated

Response
200

200
Agent updated successfully


Delete Agent
Delete an existing agent

DELETE
/
agent
/
{id}

const options = {method: 'DELETE', headers: {'x-simli-api-key': '<api-key>'}};

fetch('https://api.simli.ai/agent/{id}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Authorizations
​
x-simli-api-key
stringheaderrequired
API key for authentication

Path Parameters
​
id
stringrequired
Response
204

204
Agent deleted successfully


Get Agent
Get details of a specific agent

GET
/
agent
/
{id}

const options = {method: 'GET', headers: {'x-simli-api-key': '<api-key>'}};

fetch('https://api.simli.ai/agent/{id}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Authorizations
​
x-simli-api-key
stringheaderrequired
API key for authentication

Path Parameters
​
id
stringrequired
Response
200 - application/json
A single agent
​
id
stringrequired
Unique identifier for the agent, generated by the MySQL service

​
face_id
stringrequired
​
name
stringdefault:Untitled Agentrequired
​
first_message
stringrequired
​
prompt
stringrequired
​
voice_provider
enum<string>required
Available options: elevenlabs, cartesia 
​
voice_id
stringrequired
​
voice_model
stringrequired
Example:
"sonic-english"

​
language
stringrequired
​
llm_model
stringrequired
Example:
"gpt-4o-mini"

​
llm_endpoint
stringrequired
The URL of the custom LLM to use

Example:
"https://api.example.com/v1/chat/completions"

​
max_idle_time
integerdefault:300required
​
max_session_length
integerdefault:3600required
​
owner_id
stringrequired
Unique identifier for the owner of the agent

​
created_at
stringrequired
Timestamp when the agent was created

​
updated_at
stringrequired
Timestamp when the agent was last updated

{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "face_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "name": "Untitled Agent",
  "first_message": "<string>",
  "prompt": "<string>",
  "voice_provider": "elevenlabs",
  "voice_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "voice_model": "sonic-english",
  "language": "<string>",
  "llm_model": "gpt-4o-mini",
  "llm_endpoint": "https://api.example.com/v1/chat/completions",
  "max_idle_time": 300,
  "max_session_length": 3600,
  "owner_id": "<string>",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z"
}


Get All Agents
Get a list of all agents

GET
/
agents

const options = {method: 'GET', headers: {'x-simli-api-key': '<api-key>'}};

fetch('https://api.simli.ai/agents', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Authorizations
​
x-simli-api-key
stringheaderrequired
API key for authentication

Response
200 - application/json
List of agents
​
id
stringrequired
Unique identifier for the agent, generated by the MySQL service

​
face_id
stringrequired
​
name
stringdefault:Untitled Agentrequired
​
first_message
stringrequired
​
prompt
stringrequired
​
voice_provider
enum<string>required
Available options: elevenlabs, cartesia 
​
voice_id
stringrequired
​
voice_model
stringrequired
Example:
"sonic-english"

​
language
stringrequired
​
llm_model
stringrequired
Example:
"gpt-4o-mini"

​
llm_endpoint
stringrequired
The URL of the custom LLM to use

Example:
"https://api.example.com/v1/chat/completions"

​
max_idle_time
integerdefault:300required
​
max_session_length
integerdefault:3600required
​
owner_id
stringrequired
Unique identifier for the owner of the agent

​
created_at
stringrequired
Timestamp when the agent was created

​
updated_at
stringrequired
Timestamp when the agent was last updated

[
  {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "face_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "name": "Untitled Agent",
    "first_message": "<string>",
    "prompt": "<string>",
    "voice_provider": "elevenlabs",
    "voice_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "voice_model": "sonic-english",
    "language": "<string>",
    "llm_model": "gpt-4o-mini",
    "llm_endpoint": "https://api.example.com/v1/chat/completions",
    "max_idle_time": 300,
    "max_session_length": 3600,
    "owner_id": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z"
  }
]

WebRTC API Reference

Simli WebRTC Guide
Get started using Simli WebRTC API

​
Simli WebRTC API basics
This is a quick and shallow guide on how to use the Simli WebRTC API. This won’t explain how WebRTC works or go into the details of the audio. You can check the following articles for that: WebRTC, Audio. In this article, we’re assuming you have a basic understanding of javascript, python, HTTP requests, and how to use APIs. Full codes will be posted at the end of this document.

​
What’s the Simli API?
The Simli API is a way to transform any audio, whatever the source, into a talking head video (Humanoid character that speaks the audio) with realistic motions and low latency. The api allows anyone to add more life into their chat bots, virtual assistants, or any formless characters. For example, this article will give a face to any radio station that provides an audio stream over HTTP. However, the exact same principles apply to any audio source.

The main input in the API is the audio stream. The audio must be in PCM Int16 format with a sampling rate of 16000 Hz and a single channel. The audio stream should be preferably sent in chunks of 6000 bytes; however, there’s no limit on minimum audio size, with the maximum being 65,536 bytes. The API initiates a WebRTC connection which is handled by the browser (or your WebRTC library of choice) so you don’t have to worry about playback details.

The HTML and Javascript components of this demo are adapted from aiortc examples

​
What’s being written for this to work?
Basic HTML page with a video and audio elements (to playback the webrtc stream).
Javascript file to handle the WebRTC connection and sending the audio stream to the Simli API.
Small python server to decode the mp3 audio stream to PCM Int16 and send it to the WebRTC connection. (not mandatory if you have a different way to get a correctly formatted audio stream).
An audio stream source (for this example, we’re using a radio station stream).
​
index.html
The HTML file is pretty simple. It has a video element to display the talking head video and an audio element to play the audio stream. The video element is hidden by default and will only be shown when the WebRTC connection is established.

filename="index.html"

Copy
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebRTC demo</title>
  </head>
  <body>
    <button id="start" onclick="start()">Start</button>
    <button id="stop" style="display: none" onclick="stop()">Stop</button>

    <h2>State</h2>
    <p>ICE gathering state: <span id="ice-gathering-state"></span></p>
    <p>ICE connection state: <span id="ice-connection-state"></span></p>
    <p>Signaling state: <span id="signaling-state"></span></p>

    <div id="media" style="display: none">
      <h2>Media</h2>

      <audio id="audio" autoplay="true "></audio>
      <video id="video" autoplay="true" playsinline="true"></video>
    </div>

    <h2>Data channel</h2>
    <pre id="data-channel" style="height: 200px;"></pre>

    <h2>SDP</h2>

    <h3>Offer</h3>
    <pre id="offer-sdp"></pre>

    <h3>Answer</h3>
    <pre id="answer-sdp"></pre>

    <script src="client.js"></script>
  </body>
</html>
The HTML file doesn’t do anything special, it just has button to initiate the connection, some text elements to show the state of the connection, and a video and audio element to display the video and audio stream respectively. It also imports a client.js file which contains the javascript code to handle the WebRTC connection.

​
client.js
The javascript file handles the WebRTC connection, sends the audio stream to the Simli API, and displays the video and audio stream.


Copy
// get DOM elements
var dataChannelLog = document.getElementById("data-channel"),
  iceConnectionLog = document.getElementById("ice-connection-state"),
  iceGatheringLog = document.getElementById("ice-gathering-state"),
  signalingLog = document.getElementById("signaling-state");
This block of code gets the DOM elements that will be used to display the state of the connection and the data channel messages.


Copy
// peer connection
var pc = null;

// data channel
var dc = null,
  dcInterval = null;
wsConnection = null;

function createPeerConnection() {
  var config = {
    sdpSemantics: "unified-plan",
  };

  config.iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }];

  pc = new RTCPeerConnection(config);
  // register some listeners to help debugging
  pc.addEventListener(
    "icegatheringstatechange",
    () => {
      iceGatheringLog.textContent += " -> " + pc.iceGatheringState;
    },
    false
  );
  iceGatheringLog.textContent = pc.iceGatheringState;

  pc.addEventListener(
    "iceconnectionstatechange",
    () => {
      iceConnectionLog.textContent += " -> " + pc.iceConnectionState;
    },
    false
  );
  iceConnectionLog.textContent = pc.iceConnectionState;

  pc.addEventListener(
    "signalingstatechange",
    () => {
      signalingLog.textContent += " -> " + pc.signalingState;
    },
    false
  );
  signalingLog.textContent = pc.signalingState;

  // connect audio / video
  pc.addEventListener("track", (evt) => {
    if (evt.track.kind == "video")
      document.getElementById("video").srcObject = evt.streams[0];
    else document.getElementById("audio").srcObject = evt.streams[0];
  });

  pc.onicecandidate = (event) => {
    if (event.candidate === null) {
      console.log(JSON.stringify(pc.localDescription));
    } else {
      console.log(event.candidate);
      //   console.log(JSON.stringify(pc.localDescription));
      candidateCount += 1;
      //   console.log(candidateCount);
    }
  };

  return pc;
}
This block of code defines the function that creates the peer connection and registers some listeners to display the state of the connection. It also connects the audio and video tracks to the video and audio elements respectively.


Copy
let candidateCount = 0;
let prevCandidateCount = -1;
function CheckIceCandidates() {
  if (
    pc.iceGatheringState === "complete" ||
    candidateCount === prevCandidateCount
  ) {
    console.log(pc.iceGatheringState, candidateCount);
    connectToRemotePeer();
  } else {
    prevCandidateCount = candidateCount;
    setTimeout(CheckIceCandidates, 250);
  }
}

function negotiate() {
  return pc
    .createOffer()
    .then((offer) => {
      return pc.setLocalDescription(offer);
    })
    .then(() => {
      prevCandidateCount = candidateCount;
      setTimeout(CheckIceCandidates, 250);
    });
}
This block of code defines the function that initiates the negotiation process. It creates an offer, sets the local description, while it doesn’t wait until Gathering ICE candidates is finished; however, it waits until the ICE gathering state is complete or the number of candidates doesn’t change for 250ms.


Copy
async function connectToRemotePeer() {
  var offer = pc.localDescription;
  var codec;
  document.getElementById("offer-sdp").textContent = offer.sdp;

  const ws = new WebSocket("wss://api.simli.ai/startWebRTCSession");
  wsConnection = ws;
  ws.addEventListener("open", () => {
    ws.send(
      JSON.stringify({
        sdp: offer.sdp,
        type: offer.type,
      })
    );
  });
  let answer = null;
  ws.addEventListener("message", async (evt) => {
    dataChannelLog.textContent += "< " + evt.data + "\n";
    if (evt.data === "START") {
      dcZeroAudio = setTimeout(() => {
        var message = new Uint8Array(64000);
        wsConnection.send(message);
        console.log("SEND");
      }, 100);
      return;
    }
    if (evt.data === "STOP") {
      stop();
      return;
    } else if (evt.data.slice(0, 4) === "pong") {
      console.log("PONG");
      var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
      dataChannelLog.textContent += " RTT " + elapsed_ms + " ms\n";
    } else {
      try {
        const message = JSON.parse(evt.data);
        if (message.type !== "answer") {
          return;
        }
        answer = message;
        document.getElementById("answer-sdp").textContent = answer.sdp;
      } catch (e) {
        console.log(e);
      }
    }
  });
  ws.addEventListener("close", () => {
    console.log("Websocket closed");
  });
  while (answer === null) {
    await new Promise((r) => setTimeout(r, 10));
  }
  await pc.setRemoteDescription(answer);
}
This block of code defines the function that connects to the remote peer. It sends the local description to the Simli API, gets the remote description, and sets it.


Copy
function start() {
  document.getElementById("start").style.display = "none";

  pc = createPeerConnection();

  var time_start = null;

  const current_stamp = () => {
    if (time_start === null) {
      time_start = new Date().getTime();
      return 0;
    } else {
      return new Date().getTime() - time_start;
    }
  };

  var parameters = { ordered: true };
  dc = pc.createDataChannel("datachannel", parameters);

  dc.addEventListener("error", (err) => {
    console.error(err);
  });

  dc.addEventListener("close", () => {
    clearInterval(dcInterval);
    dataChannelLog.textContent += "- close\n";
  });

  dc.addEventListener("open", async () => {
    console.log(dc.id);
    const metadata = {
      faceId: "tmp9i8bbq7c", // Simli face ID
      isJPG: false,
      apiKey: "SIMLI_API_KEY", // Simli API key
      syncAudio: true,
    };

    const response = await fetch(
      "https://api.simli.ai/startAudioToVideoSession",
      {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const resJSON = await response.json();
    wsConnection.send(resJSON.session_token);

    dataChannelLog.textContent += "- open\n";
    dcInterval = setInterval(() => {
      var message = "ping " + current_stamp();
      dataChannelLog.textContent += "> " + message + "\n";
      wsConnection.send(message);
    }, 1000);
    await setTimeout(() => {}, 100);
    var message = new Uint8Array(16000); // 0.5 second silence to start the audio (Optional)
    wsConnection.send(message);
    initializeWebsocketDecoder();
  });
  dc.addEventListener("message", (evt) => {
    dataChannelLog.textContent += "< " + evt.data + "\n";

    if (evt.data.substring(0, 4) === "pong") {
      var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
      dataChannelLog.textContent += " RTT " + elapsed_ms + " ms\n";
    }
  });

  // Build media constraints.

  const constraints = {
    audio: true,
    video: true,
  };

  // Acquire media and start negotiation.

  document.getElementById("media").style.display = "block";
  navigator.mediaDevices.getUserMedia(constraints).then(
    (stream) => {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      return negotiate();
    },
    (err) => {
      alert("Could not acquire media: " + err);
    }
  );
  document.getElementById("stop").style.display = "inline-block";
}

function stop() {
  document.getElementById("stop").style.display = "none";

  // close data channel
  if (dc) {
    dc.close();
  }

  // close transceivers
  if (pc.getTransceivers) {
    pc.getTransceivers().forEach((transceiver) => {
      if (transceiver.stop) {
        transceiver.stop();
      }
    });
  }

  // close local audio / video
  pc.getSenders().forEach((sender) => {
    sender.track.stop();
  });

  // close peer connection
  setTimeout(() => {
    pc.close();
  }, 500);
}

async function initializeWebsocketDecoder() {
  ws = new WebSocket("ws://localhost:8080/");
  ws.onopen = function (event) {
    console.log("connected");
  };
  ws.onmessage = function (event) {
    wsConnection.send(event.data);
  };
  ws.binaryType = "arraybuffer";
  while (dc.readyState !== "open") {
    await setTimeout(() => {}, 100);
  }
  response = await fetch("https://radio.talksport.com/stream");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const reader = response.body.getReader();
  function read() {
    return reader.read().then(({ done, value }) => {
      if (done) {
        console.log("Stream complete");
        return;
      }
      ws.send(value);
      return read();
    });
  }

  return read();
}
This block of code defines the functions that start and stop the connection. The start function creates the peer connection, creates a data channel, sends the metadata to the Simli API, and starts the negotiation process. The stop function closes the data channel, transceivers, local audio and video, and the peer connection.


Copy
async function initializeWebsocketDecoder() {
  ws = new WebSocket("ws://localhost:8080/");
  ws.onopen = function (event) {
    console.log("connected");
  };
  ws.onmessage = function (event) {
    dc.send(event.data);
  };
  ws.binaryType = "arraybuffer";
  while (dc.readyState !== "open") {
    await setTimeout(() => {}, 100);
  }
  response = await fetch("https://radio.talksport.com/stream");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const reader = response.body.getReader();
  function read() {
    return reader.read().then(({ done, value }) => {
      if (done) {
        console.log("Stream complete");
        return;
      }
      ws.send(value);
      return read();
    });
  }

  return read();
}
The last block of code defines the function that initializes the websocket decoder. It creates a websocket connection to the python server, sends the audio stream to the data channel, and reads the audio stream from the radio station.

and Here’s everything together

filename="client.js"

Copy
// get DOM elements
var dataChannelLog = document.getElementById("data-channel"),
  iceConnectionLog = document.getElementById("ice-connection-state"),
  iceGatheringLog = document.getElementById("ice-gathering-state"),
  signalingLog = document.getElementById("signaling-state");

// peer connection
var pc = null;

// data channel
var dc = null,
  dcInterval = null;

function createPeerConnection() {
  var config = {
    sdpSemantics: "unified-plan",
  };

  config.iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }];

  pc = new RTCPeerConnection(config);
  // register some listeners to help debugging
  pc.addEventListener(
    "icegatheringstatechange",
    () => {
      iceGatheringLog.textContent += " -> " + pc.iceGatheringState;
    },
    false
  );
  iceGatheringLog.textContent = pc.iceGatheringState;

  pc.addEventListener(
    "iceconnectionstatechange",
    () => {
      iceConnectionLog.textContent += " -> " + pc.iceConnectionState;
    },
    false
  );
  iceConnectionLog.textContent = pc.iceConnectionState;

  pc.addEventListener(
    "signalingstatechange",
    () => {
      signalingLog.textContent += " -> " + pc.signalingState;
    },
    false
  );
  signalingLog.textContent = pc.signalingState;

  // connect audio / video
  pc.addEventListener("track", (evt) => {
    if (evt.track.kind == "video")
      document.getElementById("video").srcObject = evt.streams[0];
    else document.getElementById("audio").srcObject = evt.streams[0];
  });

  pc.onicecandidate = (event) => {
    if (event.candidate === null) {
      console.log(JSON.stringify(pc.localDescription));
    } else {
      console.log(event.candidate);
      candidateCount += 1;
    }
  };

  return pc;
}

let candidateCount = 0;
let prevCandidateCount = -1;
function CheckIceCandidates() {
  if (
    pc.iceGatheringState === "complete" ||
    candidateCount === prevCandidateCount
  ) {
    console.log(pc.iceGatheringState, candidateCount);
    connectToRemotePeer();
  } else {
    prevCandidateCount = candidateCount;
    setTimeout(CheckIceCandidates, 250);
  }
}

function negotiate() {
  return pc
    .createOffer()
    .then((offer) => {
      return pc.setLocalDescription(offer);
    })
    .then(() => {
      prevCandidateCount = candidateCount;
      setTimeout(CheckIceCandidates, 250);
    });
}

function connectToRemotePeer() {
  var offer = pc.localDescription;
  var codec;
  document.getElementById("offer-sdp").textContent = offer.sdp;

 const ws = new WebSocket("wss://api.simli.ai/startWebRTCSession");
  wsConnection = ws;
  ws.addEventListener("open", () => {
    ws.send(
      JSON.stringify({
        sdp: offer.sdp,
        type: offer.type,
      })
    );
  });
  let answer = null;
  ws.addEventListener("message", async (evt) => {
    dataChannelLog.textContent += "< " + evt.data + "\n";
    if (evt.data === "START") {
      dcZeroAudio = setTimeout(() => {
        var message = new Uint8Array(64000);
        wsConnection.send(message);
        console.log("SEND");
      }, 100);
      return;
    }
    if (evt.data === "STOP") {
      stop();
      return;
    } else if (evt.data.slice(0, 4) === "pong") {
      console.log("PONG");
      var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
      dataChannelLog.textContent += " RTT " + elapsed_ms + " ms\n";
    } else {
      try {
        const message = JSON.parse(evt.data);
        if (message.type !== "answer") {
          return;
        }
        answer = message;
        document.getElementById("answer-sdp").textContent = answer.sdp;
      } catch (e) {
        console.log(e);
      }
    }
  });
  ws.addEventListener("close", () => {
    console.log("Websocket closed");
  });
  while (answer === null) {
    await new Promise((r) => setTimeout(r, 10));
  }
  await pc.setRemoteDescription(answer);
}

function start() {
  document.getElementById("start").style.display = "none";

  pc = createPeerConnection();

  var time_start = null;

  const current_stamp = () => {
    if (time_start === null) {
      time_start = new Date().getTime();
      return 0;
    } else {
      return new Date().getTime() - time_start;
    }
  };

  var parameters = { ordered: true };
  dc = pc.createDataChannel("datachannel", parameters);

  dc.addEventListener("error", (err) => {
    console.error(err);
  });

  dc.addEventListener("close", () => {
    clearInterval(dcInterval);
    dataChannelLog.textContent += "- close\n";
  });

  dc.addEventListener("open", async () => {
    console.log(dc.id);
    const metadata = {
      faceId: "tmp9i8bbq7c", // Simli face ID
      isJPG: false,
      apiKey: "SIMLI_API_KEY", // Simli API key
      syncAudio: true,
    };

    const response = await fetch(
      "https://api.simli.ai/startAudioToVideoSession",
      {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const resJSON = await response.json();
    wsConnection.send(resJSON.session_token);

    dataChannelLog.textContent += "- open\n";

    await setTimeout(()=>{}, 100);
    var message = new Uint8Array(16000)  // 0.5 second silence to start the audio (Optional)
    wsConnection.send(message);
    initializeWebsocketDecoder()
  });

  dc.addEventListener("message", (evt) => {
    dataChannelLog.textContent += "< " + evt.data + "\n";

    if (evt.data.substring(0, 4) === "pong") {
      var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
      dataChannelLog.textContent += " RTT " + elapsed_ms + " ms\n";
    }
  });

  // Build media constraints.

  const constraints = {
    audio: true,
    video: true,
  };

  // Acquire media and start negotiation.

  document.getElementById("media").style.display = "block";
  navigator.mediaDevices.getUserMedia(constraints).then(
    (stream) => {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      return negotiate();
    },
    (err) => {
      alert("Could not acquire media: " + err);
    }
  );
  document.getElementById("stop").style.display = "inline-block";
}

function stop() {
  document.getElementById("stop").style.display = "none";

  // close data channel
  if (dc) {
    dc.close();
  }

  // close transceivers
  if (pc.getTransceivers) {
    pc.getTransceivers().forEach((transceiver) => {
      if (transceiver.stop) {
        transceiver.stop();
      }
    });
  }

  // close local audio / video
  pc.getSenders().forEach((sender) => {
    sender.track.stop();
  });

  // close peer connection
  setTimeout(() => {
    pc.close();
  }, 500);
}
​
server.py
This one is also relatively simple and is used to decode the mp3 audio stream to PCM Int16 and send it back.

filename="server.py"

Copy
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
import asyncio
import uvicorn

app = FastAPI()


async def GetDecodeOutput(
    websocket: WebSocket, decodeProcess: asyncio.subprocess.Process
):
    while True:
        data = await decodeProcess.stdout.read(6000)
        if not data:
            break
        await websocket.send_bytes(data)


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        decodeTask = await asyncio.subprocess.create_subprocess_exec(
            *[
                "ffmpeg",
                "-i",
                "pipe:0",
                "-f",
                "s16le",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-acodec",
                "pcm_s16le",
                "-",
            ],
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
        )
        sendTask = asyncio.create_task(GetDecodeOutput(websocket, decodeTask))
        while (
            websocket.client_state == WebSocketState.CONNECTED
            and websocket.application_state == WebSocketState.CONNECTED
        ):
            data = await websocket.receive_bytes()
            decodeTask.stdin.write(data)
    except WebSocketDisconnect:
        pass
    finally:
        decodeTask.stdin.close()
        await decodeTask.wait()
        await sendTask
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run(app, port=8080)
To run, just type python server.py

WebRTC with WebSockets Signaling Guide
This endpoint is a websocket endpoint that takes in a stream of PCM16 audio frames and a set of control signals to manage a WebRTC Stream. The server sends only pongs, keepalive “ACK” messages, and a STOP signal when the server wants to terminate the session

WebSocket URL: wss://api.simli.ai/startWebRTCSession
​
Initial Request Format
The first request after initializing the websocket connection should be a JSON object with the following fields:


Copy
{
  "sdp": "SDP FROM pc.localDescription.sdp",
  "type": "Type from pc.localDescription.type"
}
This object is generated from an RTCPeerConnection, you can refer to RTCPeerConnection Docs for more details (or the equivalent docs).

The server responds with two objects. The first one should be ignored as it is reserved for future expansion. The second one is the answer object you give to RTCPeerConnection.setRemoteDescription().

After you set it, you can send in the session token obtained from https://api.simli.ai/startAudioVideoSession. Please send the session token itself not the whole response JSON.

After that, you can send in the Audio bytes following the format specified below. You can also send “SKIP” on the websocket to clear the audio buffer and ignore everything you’ve already sent.

​
Audio Input Format
The audio frame is the bytes representation of the PCM16 audio frame. The audio frame is always 16000Hz mono. The lipsync will be wrong if there’s a mismatch in the audio sampling rate or channel count. As of right now not other configs are possible. The number of bytes will always be an even number. For example 255ms of audio will be 16000 * 2 * 0.255 = 8160 bytes. The minimum audio chunk size is 250ms to avoid frequent websocket calls.

If there’s nothing to send, you must send a zero value byte array of length 6000 bytes to keep receiveing frames. After sending the initial audio (you must begin with some audio), no input mode will activate if handleSilence is set to true

Migration guide to WebSocket Signaling
How to move on from POST to WebSocket

​
Simli WebRTC with WebSockets signaling user/migration guide
​
What is this?
If you’ve been using the Simli API directly, you might’ve notice a couple of issues:” . Connecting with mobiledata is finnick, Sometimes you get the elusive “datachannel is not open” when you don’t know what is the datachannel used for and what you might’ve done incorrectly. Other times, you may’ve had some lag spikes. We’ve had all of these issues when building the demo repos and our own website. So we fixed it! While the fix isn’t simple as having the backend manage everything, it’s not that much different!

​
WebSockets vs the datachannel
The datachannel is a spec used for bidirectional communication for WebRTC application. It’s awesome, but some details haven’t aged nicely with a more security concerned internet. It’s originally built for chat messages, on the other hand (for many good reasons), we’re using it to send raw audio to our servers, of course it’s complaining XD.

On the other hand, WebSockets is a relatively modern web standard that works on https (meaning it will work with most reasonably strict firewalls). However, it effectively works in the same way as the datachannel (both in terms of ergonomics and it’s browser API), without the hassles coming with the datachannel.

​
Why the change?
It’s simple, the datachannel worked horribly as a session init mechanism over turn leading to exceedingly high latency, something that we can’t live by as we aim to give you the least latency possible! There are also other benefits to this change but we will list them below the migration guide.

​
What to change?
​
Session Init
Well, you had a POST call to https://api.simli.ai/startWebRTCSession which you sent a JSON with {sdp: pc.localDescription.sdp, type: pc.localDescription.type}. Now, it’s a WebSocket connection to wss://api.simli.ai/startWebRTCSession to which you send the same JSON. On it, you receive two messages, the first one is reserved for possible future behavior, the second one is the output of the POST call: {sdp:remoteSDP, type:"answer"}. The second response you use with pc.setRemoteDescrition(ANSWER_RECEIVED_FROM_WEBSOCKET) and that’s the main difference in session initiallization nothing more.

​
Sending and Receiving Data
All messages that used to be on the datachannel are now transferred over the WebSocket connection. Which means you should send the session_token on the WebSocket connection instead of the datachannel, and then the audio bytes as well are send on the WebSocket connection. Anything that was datachannel.send() is now websocket.send()

That’s it we migrated everything

​
Possible updates and improvements that can be achived (NOTHING IS BUILT YET AND NO PROMISES XD)
This websocket connection is pretty nice because it affords us better signaling (so an incorrectly terminated session doesn’t linger for too long as the current behavior with the datachannel) We also have the ability now to add a broadcast feature in the future (single face, multiple recipients). And with some work, we are able to have session reconnects

WebRTC
WebRTC and you, the bare minimum to get going

​
Purpose of the document
This document is not an explanation of WebRTC, or even how it works. It is just a simple description of the WebRTC APIs and related Objects (most likely the same as the Javascript Implementation) and what sequence of calls you need to make to get a media stream going and rendered. If you’re interested in how it actually works, you can read this reference by Pion WebRTC (Go implementation of the protocol).

​
The Jargon: WebRTC Objects and APIs
​
RTCConfiguration
This is the configuration object that you pass to the RTCPeerConnection object. It contains the iceServers array which contains the STUN and TURN servers that the client will use to establish the connection.

​
RTCOffer
This is the object that is created by the RTCPeerConnection object. It contains the information about the media streams that the client is willing to share and the configuration of the connection. IP addresses, codecs, etc. Everything that you can accept or send. This object is then sent to the other peer.

​
RTCAnswer
This is the object that is created by the RTCPeerConnection object in response to the RTCOffer object. It contains the information about the media streams that the client is willing to share and the configuration of the connection. IP addresses, codecs, etc. Everything that you can accept or send. This object is then sent to the other peer.

​
RTCIceCandidate
Fancy talk for possible IP addresses that the peers can use to connect to each other. This includes local IPs too, so the WebRTC spec makes it easy to connect to other computers on your network without going through the general Internet. This is used to establish the connection between the peers.

​
RTCPeerConnection
tl;dr: You start the connection, create offer, get answer, assign answer here, and you’ll start trying to connect to the peer.

This is the main object which everything revolves around. As the client, you’ll be initiating the connection. So this object creates the RTC offer according to the configuration. Then it creates the RTCOffer, which other peers will use to know how to connect to you and what kind of data will be exchanged. Other peers will also have an RTCPeerConnection object which will create an RTCAnswer (Same as the offer but is created in response to the offer). The RTCAnswer is used to know what the peer agreed to and how to connect to them.

​
MediaStreamTracks
These objects represent the Audio and Video streams. TO BE CLEAR, the streams themselves are not joined in any way so your video and audio are completly independent of each other. You can have a video stream without audio and vice versa. These objects are then added to the RTCPeerConnection object to be sent to the other peer. It is also the object that you get from the getUserMedia function when you specify what you’re sending in the offer.

​
Datachannel
This is the object that you can use to send data between the peers. It is not a stream, so you can’t send a continuous stream of data. It is more like a message. You can send a message and the other peer will receive it. You can also send a message to a specific channel, so you can have multiple channels for different types of data.

​
Dancing the dance: WebRTC handshake and creating the connection
​
You and I, Local and Remote
Everything starts with the RTCPeerConnection. Sure you need the configuration, but you can just … not (given you’re only testing on localhost, STUN/ICE is needed for reliable connection most of the time). So you create the RTCPeerConnection. Then, you specify what kind of data are we sending, is it datachannel, audio, video, or any combination of them. This is also where we might want to specify a config for the MediaStreams or the datachannel.

Once you have figured out what you want the connection to do, you create the offer object using, surprise, createOffer() function. This creates a json that will be sent to all peers that you want to connect to. Also you must make sure to tell the RTCPeerConnection object to use the offer as the local description using setLocalDescription() function.

There’s no exact way that specifies how to send the offer and get the answer. Some examples make you paste the offer in a CLI, others can use a POST request (easiest way in my opinion), and someone thought using WebSockets is a good idea (if you’re doing trickle ICE then probably but that’s a different rabbithole that I won’t get into here).

Regardless of how you’re getting the answer, you need to set the remote description of the RTCPeerConnection object to the answer using setRemoteDescription() function. The peer does the same thing, but in reverse. They get the offer set it as the RemoteDescription and create an answer and set it as the LocalDescription.

AAAND Tada, this is the actual bare minimum. If you’re not going over the internet and just testing on localhost, you can now see the video and audio streams of the other peer (assuming you added the streams to the RTCPeerConnection object and have the HTML stuff figured out correctly). As an example, you can see the server example on the aiortc (python’s webrtc) github page which streams a video from disk to the client, using the same principles described here.

​
If there’s a will there’s a way: ICE and Getting the target IP
The main reason we’re using WebRTC is to allow peer to peer communication without going through some intermediary server. So, we create the offer which contains the return information; however, your computer doesn’t really know its current IP address and in most cases, it probably dynamically assigned. Which is where STUN and ICE come in.

A STUN server is used to tell you what your IP address is and what port is open for communication. ICE is basically the mechanism for getting all possible IP addresses (local and public) and prioritize them based on least delay (more info here). Ideally, you would wait to get ALL ICE candidates before sending the offer. Sadly, ICE is SLOW. At the time of writing, it takes 40 seconds on average to finish the ICE process.

As such, people have started working with partial ICE results. Once you get and ICE candidate, you can send it to the other peer and they can start trying to connect to you. This is called trickle ICE. While it is mostly standard, it is not implemented in all browsers. So, you might want to wait for all ICE candidates before sending the offer.

Aiortc library doesn’t currently support trickle ICE, so what we’re currently doing is waiting until no more ICE candidates are being generated for 500ms and then sending the offer. This is not ideal but it works great for our current limitations.

​
Showing the work: Displaying Video and Playing Audio
This is actually the most straight forward thing in here. The RTCPeerConnection emits a lot of different events, the one we care about here is the track event. This event is emitted when a new MediaStreamTrack is added to the RTCPeerConnection object. You can then use this event to add the track to the HTML video or audio element by setting the srcObject property of the element to the MediaStream object that the track is a part of.

​
I ran out of titles: Accessing Mediastreams and applying transformations
Each language has it’s own way of getting the video/audio data from the MediaStream object. You’re on your own kid.

​
I prefer text: Using Datachannels
You need to create the datachannel object using the createDataChannel() function. You can then send messages using the send() function. You can also listen for messages using the message event. You can also listen for the open event to know when the datachannel is ready to send messages. You can also send binary data without base64 encoding by using the send() function with an UInt8Array as the argument.

Audio formats
Audio and the forgotten knowledge of the past

​
Purpose of the document
Talk about Audio formats, encoding schemes, popular audio container formats, streamability, and raw audio data. There’s another good article that goes into more details about general digital audio. This document is more focused on the audio formats and encoding schemes that are popular in the web world.

​
What’s raw audio data and why so many different representations?
A quick recap of the Retell AI article, audio in the real world is a sound wave which can be represented by some (math) function. Usually, such functions are complicated so we represent the sound wave with how loud is it at a given time. How many times we’re checking the loudness is what’s called sampling rate. That’s all there is to audio in the real world.

As the years went on, we created different ways to represent this data in a digital form. Which is why you might see terms like Int8 PCM, Int16 PCM, float32 PCM and many other ways of representing the same raw audio data on a computer. Each format has its merits and some of them are limited by the hardware they were designed for which is besides the point. All of these are known as raw audio data and are usually stored in a .wav file to be played by any audio player.

​
Audio codec vs Audio container (File format)
Let’s get something clear, an audio codec is a part of a specific audio container. In simple terms, the container contains a lot more than just the audio, it also contains metadata, subtitles, and depending on the format, instructions on how to play the audio. On the other hand, the codec is the actual algorithm that is used to encode and decode the audio data.

Not all audio containers need a codec. For example, .wav files can contain metadata about the sampling rate, channel count, and which type of raw audio data is stored in the file. Which is different from .raw files which are just raw audio data with no metadata and can not be played without knowing anything else about how the file was made. However, all containers need to specify what kind of data is inside. Sometimes, there are containers that are paired with a specific codec, like .mp3 files which are paired with the MPEG-1 Audio Layer III codec.

Most codecs split the audio data into frames and encode them separately. This means that the whole frame needs to be decoded before it can be played. This is why you might see some audio players take a while to start playing a file. Other codecs might not include the metadata of the audio file which makes individual frames impossible to decode and as such they can’t be played without the whole file.

This is why you can’t just download half an mp3 file and it works, sometimes it does, mostly it doesn’t. Because mp3 is not the most friendly format for streaming. Other codecs like Opus are designed to be streamed and can be played as soon as the first frame is downloaded.

​
Audio Processing
Generally speaking, you can’t really do anything with encoded audio. Even playing it requires decoding it into pcm first. Most decoders will decode the audio in chunks, processing each encoded frame into its equivalent pcm. The problem is which PCM format to use. Well it actually depends on what you actually need. Some applications require PCM Int16, others use Float32. The trick is to know what you need and convert the audio to that format because using an incorrect format gives you garbage results.

One of the most well known and widely used decoders is ffmpeg. It handles almost all forms of audio and video and is extremely powerful. So powerful in fact that it is somewhat notorious for being difficult to use. But since we only care about decoding the audio

here’s a simple command to decode an audio file to PCM Int16:


Copy
ffmpeg -i **INPUT FILE PATH** -f s16le -acodec pcm_s16le -ar 16000 -ac 1 output.raw
So let’s dissect this command:

ffmpeg: The command to run the ffmpeg program
-i: tells ffmpeg that what follows is the input file. FFMPEG can automatically deduce all metadata about the file to decode it properly unless the input is either a raw audio file or it is piped from another program or stdin.
** INPUT FILE PATH **: The path to the input file. This can be a local file or a remote file (URL) and a lot more. FFMPEG can handle a ton of different input modes refer to the documentation for more information.
-f: means that the following arguments specify the formatting of the output
s16le: specifies that the output format is PCM signed Int16 little endian.
-acodec: specifies the audio codec to use. In this case, we’re using the PCM codec. While not a codec on its own, it’s listed under codecs for generality
pcm_s16le: specifies the PCM format to use. In this case, we’re using PCM Int16 little endian.
-ar: specifies the audio sampling rate. In this case, we’re using 16000 Hz.
-ac: specifies the number of audio channels. In this case, we’re using 1 channel.
output.raw: specifies the output file name. This can be anything you want.
We can modify it a little bit to convert the audio to PCM Float32:


Copy
ffmpeg -i **INPUT FILE PATH** -f f32le -acodec pcm_f32le -ar 16000 -ac 1 output.raw
The only difference is the -f and -acodec arguments. The rest is the same.

Okay that’s fine and all but what if you want the output in your program, or maybe the audio file is the output of an API call and you don’t want to save it to disk. Well, you can pipe the input to stdin and get the output from stdout. Here’s how you can do it:


Copy
ffmpeg -i pipe:0 -f s16le -acodec pcm_s16le -ar 16000 -ac 1 pipe:1
This command is the same as the first one but instead of specifying the input and output files, we’re using pipe:0 and pipe:1 respectively. This tells ffmpeg to use stdin and stdout as the input and output respectively. This is useful when you want to use the output in your program or you want to pipe the output to another program.

So if we’re using python we can do something like this:


Copy
import subprocess
import requests
import threading

def read_output(process):
    for line in process.stdout:
        print(len(line))

ffmpegProcess = subprocess.Popen(
    ["ffmpeg", "-i", "pipe:0", "-f", "s16le", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", "pipe:1"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE
)
readThread = threading.Thread(target=read_output, args=(ffmpegProcess,))
readThread.start()
for chunk in requests.get("https://radio.talksport.com/stream", stream=True).iter_content(4096):
    ffmpegProcess.stdin.write(chunk)

This code will read the audio stream from the TalkSport radio station, which streams out an mp3 (good choice for them, not low latency streaming), and convert it to PCM Int16. The read_output function reads the output from the ffmpeg process and prints the length of the output. You can modify it to do whatever you want with the output.

You can also find a package that wraps the ffmpeg binaries and call them directly without having to deal with subprocesses and input piping. There’s PyAV for python, ffmpeg.Net for C#, ffmpeg-Go for Go. There are many more out there, just search for them. Most of the time the correct solution is just the cli and subprocesses though.

/startWebRTCSession
Start a WebRTC session

POST
/
startWebRTCSession

const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"sdp":"<string>","type":"<string>"}'
};

fetch('https://api.simli.ai/startWebRTCSession', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Body
application/json
​
sdp
stringrequired
​
type
stringrequired
Response
200

200
application/json
Successful Response
The response is of type any.


/startAudioToVideoSession
Start a session and get it’s session token

POST
/
startAudioToVideoSession

const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"faceId":"<string>","apiVersion":"v1","isJPG":false,"syncAudio":false,"audioInputFormat":"pcm16","batchSize":1,"apiKey":"<string>","handleSilence":true,"maxSessionLength":3600,"maxIdleTime":300,"preloadAvatar":false}'
};

fetch('https://api.simli.ai/startAudioToVideoSession', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Please do note that the API might respond with server overloaded. If your product requires dedicated slots, you can contact us.

Body
application/json
​
faceId
stringrequired
​
apiKey
stringrequired
​
apiVersion
stringdefault:v1
​
isJPG
booleandefault:false
​
syncAudio
booleandefault:false
​
audioInputFormat
stringdefault:pcm16
​
batchSize
integerdefault:1
​
handleSilence
booleandefault:true
​
maxSessionLength
integerdefault:3600
​
maxIdleTime
integerdefault:300
​
preloadAvatar
booleandefault:false
Response
200

200
application/json
Successful Response
The response is of type any.


/getIceServers
Get TURN servers if you need them for NAT avoidance

POST
/
getIceServers

const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"apiKey":"<string>"}'
};

fetch('https://api.simli.ai/getIceServers', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
Body
application/json
​
apiKey
stringrequired
Response
200

200
application/json
Successful Response
The response is of type any


/textToVideoStream
This endpoint returns a url of an HLS .m3u8 playlist file along with an mp4 file.

POST
/
textToVideoStream

const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"ttsAPIKey":"","simliAPIKey":"","faceId":"tmp9i8bbq7c","user_id":"","requestBody":{"audioProvider":"PlayHT","text":"Hello, my name is John Doe","voice":"s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json","quality":"draft","speed":1,"sample_rate":24000,"voice_engine":"PlayHT2.0-turbo","output_format":"mp3","emotion":"female_happy","voice_guidance":3,"style_guidance":20,"text_guidance":1}}'
};

fetch('https://api.simli.ai/textToVideoStream', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
​
Sample Input with elevenlabs audio provider

Copy
{
  "ttsAPIKey": "", // Your Elevenlabs api Key
  "simliAPIKey": "",
  "faceId": "tmp9i8bbq7c",
  "requestBody": {
    "audioProvider": "ElevenLabs",
    "text": "Tell me a joke will you. How many cakes can you eat?",
    "voiceName": "pMsXgVXv3BLzUgSXRplE",
    "model_id": "eleven_turbo_v2",
    "voice_settings": {
        "stability": 0.1,
        "similarity_boost": 0.3,
        "style": 0.2
    }
  }
}

​
Sample Input with PlayHT audio provider

Copy
{
  "ttsAPIKey": "", // Your playht_authorization key
  "simliAPIKey": "",
  "faceId": "tmp9i8bbq7c",
  "user_id": "", // Your playht user id
  "requestBody": {
    "audioProvider": "PlayHT",
    "text": "Hello, my name is John Doe. Tell me a joke.",
    "voice": "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json",
    "quality": "draft",
    "speed": 1,
    "sample_rate": 24000,
    "voice_engine": "PlayHT2.0-turbo",
    "output_format": "mp3",
    "emotion": "female_happy",
    "voice_guidance": 3,
    "style_guidance": 20,
    "text_guidance": 1
  }
}
​
Sample Response Body

Copy
{
    "hls_url": "http://api.simli.ai/hls/path-to-file/output.m3u8",
    "mp4_url": "http://api.simli.ai/mp4/path-to-file/output.mp4"
}

Body
application/json
​
faceId
stringrequired
​
simliAPIKey
stringrequired
​
requestBody
objectrequired
ElevenLabsAudioGenAPIRequest
PlayHTAudioGenAPIRequest
CartesiaAudioGenAPIRequest

Show child attributes

​
ttsAPIKey
string | null
​
user_id
stringdefault:
Response
200

200
application/json
Successful Response
The response is of type any



/audioToVideoStream
This endpoint returns a url of an HLS .m3u8 playlist file along with an mp4 file.

POST
/
audioToVideoStream

const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"simliAPIKey":"<string>","faceId":"<string>","audioBase64":"<string>","audioFormat":"pcm16","audioSampleRate":16000,"audioChannelCount":1,"videoStartingFrame":0}'
};

fetch('https://api.simli.ai/audioToVideoStream', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

Try it
​
Sample Response Body

Copy
{
  "hls_url": "http://api.simli.ai/hls/path-to-file/output.m3u8",
  "mp4_url": "http://api.simli.ai/mp4/path-to-file/output.mp4"
}
Body
application/json
​
simliAPIKey
stringrequired
​
faceId
stringrequired
​
audioBase64
stringrequired
​
audioFormat
enum<string>required
Available options: pcm16, pcm32, wav, mp3, ogg 
​
audioSampleRate
integerdefault:16000
​
audioChannelCount
integerdefault:1
​
videoStartingFrame
integerdefault:0
Response
200

200
application/json
Successful Response
The response is of type any