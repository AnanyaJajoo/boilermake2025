import Foundation
import WebKit
import AVFoundation
import Network

class WebRTCManager: NSObject {
    // MARK: - Properties
    private var webSocket: URLSessionWebSocketTask?
    private var session: URLSession?
    private var isConnected = false
    private var simliAPIKey: String
    private var faceId: String
    private var videoView: UIView?
    private var audioPlayer: AVPlayer?
    private var completionHandler: ((Bool, Error?) -> Void)?
    private var sessionToken: String?
    
    // MARK: - Initialization
    init(apiKey: String, faceId: String = "tmp9i8bbq7c") {
        self.simliAPIKey = apiKey
        self.faceId = faceId
        super.init()
        setupURLSession()
    }
    
    deinit {
        disconnect()
    }
    
    // MARK: - Setup
    private func setupURLSession() {
        session = URLSession(configuration: .default, delegate: self, delegateQueue: OperationQueue())
    }
    
    // MARK: - WebSocket Connection
    func connect(videoView: UIView, completion: @escaping (Bool, Error?) -> Void) {
        self.videoView = videoView
        self.completionHandler = completion
        
        // First get the session token, then establish WebSocket connection
        getSessionToken { [weak self] success, token, error in
            guard let self = self else { return }
            
            if success, let token = token {
                self.sessionToken = token
                self.connectWebSocket()
            } else {
                completion(false, error ?? NSError(domain: "WebRTCManager", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to get session token"])) 
            }
        }
    }
    
    private func connectWebSocket() {
        guard let url = URL(string: "wss://api.simli.ai/startWebRTCSession"),
              let token = sessionToken else {
            completionHandler?(false, NSError(domain: "WebRTCManager", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL or missing token"]))
            return
        }
        
        print("Connecting to WebSocket...")
        webSocket = session?.webSocketTask(with: url)
        webSocket?.resume()
        
        // Start listening for messages
        receiveMessage()
        
        // Send the session token after the connection is established
        // We'll do this from the didOpenWithProtocol delegate method
    }
    
    func disconnect() {
        webSocket?.cancel(with: .goingAway, reason: nil)
        webSocket = nil
        isConnected = false
    }
    
    // MARK: - WebSocket Message Handling
    private func receiveMessage() {
        webSocket?.receive { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let message):
                switch message {
                case .data(let data):
                    self.handleBinaryMessage(data)
                case .string(let string):
                    self.handleTextMessage(string)
                @unknown default:
                    break
                }
                // Continue receiving messages
                self.receiveMessage()
                
            case .failure(let error):
                print("WebSocket receive error: \(error)")
                self.isConnected = false
                self.completionHandler?(false, error)
            }
        }
    }
    
    private func handleTextMessage(_ message: String) {
        print("Received message: \(message)")
        
        if message == "START" {
            print("Received START command - session established")
            isConnected = true
            completionHandler?(true, nil)
            
            // Connection established, send empty audio to start session
            sendEmptyAudio()
        } else if message == "STOP" {
            print("Received STOP command - closing connection")
            disconnect()
        } else if message.contains("roomID") {
            print("Received room information")
            // This message contains connection details - we should initialize the WebRTC connection here
            // Add a short delay to ensure the server is ready for the SDP offer
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.createAndSendOffer()
            }
        } else {
            // Handle other messages (e.g., SDP answers)
            if let data = message.data(using: .utf8) {
                do {
                    if let jsonObject = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                        print("Received JSON message: \(jsonObject)")
                        
                        if jsonObject["type"] as? String == "answer" {
                            // Handle SDP answer
                            handleSDPAnswer(jsonObject)
                        } else if let error = jsonObject["error"] as? String {
                            print("Received error from server: \(error)")
                            completionHandler?(false, NSError(domain: "SimliServer", code: 3, userInfo: [NSLocalizedDescriptionKey: error]))
                        }
                    }
                } catch {
                    print("Error parsing JSON: \(error)")
                }
            }
        }
    }
    
    private func handleBinaryMessage(_ data: Data) {
        // Handle binary messages (e.g., video frames)
        print("Received binary data: \(data.count) bytes")
    }
    
    private func sendMessage(_ message: String) {
        // Truncate long messages in logs to avoid cluttering
        let logMessage = message.count > 100 ? message.prefix(100) + "..." : message
        print("Sending text message: \(logMessage)")
        
        webSocket?.send(.string(message)) { error in
            if let error = error {
                print("Error sending message: \(error)")
            }
        }
    }
    
    private func sendData(_ data: Data) {
        webSocket?.send(.data(data)) { error in
            if let error = error {
                print("Error sending data: \(error)")
            }
        }
    }
    
