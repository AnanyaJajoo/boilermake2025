import SwiftUI
import RealityKit
import ARKit
import UIKit
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
//import TranscriptionKit

struct ContentView: View {
    @State private var isMenuExpanded = false
        @State private var isARActive = true
        @State private var language: String = "English"
        @State private var userName: String = ""
        @AppStorage("isAuthenticated") var isAuthenticated = false

        var body: some View {
            NavigationStack {
                ZStack {
                    if isARActive {
                        ARViewContainer()
                            .edgesIgnoringSafeArea(.all)
                    }

                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            if isMenuExpanded {
                                VStack(spacing: 12) {
                                    CircleMenuItem(icon: "heart.fill") {
                                        saveAdToFirebase()
                                    }


                                    NavigationLink {
                                        GridView()
                                    } label: {
                                        Image(systemName: "archivebox.fill")
                                            .font(.system(size: 20))
                                            .frame(width: 50, height: 50)
                                            .background(Color.white)
                                            .foregroundColor(.blue)
                                            .clipShape(Circle())
                                            .shadow(radius: 3)
                                    }

                                    NavigationLink {
                                        Setting(isARActive: $isARActive, language: $language, userName: $userName)
                                    } label: {
                                        Image(systemName: "gearshape.fill")
                                            .font(.system(size: 20))
                                            .frame(width: 50, height: 50)
                                            .background(Color.white)
                                            .foregroundColor(.blue)
                                            .clipShape(Circle())
                                            .shadow(radius: 3)
                                    }
                                }
                                .transition(.scale)
                            }

                            Button(action: {
                                withAnimation {
                                    isMenuExpanded.toggle()
                                }
                            }) {
                                Image(systemName: isMenuExpanded ? "xmark" : "plus")
                                    .font(.system(size: 24, weight: .bold))
                                    .frame(width: 60, height: 60)
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .clipShape(Circle())
                                    .shadow(radius: 5)
                            }
                            .padding()
                        }
                    }
                }
                .navigationTitle("Main App")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: {
                            do {
                                try Auth.auth().signOut()
                                isAuthenticated = false
                                print("👋 Signed out")
                            } catch {
                                print("❌ Sign out failed: \(error.localizedDescription)")
                            }
                        }) {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                .foregroundColor(.pink)
                        }
                    }
                }

            }
        }
    func saveAdToFirebase() {
        guard let user = Auth.auth().currentUser else {
            print("❌ No user is signed in.")
            return
        }

        let db = Firestore.firestore()
        let adData: [String: Any] = [
            "title": "Lakers Tickets",
            "description": "LeBron James and the Lakers dominate the NBA...",
            "timestamp": Timestamp()
        ]

        db.collection("users")
            .document(user.uid)
            .collection("saved_ads")
            .addDocument(data: adData) { error in
                if let error = error {
                    print("❌ Failed to save ad: \(error.localizedDescription)")
                } else {
                    print("✅ Ad saved to Firestore!")
                }
            }
    }

}

struct LandingPage: View {
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            VStack {
                Spacer()
                Image("Slynklogo")
                    .resizable()
                    .scaledToFit()
                    .padding()
                    .frame(width: 400, height: 400) // Made dimensions larger to be more visible
                
                
                Spacer()
            }
        }
    }
}

struct AppView: View {
    @Binding var isARActive: Bool
    @Binding var userName: String

    var body: some View {
        Color.white
            .edgesIgnoringSafeArea(.all)
            .navigationTitle(userName.isEmpty ? "Saved Items" : "\(userName)'s Saved Items")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                isARActive = false
            }
            .onDisappear {
                isARActive = true
            }
    }
}

struct Setting: View {
    @Binding var isARActive: Bool
    @Binding var language: String
    @Binding var userName: String

    let languages = ["English", "Español", "中文", "हिंदी"]

    let greetings: [String: String] = [
        "English": "Hello",
        "Español": "Hola",
        "中文": "你好",
        "हिंदी": "नमस्ते"
    ]

    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            Text("Enter your name:")
            TextField("Enter your name", text: $userName)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding()
                .frame(width: 250)
                .background(Color(.systemGray6))
                .cornerRadius(8)

