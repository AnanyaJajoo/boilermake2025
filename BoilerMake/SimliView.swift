import UIKit
import AVFoundation

protocol SimliViewDelegate: AnyObject {
    func simliViewDidConnect(_ simliView: SimliView)
    func simliViewDidDisconnect(_ simliView: SimliView)
    func simliView(_ simliView: SimliView, didFailWithError error: Error)
}

class SimliView: UIView {
    // MARK: - Properties
    private var webRTCManager: WebRTCManager?
    private var audioProcessor: AudioProcessor?
    private var videoView: UIView = UIView()
    private var activityIndicator: UIActivityIndicatorView = UIActivityIndicatorView(style: .large)
    private var statusLabel: UILabel = UILabel()
    
    weak var delegate: SimliViewDelegate?
    
    private var apiKey: String
    private var faceId: String
    
    private var isConnected = false
    
    // MARK: - Initialization
    init(frame: CGRect, apiKey: String, faceId: String = "tmp9i8bbq7c") {
        self.apiKey = apiKey
        self.faceId = faceId
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        self.apiKey = ""
        self.faceId = "tmp9i8bbq7c"
        super.init(coder: coder)
        setupViews()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        videoView.frame = bounds
        
        activityIndicator.center = CGPoint(x: bounds.width / 2, y: bounds.height / 2)
        
        statusLabel.frame = CGRect(x: 16, y: bounds.height - 50, width: bounds.width - 32, height: 30)
    }
    
    // MARK: - Setup
    private func setupViews() {
        // Configure video view
        videoView.backgroundColor = .black
        addSubview(videoView)
        
        // Configure activity indicator
        activityIndicator.hidesWhenStopped = true
        activityIndicator.color = .white
        addSubview(activityIndicator)
        
        // Configure status label
        statusLabel.textColor = .white
        statusLabel.textAlignment = .center
        statusLabel.font = UIFont.systemFont(ofSize: 14)
        statusLabel.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        statusLabel.layer.cornerRadius = 8
        statusLabel.clipsToBounds = true
        addSubview(statusLabel)
    }
    
    // MARK: - Public Methods
    func configure(apiKey: String, faceId: String) {
        self.apiKey = apiKey
        self.faceId = faceId
    }
    
    func connect() {
        guard !isConnected else { return }
        
        activityIndicator.startAnimating()
        updateStatus("Connecting...")
        
        // Initialize WebRTC manager
        webRTCManager = WebRTCManager(apiKey: apiKey, faceId: faceId)
        
        // Initialize audio processor
        audioProcessor = AudioProcessor()
        audioProcessor?.onAudioData = { [weak self] audioData in
            self?.webRTCManager?.sendAudioData(audioData)
        }
        
        // Connect WebRTC
        webRTCManager?.connect(videoView: videoView) { [weak self] success, error in
            guard let self = self else { return }
            
            DispatchQueue.main.async {
                self.activityIndicator.stopAnimating()
                
                if success {
                    self.isConnected = true
                    self.updateStatus("Connected")
                    self.startAudioCapture()
                    self.delegate?.simliViewDidConnect(self)
                } else {
                    if let error = error {
                        self.updateStatus("Connection failed")
                        self.delegate?.simliView(self, didFailWithError: error)
                    }
                }
            }
        }
    }
    
    func disconnect() {
        guard isConnected else { return }
        
        stopAudioCapture()
        webRTCManager?.disconnect()
        webRTCManager = nil
        
        isConnected = false
        updateStatus("Disconnected")
        delegate?.simliViewDidDisconnect(self)
    }
    
    // MARK: - Audio Handling
    private func startAudioCapture() {
        // Request microphone permission before starting
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            guard let self = self else { return }
            
            DispatchQueue.main.async {
                if granted {
                    let success = self.audioProcessor?.startRecording() ?? false
                    if !success {
                        self.updateStatus("Failed to start audio capture")
                    }
                } else {
                    self.updateStatus("Microphone access denied")
                    let error = NSError(domain: "SimliView", code: 2, userInfo: [NSLocalizedDescriptionKey: "Microphone access denied"])
                    self.delegate?.simliView(self, didFailWithError: error)
                }
            }
        }
    }
    
    private func stopAudioCapture() {
        audioProcessor?.stopRecording()
    }
    
    // MARK: - UI Updates
    private func updateStatus(_ status: String) {
        statusLabel.text = status
    }
} 