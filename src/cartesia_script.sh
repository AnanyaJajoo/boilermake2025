curl -N -X POST "https://api.cartesia.ai/tts/bytes" \
     -H "Cartesia-Version: 2024-06-10" \
     -H "X-API-Key: sk_car_mxsCzaRaWvi8IOXOYFBih" \
     -H "Content-Type: application/json" \
     -d '{"transcript": "How good really is this API???", "model_id": "sonic", "voice": {"mode":"id", "id": "694f9389-aac1-45b6-b726-9d9369183238"}, "output_format":{"container":"wav", "encoding":"pcm_f32le", "sample_rate":44100}}' > sonic.wav
