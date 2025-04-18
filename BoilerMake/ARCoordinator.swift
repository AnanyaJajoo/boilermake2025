import SwiftUI
import RealityKit
import ARKit
import UIKit
import AVFoundation

// Reference to the ImageAnalyzer class that's defined elsewhere in the project
// No need to redefine it here

class ARCoordinator: NSObject, ARSessionDelegate {
    weak var arView: ARView?
    var cachedTexture: TextureResource?
    var player: AVPlayer?
    var player2: AVPlayer?
    var playerL: AVPlayer?
    var playerC: AVPlayer?
    var anchors: [UUID: AnchorEntity] = [:]
    var speechRecognizer: Any? // Placeholder for SpeechRecognizer
    
    // Properties for gesture and detection
    var longPressStartTime: Date?
    var longPressLocation: CGPoint?
    var loadingIndicator: UIView?
    var boundingBoxView: UIView?
    var holdTimer: Timer?
    var detectedObject: String?
    var isVideoPlaying: Bool = false
    
    var currentPlayingAnchorID: UUID?
    var outOfFrameTimer: Timer?
    var lastSeenTime: Date?
    
    var lastFrameTime: TimeInterval = 0
    let frameAnalysisInterval: TimeInterval = 0.5
    var isAnalyzingFrame: Bool = false
    var currentImageDescription: String?
    
    // Video management properties
    var preloadedVideos = false
    var videoURLs: [String: URL] = [:]
    
    // Callback for when planes are detected
    var onPlaneDetected: ((ARPlaneAnchor) -> Void)?
    
    override init() {
        super.init()
    }
    
    init(onPlaneDetected: ((ARPlaneAnchor) -> Void)? = nil) {
        self.onPlaneDetected = onPlaneDetected
        super.init()
    }
    
