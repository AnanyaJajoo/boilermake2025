import Foundation
import AVFoundation

class AudioProcessor: NSObject {
    // MARK: - Properties
    private var audioEngine: AVAudioEngine?
    private var inputNode: AVAudioInputNode?
    private var isRecording = false
    
    // Callback for new audio data
    var onAudioData: ((Data) -> Void)?
    
    // MARK: - Initialization
    override init() {
        super.init()
        setupAudioEngine()
    }
    
    deinit {
        stopRecording()
    }
    
    // MARK: - Setup
    private func setupAudioEngine() {
        audioEngine = AVAudioEngine()
        inputNode = audioEngine?.inputNode
    }
    
    // MARK: - Recording
    func startRecording() -> Bool {
        guard !isRecording, let audioEngine = audioEngine, let inputNode = inputNode else {
            return false
        }
        
        // Set up audio session
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("Error setting up audio session: \(error)")
            return false
        }
        
        // Use the native input format instead of forcing a format
        let nativeFormat = inputNode.inputFormat(forBus: 0)
        print("Using native input format: \(nativeFormat)")
        
        // Install tap on input node with the native format
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: nativeFormat) { [weak self] buffer, time in
            self?.processAudioBuffer(buffer)
        }
        
        // Start the engine
        do {
            audioEngine.prepare()
            try audioEngine.start()
            isRecording = true
            return true
        } catch {
            print("Error starting audio engine: \(error)")
            return false
        }
    }
    
    func stopRecording() {
        guard isRecording, let audioEngine = audioEngine, let inputNode = inputNode else {
            return
        }
        
        inputNode.removeTap(onBus: 0)
        audioEngine.stop()
        
        do {
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("Error deactivating audio session: \(error)")
        }
        
        isRecording = false
    }
    
    // MARK: - Audio Processing
    private func processAudioBuffer(_ buffer: AVAudioPCMBuffer) {
        // Convert the buffer to the format needed by WebRTC
        // We need to handle different audio formats
        let data: Data
        
        // commonFormat is not optional, so we can use it directly
        let pcmFormat = buffer.format.commonFormat
        switch pcmFormat {
        case .pcmFormatFloat32:
            if let floatData = buffer.floatChannelData?[0] {
                let floatBufferSize = Int(buffer.frameLength) * MemoryLayout<Float>.size
                data = Data(bytes: floatData, count: floatBufferSize)
            } else {
                return
            }
            
        case .pcmFormatInt16:
            if let int16Data = buffer.int16ChannelData?[0] {
                let int16BufferSize = Int(buffer.frameLength) * MemoryLayout<Int16>.size
                data = Data(bytes: int16Data, count: int16BufferSize)
            } else {
                return
            }
            
        default:
            print("Unsupported audio format: \(pcmFormat)")
            return
        }
        
        // Send data via callback
        onAudioData?(data)
    }
} 