    // MARK: - Simli Session Management
    private func createAndSendOffer() {
        // Create and send SDP offer
        createSDPOffer { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let sdpOffer):
                print("Sending SDP offer...")
                self.sendMessage(sdpOffer)
                
            case .failure(let error):
                print("Error creating SDP offer: \(error)")
                self.completionHandler?(false, error)
            }
        }
    }
    
    private func createSDPOffer(completion: @escaping (Result<String, Error>) -> Void) {
        // Create a simpler SDP offer without the complex WebRTC fields that might be causing issues
        let offer = [
            "type": "offer",
            "sdp": "v=0\r\no=- \(Int(Date().timeIntervalSince1970)) 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:siml\r\na=ice-pwd:simliapp\r\na=fingerprint:sha-256 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF\r\na=setup:actpass\r\na=mid:audio\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\n",
            "apiKey": simliAPIKey
        ] as [String: Any]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: offer, options: [.prettyPrinted])
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                completion(.success(jsonString))
            } else {
                completion(.failure(NSError(domain: "WebRTCManager", code: 9, userInfo: [NSLocalizedDescriptionKey: "Failed to create JSON string"])))
            }
        } catch {
            print("Error creating SDP offer JSON: \(error)")
            completion(.failure(error))
        }
    }
    
    private func handleSDPAnswer(_ answer: [String: Any]) {
        // In a real implementation, this would be passed to WebRTC PeerConnection
        print("Handling SDP Answer: \(answer)")
        
        // SDP answer received, we're now connected
        self.isConnected = true
        completionHandler?(true, nil)
        
        // Send initial empty audio to start the session
        sendEmptyAudio()
    }
    
    private func getSessionToken(completion: @escaping (Bool, String?, Error?) -> Void) {
        let metadata: [String: Any] = [
            "faceId": faceId,
            "isJPG": false,
            "apiKey": simliAPIKey,
            "syncAudio": true
        ]
        
        guard let metadataData = try? JSONSerialization.data(withJSONObject: metadata),
              let url = URL(string: "https://api.simli.ai/startAudioToVideoSession") else {
            print("Error creating session token request")
            completion(false, nil, NSError(domain: "WebRTCManager", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid metadata or URL"]))
            return
        }
        
        print("Getting session token with API key: \(simliAPIKey)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = metadataData
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let httpResponse = response as? HTTPURLResponse {
                print("Session token HTTP response code: \(httpResponse.statusCode)")
            }
            
            if let error = error {
                print("Error getting session token: \(error.localizedDescription)")
                completion(false, nil, error)
                return
            }
            
            guard let data = data else {
                print("No data received for session token")
                completion(false, nil, NSError(domain: "WebRTCManager", code: 5, userInfo: [NSLocalizedDescriptionKey: "No data received"]))
                return
            }
            
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Session token response: \(jsonString)")
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    if let error = json["error"] as? String {
                        print("API error: \(error)")
                        completion(false, nil, NSError(domain: "SimliAPI", code: 6, userInfo: [NSLocalizedDescriptionKey: error]))
                        return
                    }
                    
                    if let sessionToken = json["session_token"] as? String {
                        print("Got session token: \(sessionToken)")
                        completion(true, sessionToken, nil)
                        return
                    }
                }
                
                print("Invalid response format")
                completion(false, nil, NSError(domain: "WebRTCManager", code: 7, userInfo: [NSLocalizedDescriptionKey: "Invalid response format"]))
            } catch {
                print("Error parsing session token response: \(error)")
                completion(false, nil, error)
            }
        }.resume()
    }
    
    private func sendEmptyAudio() {
        // Send 0.5 seconds of silence (48000 samples at 32-bit float per sample)
        // Using the format that matches our audio session: 48000Hz Float32
        let emptyAudioData = Data(count: 4800) // reduced size - 0.05 seconds of audio
        print("Sending empty audio data (\(emptyAudioData.count) bytes)")
        sendData(emptyAudioData)
    }
    
    // MARK: - Audio Processing
    func sendAudioData(_ audioData: Data) {
        // Send audio data to Simli for processing
        if isConnected {
            sendData(audioData)
        }
    }
}

// MARK: - URLSessionWebSocketDelegate
extension WebRTCManager: URLSessionWebSocketDelegate {
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        print("WebSocket connection established")
        
        // Send the session token only once, immediately after the connection is established
        if let token = sessionToken {
            print("Sending session token...")
            sendMessage(token)
        }
    }
    
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
        print("WebSocket connection closed with code: \(closeCode)")
        isConnected = false
        
        if let reason = reason, let reasonString = String(data: reason, encoding: .utf8) {
            print("Close reason: \(reasonString)")
        }
        
        // Notify of disconnect if we haven't completed yet
        if !isConnected {
            completionHandler?(false, NSError(domain: "WebRTCManager", code: 8, userInfo: [NSLocalizedDescriptionKey: "WebSocket disconnected"]))
        }
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error {
            print("WebSocket task completed with error: \(error.localizedDescription)")
            completionHandler?(false, error)
        }
    }
} 