    // MARK: - Session delegate methods
    
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        for anchor in anchors {
            if let planeAnchor = anchor as? ARPlaneAnchor, planeAnchor.alignment == .vertical {
                onPlaneDetected?(planeAnchor) // Call back with detected plane
            }
        }
    }
    
    // MARK: - Custom methods
    
    // Called to preload videos
    func preloadAllVideos() {
        print("🔄 Preloading videos placeholder")
        // Implementation would be completed by ContentView
    }
    
    // Cleanup AR resources
    func cleanupAR() {
        print("Cleaning up AR resources...")
        
        // Reset state
        currentImageDescription = nil
        detectedObject = nil
        isVideoPlaying = false
        
        // Remove all notifications
        NotificationCenter.default.removeObserver(self)
        
        // Remove all AR anchors from the scene
        if let arView = arView {
            for (_, anchorEntity) in anchors {
                arView.scene.removeAnchor(anchorEntity)
            }
            anchors.removeAll()
        }
        
        // Stop out-of-frame tracking timer
        outOfFrameTimer?.invalidate()
        outOfFrameTimer = nil
        currentPlayingAnchorID = nil
        lastSeenTime = nil
        
        print("AR cleanup complete")
    }
    
    // Triggered when hold gesture completes
    private func holdCompleted() {
        guard !isVideoPlaying else { return }
        
        // Flash the bounding box to indicate success
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            UIView.animate(withDuration: 0.2, animations: {
                self.boundingBoxView?.backgroundColor = UIColor.green.withAlphaComponent(0.3)
            }) { _ in
                UIView.animate(withDuration: 0.2, animations: {
                    self.boundingBoxView?.backgroundColor = UIColor.clear
                }) { _ in
                    // Remove the UI elements
                    self.boundingBoxView?.removeFromSuperview()
                    self.boundingBoxView = nil
                    self.loadingIndicator?.removeFromSuperview()
                    self.loadingIndicator = nil
                    
                    print("Hold completed, attempting to play video")
                    print("DetectedObject: \(String(describing: self.detectedObject))")
                    print("ImageDescription: \(String(describing: self.currentImageDescription))")
                    
                    // Notify ContentView with the detected object
                    if let objectName = self.detectedObject {
                        print("Detected object: \(objectName)")
                        // This would be handled by ContentView
                    } else {
                        print("⚠️ No object detected to play video for")
                    }
                }
            }
        }
    }
    
    // Start tracking for out-of-frame anchors
    func startOutOfFrameTracking() {
        // Cancel any existing timer
        outOfFrameTimer?.invalidate()
        
        // Create a new timer that checks every 0.5 seconds if the anchor is still visible
        outOfFrameTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            guard let self = self,
                  let currentID = self.currentPlayingAnchorID,
                  self.isVideoPlaying else {
                self?.outOfFrameTimer?.invalidate()
                return
            }
            
            // Check if the anchor is still being tracked
            let isAnchorVisible = self.isAnchorVisible(anchorID: currentID)
            
            if isAnchorVisible {
                // Update the last seen time
                self.lastSeenTime = Date()
            } else if let lastSeen = self.lastSeenTime {
                // Calculate how long the anchor has been out of view
                let timeGone = Date().timeIntervalSince(lastSeen)
                print("Anchor out of view for \(timeGone) seconds")
                
                // If out of view for more than 3 seconds, terminate the experience
                if timeGone > 3.0 {
                    print("Anchor out of view for more than 3 seconds - terminating experience")
                    DispatchQueue.main.async {
                        self.cleanupAR()
                        self.vibrate(style: .medium)
                    }
                }
            }
        }
    }
    
    // Find an image anchor at the given point
    func findImageAnchorInView(at point: CGPoint) -> ARImageAnchor? {
        guard let arView = arView, 
              let frame = arView.session.currentFrame else { return nil }
        
        // First try a direct hit test on image anchors
        let results = arView.hitTest(point, types: [.existingPlaneUsingExtent, .estimatedHorizontalPlane])
        
        // If hit test found something, check if it's near an image anchor
        if let hitResult = results.first {
            // Check if any image anchor is near this hit result
            for anchor in frame.anchors {
                if let imageAnchor = anchor as? ARImageAnchor {
                    // Calculate the distance between the hit point and image anchor
                    let hitPosition = hitResult.worldTransform.columns.3
                    let anchorPosition = imageAnchor.transform.columns.3
                    
                    let distance = simd_distance(
                        SIMD3(hitPosition.x, hitPosition.y, hitPosition.z),
                        SIMD3(anchorPosition.x, anchorPosition.y, anchorPosition.z)
                    )
                    
                    // If close enough (within 0.3 meters), consider it a match
                    if distance < 0.3 && imageAnchor.isTracked {
                        return imageAnchor
                    }
                }
            }
        }
        
        // If no hit test match, try a more lenient approach
        // Check if any image anchor's projected position is near the touch point
        for anchor in frame.anchors {
            if let imageAnchor = anchor as? ARImageAnchor, imageAnchor.isTracked {
                // Convert anchor position to screen space
                let anchorPos = imageAnchor.transform.columns.3
                guard let projectedPoint = arView.project(SIMD3<Float>(anchorPos.x, anchorPos.y, anchorPos.z)) else {
                    continue
                }
                
                // Calculate screen distance
                let distance = hypot(
                    CGFloat(projectedPoint.x) - point.x,
                    CGFloat(projectedPoint.y) - point.y
                )
                
                // If within reasonable distance on screen (200 points), consider it a match
                if distance < 200 {
                    return imageAnchor
                }
            }
        }
        
        return nil
    }
    
    // Display a bounding box with loading indicator
    func showBoundingBox(atLocation location: CGPoint, forObject object: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Remove any existing views
            self.boundingBoxView?.removeFromSuperview()
            self.loadingIndicator?.removeFromSuperview()
            
            // Create bounding box
            let boxSize: CGFloat = 200
            let boundingBox = UIView(frame: CGRect(x: location.x - boxSize/2, y: location.y - boxSize/2, width: boxSize, height: boxSize))
            boundingBox.layer.borderColor = UIColor.blue.cgColor
            boundingBox.layer.borderWidth = 3
            boundingBox.layer.cornerRadius = 10
            boundingBox.backgroundColor = UIColor.clear
            self.arView?.addSubview(boundingBox)
            self.boundingBoxView = boundingBox
            
            // Create loading circle inside the bounding box
            let circleSize: CGFloat = 80
            let circleContainer = UIView(frame: CGRect(x: boxSize/2 - circleSize/2, y: boxSize/2 - circleSize/2, width: circleSize, height: circleSize))
            circleContainer.backgroundColor = UIColor.clear
            boundingBox.addSubview(circleContainer)
            
            // Add progress view
            let progressView = UIProgressView(progressViewStyle: .default)
            progressView.frame = CGRect(x: 0, y: circleSize/2 - 2, width: circleSize, height: 4)
            progressView.progressTintColor = UIColor.blue
            progressView.trackTintColor = UIColor.lightGray.withAlphaComponent(0.5)
            progressView.layer.cornerRadius = 2
            progressView.clipsToBounds = true
            progressView.progress = 0.0
            circleContainer.addSubview(progressView)
            
            self.loadingIndicator = progressView
            
            // Add object label
            let label = UILabel(frame: CGRect(x: 0, y: -30, width: boxSize, height: 25))
            label.text = object
            label.textAlignment = .center
            label.textColor = UIColor.white
            label.backgroundColor = UIColor.black.withAlphaComponent(0.7)
            label.layer.cornerRadius = 5
            label.clipsToBounds = true
            label.font = UIFont.boldSystemFont(ofSize: 14)
            boundingBox.addSubview(label)
        }
    }
    
    // Start timer for hold gesture
    func startHoldTimer() {
        // Cancel any existing timer
        holdTimer?.invalidate()
        
        // Start a new timer that updates every 0.1 seconds
        var progress: Float = 0.0
        holdTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] timer in
            guard let self = self, let startTime = self.longPressStartTime else {
                timer.invalidate()
                return
            }
            
            let holdDuration = Date().timeIntervalSince(startTime)
            progress = Float(min(holdDuration / 2.0, 1.0)) // 2-second hold
            self.updateLoadingProgress(progress)
            
            // Add haptic feedback at specific progress points
            if progress >= 0.25 && progress < 0.3 {
                self.vibrate(style: .light)
            } else if progress >= 0.5 && progress < 0.55 {
                self.vibrate(style: .medium)
            } else if progress >= 0.75 && progress < 0.8 {
                self.vibrate(style: .medium)
            }
            
            // When hold is complete (2 seconds)
            if holdDuration >= 2.0 {
                timer.invalidate()
                self.vibrate(style: .heavy) // Strong vibration on completion
                self.holdCompleted()
            }
        }
    }
    
    // Analyze the current camera frame
    func captureAndAnalyzeCurrentFrame(at location: CGPoint) {
        guard let arView = arView,
              let currentFrame = arView.session.currentFrame else { return }
        
        // Convert AR frame to UIImage
        let pixelBuffer = currentFrame.capturedImage
        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        let context = CIContext()
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return }
        let uiImage = UIImage(cgImage: cgImage)
        
        // Show initial bounding box while analyzing
        showBoundingBox(atLocation: location, forObject: "Analyzing image...")
        
        // First check if image is in focus
        ImageAnalyzer.shared.isImageInFocus(uiImage) { [weak self] isInFocus in
            guard let self = self else { return }
            
            if !isInFocus {
                // Image is too blurry, cancel the operation
                DispatchQueue.main.async {
                    self.updateBoundingBoxLabel("Image too blurry, please try again")
                    
                    // Auto-dismiss after 2 seconds
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        self.cancelHoldGesture()
                    }
                }
                return
            }
            
            // Image is in focus, proceed with analysis
            ImageAnalyzer.shared.analyzeImage(uiImage) { [weak self] result in
                guard let self = self else { return }
                
                switch result {
                case .success(let description):
                    DispatchQueue.main.async {
                        // Update the bounding box with detected content
                        self.detectedObject = description
                        self.updateBoundingBoxLabel(description)
                        self.currentImageDescription = description
                        
                        // Start the hold timer to complete the gesture
                        self.startHoldTimer()
                    }
                    
                case .failure(let error):
                    print("Image analysis error: \(error.localizedDescription)")
                    DispatchQueue.main.async {
                        self.updateBoundingBoxLabel("Could not analyze image")
                        
                        // Auto-dismiss after 2 seconds
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            self.cancelHoldGesture()
                        }
                    }
                }
            }
        }
    }
    
    // Update the position of the bounding box
    func updateBoundingBoxPosition(_ location: CGPoint) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let boundingBox = self.boundingBoxView else { return }
            boundingBox.center = location
        }
    }
    
    // Update the label of the bounding box
    func updateBoundingBoxLabel(_ text: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let boundingBox = self.boundingBoxView else { return }
            
            // Find and update the label
            for subview in boundingBox.subviews {
                if let label = subview as? UILabel {
                    label.text = text
                    break
                }
            }
        }
    }
    
    // Update the progress of the loading indicator
    func updateLoadingProgress(_ progress: Float) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let progressView = self.loadingIndicator as? UIProgressView else { return }
            progressView.progress = progress
        }
    }
    
    // Cancel the hold gesture
    func cancelHoldGesture() {
        holdTimer?.invalidate()
        holdTimer = nil
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            UIView.animate(withDuration: 0.3, animations: {
                self.boundingBoxView?.alpha = 0
                self.loadingIndicator?.alpha = 0
            }) { _ in
                self.boundingBoxView?.removeFromSuperview()
                self.boundingBoxView = nil
                self.loadingIndicator?.removeFromSuperview()
                self.loadingIndicator = nil
            }
        }
        
        longPressStartTime = nil
        longPressLocation = nil
        detectedObject = nil
    }
    
    // Check if an anchor is visible
    func isAnchorVisible(anchorID: UUID) -> Bool {
        guard let arView = arView,
              let frame = arView.session.currentFrame else {
            return false
        }
        
        // Look for the anchor in the current frame
        for anchor in frame.anchors {
            if anchor.identifier == anchorID {
                if let imageAnchor = anchor as? ARImageAnchor {
                    return imageAnchor.isTracked
                } else {
                    // For non-image anchors, use a different approach
                    return isTransformInCameraView(anchor.transform, frame: frame)
                }
            }
        }
        
        return false
    }
    
    // Check if a transform is in the camera view
    func isTransformInCameraView(_ transform: simd_float4x4, frame: ARFrame) -> Bool {
        let cameraPosition = frame.camera.transform.columns.3
        let anchorPosition = transform.columns.3
        
        // Calculate direction vector from camera to anchor
        let direction = simd_normalize(simd_float3(
            anchorPosition.x - cameraPosition.x,
            anchorPosition.y - cameraPosition.y,
            anchorPosition.z - cameraPosition.z
        ))
        
        // Get camera forward vector
        let cameraForward = simd_normalize(simd_float3(
            -frame.camera.transform.columns.2.x,
            -frame.camera.transform.columns.2.y,
            -frame.camera.transform.columns.2.z
        ))
        
        // Calculate dot product to determine if anchor is in front of camera
        let dotProduct = simd_dot(direction, cameraForward)
        
        // If dot product > 0, anchor is in front of camera (angle less than 90 degrees)
        return dotProduct > 0
    }
    
    // Provide haptic feedback
    func vibrate(style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
    }
}