            if !userName.isEmpty {
                Text("\(greetings[language] ?? "Hello"), \(userName)!")
                    .font(.headline)
                    .foregroundColor(.blue)
            }

            Text("Selected Language: \(language)")
                .font(.headline)

            ForEach(languages, id: \.self) { lang in
                Button(action: {
                    language = lang
                }) {
                    Text(lang)
                        .frame(width: 150, height: 40)
                        .background(language == lang ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }

            Spacer()
        }
        .padding()
        .background(Color.white)
        .edgesIgnoringSafeArea(.all)
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            isARActive = false
        }
        .onDisappear {
            isARActive = true
        }
    }
}

struct GridView: View {
    let images = [
        ("lebronboy", "Lakers Tickets", "The Los Angeles Lakers are a historic NBA team with 17 championships. LeBron James, a four-time NBA champion, joined the team in 2018 and led them to the 2020 title, further cementing his legacy as one of the greatest players of all time."),
        ("chanel", "Chanel No. 5", "Chanel No. 5 has a luxurious, powdery floral scent with notes of jasmine, rose, and ylang-ylang, enhanced by aldehydes for a soft, airy feel, and a warm, woody vanilla base.")
    ];  // Image names, labels, and descriptions

    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(images, id: \.0) { imageName, label, description in
                    NavigationLink(destination: DetailView(imageName: imageName, label: label, description: description)) {
                        VStack {
                            Image(imageName)
                                .resizable()
                                .scaledToFit()
                                .frame(height: 150)
                                .cornerRadius(8)
                                .overlay(RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray, lineWidth: 2)) // Box outline
                                .shadow(radius: 4)

                            Text(label)
                                .font(.headline)
                                .foregroundColor(.black)
                        }
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(radius: 5)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Saved Files")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DetailView: View {
    let imageName: String
    let label: String
    let description: String

    var body: some View {
        VStack {
            Text(label)
                .font(.title)
                .padding()

            Image(imageName)
                .resizable()
                .scaledToFit()
                .frame(height: 300)
                . cornerRadius(12)
                .shadow(radius: 6)

            Text(description)
                .font(.body)
                .padding()
                .multilineTextAlignment(.center)
            
            if label == "Chanel No. 5" {
                            Link("Visit the Chanel website", destination: URL(string: "https://www.chanel.com/us/fragrance/women/c/7x1x1x30/n5/")!)
                                .font(.body)
                                .padding()
                                .foregroundColor(.blue)
                                .underline()
                        }

            Spacer()
        }
        .padding()
        .navigationBarTitleDisplayMode(.inline)
    }
}

func addLinks(to text: String) -> AttributedString {
        var attributedString = AttributedString(text)

        // Regex pattern to find URLs
        let pattern = "(https?://[a-zA-Z0-9./?=_-]+)"
        if let regex = try? NSRegularExpression(pattern: pattern, options: []) {
            let matches = regex.matches(in: text, options: [], range: NSRange(text.startIndex..., in: text))
            
            for match in matches {
                if let range = Range(match.range, in: text) {
                    let urlString = String(text[range])
                    if let url = URL(string: urlString) {
                        // Use the correct range for AttributedString
                        if let attributedRange = attributedString.range(of: urlString) {
                            attributedString[attributedRange].link = url
                        }
                    }
                }
            }
        }
        
        return attributedString
    }


struct CircleMenuItem: View {
    var icon: String
    var action: () -> Void
    @State private var isTapped = false

    var body: some View {
        Button(action: {
            isTapped.toggle()
            action()
        }) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .frame(width: 50, height: 50)
                .background(Color.white)
                .foregroundColor(isTapped ? .pink : .blue)
                .clipShape(Circle())
                .shadow(radius: 3)
        }
    }
}


struct ARViewContainer: UIViewRepresentable {
    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)
        
        // Configure AR session for image tracking and general scene understanding
        let config = ARWorldTrackingConfiguration()
        
        // Create reference image programmatically
        let referenceImage2 = createReferenceImage2()
        if let referenceImage = createReferenceImage() {
            config.detectionImages = Set([referenceImage, referenceImage2!])
            config.maximumNumberOfTrackedImages = 1
            print("✅ Reference images created successfully")
        } else {
            print("❌ Failed to create reference image")
        }
        
        // Disable frameSemantics that could be causing resource issues
        // config.frameSemantics = [.personSegmentation, .sceneDepth]
        
        // Debug tracking quality
        // arView.debugOptions = [.showWorldOrigin, .showFeaturePoints]
        
        // Set up session delegate
        arView.session.delegate = context.coordinator
        arView.session.run(config, options: [.resetTracking, .removeExistingAnchors])
        context.coordinator.arView = arView
        
        // Preload all video resources
        context.coordinator.preloadAllVideos()
        
        // Add tap gesture recognizer
        let tapGesture = UILongPressGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleLongPress(_:)))
        tapGesture.minimumPressDuration = 0.01 // Make it react quickly to begin tracking long press
        arView.addGestureRecognizer(tapGesture)
        
        return arView
    }
    
    func updateUIView(_ uiView: ARView, context: Context) {
        // This is called when view updates, including when it disappears
    }
    
    static func dismantleUIView(_ uiView: ARView, coordinator: Coordinator) {
        // Clean up resources when view disappears
        coordinator.cleanupAR()
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    // Create reference image programmatically
    func createReferenceImage() -> ARReferenceImage? {
        // Use the image you want to detect
        guard let image = UIImage(named: "lebronboy")?.cgImage else {
            print("❌ Failed to load target image")
            return nil
        }
        
        // Set the physical size of the image in meters (adjust as needed)
        let physicalWidth = 0.8  // 20cm wide
        let referenceImage = ARReferenceImage(image, orientation: .up, physicalWidth: physicalWidth)
        referenceImage.name = "lebronboy"
        
        return referenceImage
    }
    
    func createReferenceImage2() -> ARReferenceImage? {
        // Use the image you want to detect
        guard let image = UIImage(named: "chanel")?.cgImage else {
            print("❌ Failed to load target image")
            return nil
        }
        
        // Set the physical size of the image in meters (adjust as needed)
        let physicalWidth = 0.8  // 20cm wide
        let referenceImage = ARReferenceImage(image, orientation: .up, physicalWidth: physicalWidth)
        referenceImage.name = "chanel"
        
        return referenceImage
    }
    
    class Coordinator: NSObject, ARSessionDelegate {
        weak var arView: ARView?
        var cachedTexture: TextureResource?
        var player: AVPlayer?
        var player2: AVPlayer?
        var playerL: AVPlayer?
        var playerC: AVPlayer?
        var anchors: [UUID: AnchorEntity] = [:]
        @State var speechRecognizer = SpeechRecognizer()
        
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
        
        // New properties to help with video management
        var preloadedVideos = false
        var videoURLs: [String: URL] = [:]
        
        // Called once when the ARView is created
        func preloadAllVideos() {
            print("🔄 Preloading all videos...")
            
            // Store video URLs for quick access
            let videoNames = ["lebron_1", "lebron_2", "chanel_1", "chanel_2"]
            for name in videoNames {
                if let url = Bundle.main.url(forResource: name, withExtension: "mp4") {
                    print("✅ Found URL for \(name)")
                    
                    // Create initial player instances
                    switch name {
                    case "lebron_1":
                        player = AVPlayer(url: url)
                    case "lebron_2":
                        playerL = AVPlayer(url: url)
                    case "chanel_1":
                        player2 = AVPlayer(url: url)
                    case "chanel_2":
                        playerC = AVPlayer(url: url)
                    default:
                        break
                    }
                } else {
                    print("❌ Failed to find URL for \(name)")
                }
            }
            
            // Configure audio session
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                try AVAudioSession.sharedInstance().setActive(true)
            } catch {
                print("Audio session setup failed: \(error)")
            }
            
            print("✅ Video players initialized")
        }
        
        // Simplify preloadTexture and use it only for initializing the first player
        func preloadTexture() {
            // Just in case this method is called directly
            preloadAllVideos()
        }
        
        // Update the other preload methods to do nothing since we're initializing everything at once
        func preloadTexture2() {}
        func preloadTextureL() {}
        func preloadTextureC() {}
        
        // Update to make sure holdCompleted actually triggers video playback
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
                        
                        // Reference images have priority
                        if let objectName = self.detectedObject, objectName == "lebronboy" || objectName == "chanel" {
                            print("Playing video for reference image: \(objectName)")
                            self.playVideoForObject(objectName)
                        } 
                        // Use image analysis for other images
                        else if let _ = self.currentImageDescription {
                            // For simplicity, just play a default video
                            print("Playing default video for analyzed image")
                            self.playVideoForObject("lebronboy")
                        } else {
                            print("⚠️ No object detected to play video for")
                        }
                    }
                }
            }
        }
        
        // Update the playVideoForObject method to fix video display issues
        private func playVideoForObject(_ objectName: String) {
            print("Attempting to play video for reference image: \(objectName)")
            
            // Don't play if already playing
            if isVideoPlaying {
                print("⚠️ Already playing a video")
                return
            }
            
            // Set playing flag immediately to prevent multiple triggers
            isVideoPlaying = true
            
            // Find the corresponding image anchor
            guard let arView = arView,
                  let imageAnchor = arView.session.currentFrame?.anchors.first(where: { 
                      ($0 as? ARImageAnchor)?.name == objectName 
                  }) as? ARImageAnchor else {
                print("❌ Could not find image anchor for \(objectName)")
                isVideoPlaying = false
                return
            }
            
            print("✅ Found image anchor for \(objectName)")
            
            // Create a plane with dimensions matching the detected image
            let physicalWidth = Float(imageAnchor.referenceImage.physicalSize.width)
            let physicalHeight = Float(imageAnchor.referenceImage.physicalSize.height)
            
            let planeMesh = MeshResource.generatePlane(width: physicalWidth, height: physicalHeight)
            let videoEntity = ModelEntity(mesh: planeMesh)
            
            // Create a placeholder material until the video loads
            var placeholderMaterial = SimpleMaterial()
            placeholderMaterial.color = .init(tint: .blue.withAlphaComponent(0.3))
            videoEntity.model?.materials = [placeholderMaterial]
            
            // Create and add anchor entity
            let anchorEntity = AnchorEntity(anchor: imageAnchor)
            anchorEntity.addChild(videoEntity)
            
            // Position the plane just above the detected image
            videoEntity.position.z = 0.001
            
            print("➕ Adding anchor to AR scene")
            arView.scene.addAnchor(anchorEntity)
            anchors[imageAnchor.identifier] = anchorEntity
            
            // Set up tracking
            currentPlayingAnchorID = imageAnchor.identifier
            lastSeenTime = Date()
            startOutOfFrameTracking()
            
            // Determine which video to play (first video)
            let videoName = objectName == "lebronboy" ? "lebron_1" : "chanel_1"
            
            // Create a new AVPlayer with explicit URL
            guard let videoURL = Bundle.main.url(forResource: videoName, withExtension: "mp4") else {
                print("❌ Could not find video file: \(videoName).mp4")
                isVideoPlaying = false
                return
            }
            
            print("🎬 Creating player for \(videoName).mp4")
            let player = AVPlayer(url: videoURL)
            
            // Configure audio session
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                try AVAudioSession.sharedInstance().setActive(true)
            } catch {
                print("⚠️ Audio session setup error: \(error.localizedDescription)")
            }
            
            // Set up video material and play on main thread
            DispatchQueue.main.async {
                // Create video material
                let videoMaterial = VideoMaterial(avPlayer: player)
                videoEntity.model?.materials = [videoMaterial]
                
                // Configure player
                player.volume = 1.0
                player.isMuted = false
                player.seek(to: .zero)
                
                // Start playback
                print("▶️ Playing video: \(videoName)")
                player.play()
                
                // Store player reference
                if objectName == "lebronboy" {
                    self.player = player
                } else {
                    self.player2 = player
                }
                
                // Set up notification for video completion
                NotificationCenter.default.addObserver(
                    forName: .AVPlayerItemDidPlayToEndTime,
                    object: player.currentItem,
                    queue: .main) { [weak self] _ in
                        print("✅ First video finished playing")
                        guard let self = self else { return }
                        
                        // Start speech recognition/next video
                        let videoType = objectName == "lebronboy" ? "lebron" : "chanel"
                        self.playSecondVideo(imageEntity: videoEntity, videoType: videoType)
                    }
            }
        }
        
        // Add a new method to directly play the second video without speech recognition
        private func playSecondVideo(imageEntity: ModelEntity, videoType: String) {
            print("Playing second video for \(videoType)")
            
            // Get the appropriate video name and URL
            let videoName = videoType == "lebron" ? "lebron_2" : "chanel_2"
            
            guard let videoURL = Bundle.main.url(forResource: videoName, withExtension: "mp4") else {
                print("❌ Could not find second video: \(videoName).mp4")
                isVideoPlaying = false
                return
            }
            
            // Create a new player
            let player = AVPlayer(url: videoURL)
            
            // Configure on main thread
            DispatchQueue.main.async {
                // Apply video material
                let videoMaterial = VideoMaterial(avPlayer: player)
                imageEntity.model?.materials = [videoMaterial]
                
                // Configure player
                player.volume = 1.0
                player.isMuted = false
                player.seek(to: .zero)
                
                // Start playback
                print("▶️ Playing second video: \(videoName)")
                player.play()
                
                // Store player reference
                if videoType == "lebron" {
                    self.playerL = player
                } else {
                    self.playerC = player
                }
                
                // Set up notification for video completion
                NotificationCenter.default.addObserver(
                    forName: .AVPlayerItemDidPlayToEndTime,
                    object: player.currentItem,
                    queue: .main) { [weak self] _ in
                        print("✅ Second video finished playing")
                        self?.isVideoPlaying = false
                        self?.cleanupAR()
                    }
            }
        }
        
        // Update the cleanupAR method to properly release resources
        func cleanupAR() {
            print("Cleaning up AR resources...")
            
            // Reset state
            currentImageDescription = nil
            detectedObject = nil
            isVideoPlaying = false
            
            // Pause video players
            player?.pause()
            player?.replaceCurrentItem(with: nil)
            
            player2?.pause()
            player2?.replaceCurrentItem(with: nil)
            
            playerL?.pause()
            playerL?.replaceCurrentItem(with: nil)
            
            playerC?.pause()
            playerC?.replaceCurrentItem(with: nil)
            
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
            
            // Reset audio session
            do {
                print("Resetting audio session...")
                try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
                usleep(10000) // 10ms delay
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                try AVAudioSession.sharedInstance().setActive(true)
            } catch {
                print("Audio session warning: \(error.localizedDescription)")
            }
            
            // Force memory cleanup to address frame retention
            autoreleasepool {
                // Only reset and restart the session if we have a view
                if let arView = arView {
                    // Pause the session first
                    arView.session.pause()
                    
                    // Create a new configuration, preserving reference images
                    let config = ARWorldTrackingConfiguration()
                    if let existingConfig = arView.session.configuration as? ARWorldTrackingConfiguration,
                       let detectionImages = existingConfig.detectionImages {
                        config.detectionImages = detectionImages
                        config.maximumNumberOfTrackedImages = 1
                    }
                    
                    // Run with reset options after a short delay to ensure resources are released
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        arView.session.run(config, options: [.resetTracking, .removeExistingAnchors])
                    }
                }
            }
            
            print("AR cleanup complete")
        }
        
        // Update to improve frame handling
        @MainActor func session(_ session: ARSession, didUpdate frame: ARFrame) {
            // Process inside autoreleasepool to immediately release resources
            autoreleasepool {
                // Only process what we absolutely need from the frame
                if let currentID = currentPlayingAnchorID, isVideoPlaying {
                    var isVisible = false
                    
                    // Check if the anchor is still being tracked
                    for anchor in frame.anchors {
                        if anchor.identifier == currentID {
                            if let imageAnchor = anchor as? ARImageAnchor {
                                isVisible = imageAnchor.isTracked
                            } else {
                                // For normal anchors, just check if it exists
                                isVisible = true
                            }
                            break
                        }
                    }
                    
                    // Update last seen time if visible
                    if isVisible {
                        lastSeenTime = Date()
                    }
                }
                
                // Explicitly release any references to the frame or its properties
                frame.anchors.forEach { _ = $0 }
            }
            
            // Limit frame processing frequency to reduce memory pressure
            let currentTime = CACurrentMediaTime()
            if currentTime - lastFrameTime > 0.5 { // Only process every 0.5 seconds
                lastFrameTime = currentTime
            }
        }
        
        @objc func handleLongPress(_ gesture: UILongPressGestureRecognizer) {
            guard let arView = arView else { return }
            
            switch gesture.state {
            case .began:
                // User started pressing
                longPressStartTime = Date()
                longPressLocation = gesture.location(in: arView)
                detectedObject = nil
                
                // First check for reference images
                if let imageAnchor = findImageAnchorInView(at: longPressLocation!) {
                    detectedObject = imageAnchor.name
                    print("Found reference image: \(String(describing: detectedObject))")
                    showBoundingBox(atLocation: longPressLocation!, forObject: detectedObject!)
                    startHoldTimer()
                } else {
                    // Otherwise analyze camera frame
                    print("No reference image found, analyzing current frame")
                    captureAndAnalyzeCurrentFrame(at: longPressLocation!)
                }
                
            // Keep existing code for other cases
            case .changed:
                if let location = longPressLocation, let object = detectedObject {
                    let newLocation = gesture.location(in: arView)
                    let distance = hypot(newLocation.x - location.x, newLocation.y - location.y)
                    if distance < 50 {
                        updateBoundingBoxPosition(newLocation)
                    } else {
                        cancelHoldGesture()
                    }
                }
                
            case .ended, .cancelled, .failed:
                cancelHoldGesture()
                
            default:
                break
            }
        }
        
        // Check if an anchor is visible
        private func isAnchorVisible(anchorID: UUID) -> Bool {
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
        private func isTransformInCameraView(_ transform: simd_float4x4, frame: ARFrame) -> Bool {
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
        private func vibrate(style: UIImpactFeedbackGenerator.FeedbackStyle) {
            let generator = UIImpactFeedbackGenerator(style: style)
            generator.prepare()
            generator.impactOccurred()
        }
        
        // Start tracking for out-of-frame anchors
        private func startOutOfFrameTracking() {
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
        private func findImageAnchorInView(at point: CGPoint) -> ARImageAnchor? {
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
        private func showBoundingBox(atLocation location: CGPoint, forObject object: String) {
            DispatchQueue.main.async {
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
        private func startHoldTimer() {
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
        private func captureAndAnalyzeCurrentFrame(at location: CGPoint) {
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
        private func updateBoundingBoxPosition(_ location: CGPoint) {
            DispatchQueue.main.async {
                if let boundingBox = self.boundingBoxView {
                    boundingBox.center = location
                }
            }
        }
        
        // Update the label of the bounding box
        private func updateBoundingBoxLabel(_ text: String) {
            DispatchQueue.main.async {
                if let boundingBox = self.boundingBoxView {
                    // Find and update the label
                    for subview in boundingBox.subviews {
                        if let label = subview as? UILabel {
                            label.text = text
                            break
                        }
                    }
                }
            }
        }
        
        // Update the progress of the loading indicator
        private func updateLoadingProgress(_ progress: Float) {
            DispatchQueue.main.async {
                if let progressView = self.loadingIndicator as? UIProgressView {
                    progressView.progress = progress
                }
            }
        }
        
        // Cancel the hold gesture
        private func cancelHoldGesture() {
            holdTimer?.invalidate()
            holdTimer = nil
            
            DispatchQueue.main.async {
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
    }
}
