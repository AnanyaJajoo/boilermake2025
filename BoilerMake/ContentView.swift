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
                .navigationTitle("slynk")
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
        ("minecraft_movie", "Minecraft Tickets", "The Minecraft movie brings the game's iconic blocky universe to life, following a group of heroes as they fight to save their world from destruction, capturing the spirit that made Minecraft a global phenomenon. \n https://www.amctheatres.com/movies/a-minecraft-movie-46029"),
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
            
            if label == "Minecraft Tickets" {
                            Link("Buy Movie Tickets Now", destination: URL(string: "https://www.amctheatres.com/movies/a-minecraft-movie-46029")!)
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
        
        // Configure AR session for image tracking
        let config = ARWorldTrackingConfiguration()
        
        // Create reference image programmatically
        // let referenceImage2 = createReferenceImage2()
        // let referenceImageMinecraft = createReferenceImageMinecraft()
        if let referenceImageMinecraft = createReferenceImageMinecraft() {
            config.detectionImages = Set([referenceImageMinecraft])
            config.maximumNumberOfTrackedImages = 1
            print("✅ Reference images created successfully")
        } else {
            print("❌ Failed to create reference image")
        }
        
        // Debug tracking quality
        // arView.debugOptions = [.showWorldOrigin, .showFeaturePoints]
        
        arView.session.run(config)
        arView.session.delegate = context.coordinator
        context.coordinator.arView = arView
        context.coordinator.preloadTexture()
        context.coordinator.preloadTexture2()
        context.coordinator.preloadTextureL()
        context.coordinator.preloadTextureC()
        context.coordinator.preloadTextureMinecraft()
        context.coordinator.preloadTextureM()
        
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
    
    func createReferenceImageMinecraft() -> ARReferenceImage? {
        // Use the image you want to detect
        guard let image = UIImage(named: "minecraft_movie")?.cgImage else {
            print("❌ Failed to load target image")
            return nil
        }
        
        // Set the physical size of the image in meters (adjust as needed)
        let physicalWidth = 0.8  // 20cm wide
        let referenceImage = ARReferenceImage(image, orientation: .up, physicalWidth: physicalWidth)
        referenceImage.name = "minecraft_movie"
        
        return referenceImage
    }
    
    class Coordinator: NSObject, ARSessionDelegate {
        weak var arView: ARView?
        var cachedTexture: TextureResource?
        var player: AVPlayer?
        var player2: AVPlayer?
        var playerL: AVPlayer?
        var playerC: AVPlayer?
        var playerMinecraft: AVPlayer?
        var playerM: AVPlayer?
        var anchors: [UUID: AnchorEntity] = [:]
        @State var speechRecognizer = SpeechRecognizer()
        
        // Properties for object detection and hold gesture
        var longPressStartTime: Date?
        var longPressLocation: CGPoint?
        var loadingIndicator: UIView?
        var boundingBoxView: UIView?
        var holdTimer: Timer?
        var detectedObject: String?
        var isVideoPlaying: Bool = false
        
        // Properties for tracking image anchors going out of frame
        var currentPlayingAnchorID: UUID?
        var outOfFrameTimer: Timer?
        var lastSeenTime: Date?
        
        func preloadTexture() {
            Task {
                do {
                    print("🔄 Preloading overlay texture 'bob'...")
                    // cachedTexture = try await TextureResource.load(named: "bob")
                    let videoURL = Bundle.main.url(forResource: "lebron_1", withExtension: "mp4")
                    
                    

                    do {
                            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                            try AVAudioSession.sharedInstance().setActive(true)
                            } catch {
                                print("Audio session setup failed: \(error)")
                            }
                    print("✅ Overlay texture preloaded successfully")
                    
                    player = AVPlayer(url: videoURL!)
                    player?.isMuted = false
                } catch {
                    print("❌ Failed to preload overlay texture: \(error)")
                    print("Make sure 'bob' image is added to your Assets catalog")
                }
            }
        }
        
        func preloadTexture2() {
            Task {
                do {
                    print("🔄 Preloading overlay texture 'bob'...")
                    // cachedTexture = try await TextureResource.load(named: "bob")
                    let videoURL = Bundle.main.url(forResource: "chanel_1", withExtension: "mp4")
                    

                    do {
                            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                            try AVAudioSession.sharedInstance().setActive(true)
                            } catch {
                                print("Audio session setup failed: \(error)")
                            }
                    print("✅ Overlay texture preloaded successfully")
                    
                    player2 = AVPlayer(url: videoURL!)
                    player2?.isMuted = false
                } catch {
                    print("❌ Failed to preload overlay texture: \(error)")
                    print("Make sure 'bob' image is added to your Assets catalog")
                }
            }
        }
        
        func preloadTextureL() {
            Task {
                do {
                    print("🔄 Preloading overlay texture 'bob'...")
                    // cachedTexture = try await TextureResource.load(named: "bob")
                    let videoURL = Bundle.main.url(forResource: "lebron_2", withExtension: "mp4")
                    

                    do {
                            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                            try AVAudioSession.sharedInstance().setActive(true)
                            } catch {
                                print("Audio session setup failed: \(error)")
                            }
                    print("✅ Overlay texture preloaded successfully")
                    
                    playerL = AVPlayer(url: videoURL!)
                    playerL?.isMuted = false
                } catch {
                    print("❌ Failed to preload overlay texture: \(error)")
                    print("Make sure 'bob' image is added to your Assets catalog")
                }
            }
        }
        
        func preloadTextureC() {
            Task {
                do {
                    print("🔄 Preloading overlay texture 'bob'...")
                    // cachedTexture = try await TextureResource.load(named: "bob")
                    let videoURL = Bundle.main.url(forResource: "chanel_2", withExtension: "mp4")
                    

                    do {
                            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                            try AVAudioSession.sharedInstance().setActive(true)
                            } catch {
                                print("Audio session setup failed: \(error)")
                            }
                    print("✅ Overlay texture preloaded successfully")
                    
                    playerC = AVPlayer(url: videoURL!)
                    playerC?.isMuted = false
                } catch {
                    print("❌ Failed to preload overlay texture: \(error)")
                    print("Make sure 'bob' image is added to your Assets catalog")
                }
            }
        }
        
        func preloadTextureMinecraft() {
            Task {
                do {
                    print("🔄 Preloading overlay texture for minecraft movie...")
                    let videoURL = Bundle.main.url(forResource: "minecraft_movie_0", withExtension: "mp4")
                    
                    do {
                        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                        try AVAudioSession.sharedInstance().setActive(true)
                    } catch {
                        print("Audio session setup failed: \(error)")
                    }
                    print("✅ Minecraft movie overlay texture preloaded successfully")
                    
                    playerMinecraft = AVPlayer(url: videoURL!)
                    playerMinecraft?.isMuted = false
                } catch {
                    print("❌ Failed to preload minecraft movie overlay texture: \(error)")
                }
            }
        }
        
        func preloadTextureM() {
            Task {
                do {
                    print("🔄 Preloading overlay texture 'minecraft_movie_1'...")
                    let videoURL = Bundle.main.url(forResource: "minecraft_movie_1", withExtension: "mp4")
                    

                    do {
                            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                            try AVAudioSession.sharedInstance().setActive(true)
                            } catch {
                                print("Audio session setup failed: \(error)")
                            }
                    print("✅ Overlay texture minecraft_movie_1 preloaded successfully")
                    
                    playerM = AVPlayer(url: videoURL!)
                    playerM?.isMuted = false
                } catch {
                    print("❌ Failed to preload overlay texture minecraft_movie_1: \(error)")
                }
            }
        }
        
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
                    
                    // If out of view for more than 2 seconds, terminate the experience
                    if timeGone > 2.0 {
                        print("Anchor out of view for more than 2 seconds - terminating experience")
                        DispatchQueue.main.async {
                            self.cleanupAR()
                            // Optional: provide feedback that experience was terminated
                            self.vibrate(style: .medium)
                        }
                    }
                }
            }
        }
        
        private func isAnchorVisible(anchorID: UUID) -> Bool {
            guard let arView = arView,
                  let frame = arView.session.currentFrame else {
                return false
            }
            
            // Check if the specific anchor is still being tracked
            for anchor in frame.anchors {
                if anchor.identifier == anchorID {
                    if let imageAnchor = anchor as? ARImageAnchor {
                        return imageAnchor.isTracked
                    }
                }
            }
            
            return false
        }
        
        private func findImageAnchorInView(at point: CGPoint) -> ARImageAnchor? {
            guard let arView = arView,
                  let frame = arView.session.currentFrame else { return nil }
            
            // First try a direct hit test on image anchors
            if let result = arView.hitTest(point, types: .existingPlaneUsingExtent).first,
               let imageAnchorHit = findNearestImageAnchor(to: result.worldTransform.columns.3) {
                return imageAnchorHit
            }
            
            // If no hit, do a ray cast and search more broadly
            let results = arView.raycast(from: point, allowing: .estimatedPlane, alignment: .any)
            if let result = results.first,
               let imageAnchorRay = findNearestImageAnchor(to: result.worldTransform.columns.3) {
                return imageAnchorRay
            }
            
            // If still no hit, check if any image anchor is visible in the current frame
            // This allows for more lenient detection
            for anchor in frame.anchors {
                if let imageAnchor = anchor as? ARImageAnchor {
                    // Check if the anchor is currently being tracked
                    if imageAnchor.isTracked {
                        // Project the anchor position to screen coordinates
                        let anchorPosition = imageAnchor.transform.columns.3
                        if let projectedPoint = projectPoint(anchorPosition, in: arView),
                           distanceBetween(projectedPoint, point) < 300 { // Higher tolerance (300 points)
                            return imageAnchor
                        }
                    }
                }
            }
            
            return nil
        }
        
        private func projectPoint(_ point: SIMD4<Float>, in view: ARView) -> CGPoint? {
            // Use ARKit's projection method directly instead of manual calculation
            guard let camera = view.session.currentFrame?.camera else { return nil }
            
            // Project the 3D world point to 2D screen space
            let screenPos = view.project(SIMD3<Float>(point.x, point.y, point.z))
            
            // Check if projection was successful
            guard let screenPosition = screenPos else { return nil }
            
            return CGPoint(x: CGFloat(screenPosition.x), y: CGFloat(screenPosition.y))
        }
        
        private func distanceBetween(_ point1: CGPoint, _ point2: CGPoint) -> CGFloat {
            return hypot(point1.x - point2.x, point1.y - point2.y)
        }
        
        private func findNearestImageAnchor(to position: SIMD4<Float>) -> ARImageAnchor? {
            guard let arView = arView else { return nil }
            
            var nearestAnchor: ARImageAnchor? = nil
            var minDistance: Float = 1.0 // Increased from 0.5 to 1.0 meter for more tolerance
            
            for anchor in arView.session.currentFrame?.anchors ?? [] {
                if let imageAnchor = anchor as? ARImageAnchor {
                    let anchorPosition = imageAnchor.transform.columns.3
                    let distance = simd_distance(
                        SIMD3(position.x, position.y, position.z),
                        SIMD3(anchorPosition.x, anchorPosition.y, anchorPosition.z)
                    )
                    
                    if distance < minDistance {
                        minDistance = distance
                        nearestAnchor = imageAnchor
                    }
                }
            }
            
            return nearestAnchor
        }
        
        private func showBoundingBox(atLocation location: CGPoint, forObject object: String) {
            DispatchQueue.main.async {
                // Remove existing views
                self.boundingBoxView?.removeFromSuperview()
                self.loadingIndicator?.removeFromSuperview()
                
                // Create bounding box
                let boxSize: CGFloat = 200
                let boundingBox = UIView(frame: CGRect(x: location.x - boxSize/2, y: location.y - boxSize/2, width: boxSize, height: boxSize))
                boundingBox.layer.borderColor = UIColor.green.cgColor
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
                
                // Add circular progress view
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
        
        private func updateBoundingBoxPosition(_ location: CGPoint) {
            DispatchQueue.main.async {
                if let boundingBox = self.boundingBoxView {
                    boundingBox.center = location
                }
            }
        }
        
        private func updateLoadingProgress(_ progress: Float) {
            DispatchQueue.main.async {
                if let progressView = self.loadingIndicator as? UIProgressView {
                    progressView.progress = progress
                }
            }
        }
        
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
        
        private func vibrate(style: UIImpactFeedbackGenerator.FeedbackStyle) {
            let generator = UIImpactFeedbackGenerator(style: style)
            generator.prepare()
            generator.impactOccurred()
        }
        
        func cleanupAR() {
            print("Cleaning up AR resources...")
            
            // Reset video players - need to pause and reset
            player?.pause()
            player?.replaceCurrentItem(with: nil)
            player = nil
            
            player2?.pause()
            player2?.replaceCurrentItem(with: nil)
            player2 = nil
            
            playerL?.pause()
            playerL?.replaceCurrentItem(with: nil)
            playerL = nil
            
            playerC?.pause()
            playerC?.replaceCurrentItem(with: nil)
            playerC = nil
            
            playerMinecraft?.pause()
            playerMinecraft?.replaceCurrentItem(with: nil)
            playerMinecraft = nil
            
            playerM?.pause()
            playerM?.replaceCurrentItem(with: nil)
            playerM = nil
            
            // Remove observers to prevent memory leaks
            NotificationCenter.default.removeObserver(self)
            
            // Remove all AR anchors from the scene
            if let arView = arView {
                for (_, anchorEntity) in anchors {
                    arView.scene.removeAnchor(anchorEntity)
                }
                anchors.removeAll()
            }
            
            // Stop out-of-frame tracking
            outOfFrameTimer?.invalidate()
            outOfFrameTimer = nil
            currentPlayingAnchorID = nil
            lastSeenTime = nil
            
            isVideoPlaying = false
            
            // Reset audio session more gently with better error handling
            do {
                print("Attempting to reset audio session...")
                
                // First deactivate without throwing errors
                if AVAudioSession.sharedInstance().isOtherAudioPlaying {
                    print("Other audio is playing, being careful with session")
                }
                
                // Try a more gentle approach
                try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
                
                // Short delay to let system adjust
                usleep(10000) // 10ms delay
                
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                try AVAudioSession.sharedInstance().setActive(true)
                print("Audio session reset successfully")
            } catch {
                print("Audio session warning (non-critical): \(error.localizedDescription)")
                // Continue despite error, as this is non-critical
            }
            
            // Preload video players to be ready for next detection
            // preloadTexture()
            // preloadTexture2()
            // preloadTextureL()
            // preloadTextureC()
            // preloadTextureMinecraft()
            // preloadTextureM()
            
            print("AR cleanup complete")
        }
        
        private func holdCompleted() {
            guard let object = detectedObject, !isVideoPlaying else { return }
            
            // Flash the bounding box to indicate success
            DispatchQueue.main.async {
                UIView.animate(withDuration: 0.2, animations: {
                    self.boundingBoxView?.backgroundColor = UIColor.green.withAlphaComponent(0.3)
                }) { _ in
                    UIView.animate(withDuration: 0.2, animations: {
                        self.boundingBoxView?.backgroundColor = UIColor.clear
                    }) { _ in
                        // Remove the bounding box and indicator
                        self.boundingBoxView?.removeFromSuperview()
                        self.boundingBoxView = nil
                        self.loadingIndicator?.removeFromSuperview()
                        self.loadingIndicator = nil
                        
                        // Trigger the appropriate video based on the object
                        self.playVideoForObject(object)
                    }
                }
            }
        }
        
        private func waitForUserResponseThenPlayNextVideo(imageEntity: ModelEntity, videoType: String) {
            print("First video finished - Listening for user response...")
            Task { @MainActor in
                speechRecognizer.startTranscribing()
            }
            
            // Set up silence detection
            var lastTranscript = ""
            var silenceCounter = 0
            
            // Check for changes in transcript every 1 second
            let silenceTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] timer in
                Task {
                    guard let self = self else { return }
                    let currentTranscript = await self.speechRecognizer.transcript
                    print("Current transcript: \(currentTranscript)")
                    
                    // If transcript hasn't changed, count as silence
                    if currentTranscript == lastTranscript {
                        silenceCounter += 1
                        print("Silence detected for \(silenceCounter) seconds")
                    } else {
                        // Reset counter if new speech detected
                        silenceCounter = 0
                        lastTranscript = currentTranscript
                    }
                    
                    // After 2 seconds of silence, play the next video
                    if silenceCounter >= 2 {
                        print("No new speech for 4 seconds - playing follow-up video")
                        Task { @MainActor in
                            self.speechRecognizer.stopTranscribing()
                        }
                        timer.invalidate()
                        
                        // Print final transcript
                        print("USER RESPONSE: \(currentTranscript)")
                        
                        // Properly configure audio session for video playback
                        do {
                            // More gentle approach to audio session handling
                            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                            try AVAudioSession.sharedInstance().setActive(true)
                            print("Audio session properly configured for video playback")
                        } catch {
                            print("Audio session configuration failed: \(error)")
                        }
                        
                        // Play second video based on videoType
                        if videoType == "lebron" {
                            // Pause first player
                            self.player?.pause()
                            
                            if let videoURL2 = Bundle.main.url(forResource: "lebron_2", withExtension: "mp4") {
                                self.playerL = AVPlayer(url: videoURL2)
                                self.playerL?.volume = 1.0
                                self.playerL?.isMuted = false
                                
                                var videoMaterial = VideoMaterial(avPlayer: self.playerL!)
                                imageEntity.model?.materials = [videoMaterial]
                                print("Playing next lebron video")
                                
                                Task { @MainActor in
                                    // Ensure player has proper audio settings
                                    self.playerL!.isMuted = false
                                    self.playerL!.volume = 1.0
                                    
                                    // Configure audio session inside the task with better error handling
                                    do {
                                        // First deactivate any existing session gently
                                        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
                                        
                                        // Short delay to let system adjust
                                        usleep(10000) // 10ms delay
                                        
                                        // Set up for playback with higher volume
                                        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                                        try AVAudioSession.sharedInstance().setActive(true)
                                        print("Audio configured successfully for Lebron follow-up")
                                    } catch {
                                        print("Audio config warning for Lebron (non-critical): \(error.localizedDescription)")
                                        // Continue despite error as this is non-critical
                                    }
                                    
                                    self.playerL!.seek(to: .zero)
                                    self.playerL!.play()
                                    print("Now playing Lebron follow-up video with volume: \(self.playerL!.volume)")
                                    
                                    // Start final speech recognition after second video finishes
                                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                                                          object: self.playerL!.currentItem,
                                                                          queue: .main) { [weak self] _ in
                                        print("Second Lebron video finished - Starting final transcription")
                                        guard let self = self else { return }
                                        self.startFinalSpeechRecognition()
                                    }
                                }
                            }
                        } else if videoType == "chanel" {
                            // Pause first player
                            self.player2?.pause()
                            
                            if let videoURL2 = Bundle.main.url(forResource: "chanel_2", withExtension: "mp4") {
                                self.playerC = AVPlayer(url: videoURL2)
                                self.playerC?.volume = 1.0
                                self.playerC?.isMuted = false
                                
                                var videoMaterial = VideoMaterial(avPlayer: self.playerC!)
                                imageEntity.model?.materials = [videoMaterial]
                                print("Playing next chanel video")
                                
                                Task { @MainActor in
                                    // Ensure player has proper audio settings
                                    self.playerC!.isMuted = false
                                    self.playerC!.volume = 1.0
                                    
                                    // Configure audio session inside the task with better error handling
                                    do {
                                        // First deactivate any existing session gently
                                        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
                                        
                                        // Short delay to let system adjust
                                        usleep(10000) // 10ms delay
                                        
                                        // Set up for playback with higher volume
                                        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                                        try AVAudioSession.sharedInstance().setActive(true)
                                        print("Audio configured successfully for Chanel follow-up")
                                    } catch {
                                        print("Audio config warning for Chanel (non-critical): \(error.localizedDescription)")
                                        // Continue despite error as this is non-critical
                                    }
                                    
                                    self.playerC!.seek(to: .zero)
                                    self.playerC!.play()
                                    print("Now playing Chanel follow-up video with volume: \(self.playerC!.volume)")
                                    
                                    // Start final speech recognition after second video finishes
                                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                                                          object: self.playerC!.currentItem,
                                                                          queue: .main) { [weak self] _ in
                                        print("Second Chanel video finished - Starting final transcription")
                                        guard let self = self else { return }
                                        self.startFinalSpeechRecognition()
                                    }
                                }
                            }
                        } else if videoType == "minecraft_movie" {
                            // Pause first player
                            self.playerMinecraft?.pause()
                            
                            if let videoURL2 = Bundle.main.url(forResource: "minecraft_movie_1", withExtension: "mp4") {
                                self.playerM = AVPlayer(url: videoURL2)
                                self.playerM?.volume = 1.0
                                self.playerM?.isMuted = false
                                
                                var videoMaterial = VideoMaterial(avPlayer: self.playerM!)
                                imageEntity.model?.materials = [videoMaterial]
                                print("Playing next minecraft video")
                                
                                Task { @MainActor in
                                    // Ensure player has proper audio settings
                                    self.playerM!.isMuted = false
                                    self.playerM!.volume = 1.0
                                    
                                    // Configure audio session inside the task with better error handling
                                    do {
                                        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
                                        usleep(10000) // 10ms delay
                                        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                                        try AVAudioSession.sharedInstance().setActive(true)
                                        print("Audio configured successfully for Minecraft follow-up")
                                    } catch {
                                        print("Audio config warning for Minecraft (non-critical): \(error.localizedDescription)")
                                    }
                                    
                                    self.playerM!.seek(to: .zero)
                                    self.playerM!.play()
                                    print("Now playing Minecraft follow-up video with volume: \(self.playerM!.volume)")
                                    
                                    // Start final speech recognition after second video finishes
                                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                                                          object: self.playerM!.currentItem,
                                                                          queue: .main) { [weak self] _ in
                                        print("Second Minecraft video finished - Starting final transcription")
                                        guard let self = self else { return }
                                        self.startFinalSpeechRecognition()
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        private func startFinalSpeechRecognition() {
            print("Final video finished - Starting final transcription...")
            Task { @MainActor in
                speechRecognizer.startTranscribing()
            }
            
            // Set up silence detection
            var lastTranscript = ""
            var silenceCounter = 0
            
            // Check for changes in transcript every 2 seconds
            let silenceTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] timer in
                Task {
                    guard let self = self else { return }
                    let currentTranscript = await self.speechRecognizer.transcript
                    print("Current transcript: \(currentTranscript)")
                    
                    // If transcript hasn't changed, count as silence
                    if currentTranscript == lastTranscript {
                        silenceCounter += 1
                        print("Silence detected for \(silenceCounter * 2) seconds")
                    } else {
                        // Reset counter if new speech detected
                        silenceCounter = 0
                        lastTranscript = currentTranscript
                    }
                    
                    // After 2 seconds of silence, stop transcribing and clean up
                    if silenceCounter >= 2 {
                        print("No new speech for 2 seconds - stopping transcription")
                        Task { @MainActor in
                            self.speechRecognizer.stopTranscribing()
                        }
                        timer.invalidate()
                        
                        // Print final transcript and reset video playing flag
                        print("FINAL TRANSCRIPT: \(currentTranscript)")
                        self.isVideoPlaying = false
                        
                        // Clean up any remaining UI elements
                        DispatchQueue.main.async {
                            self.boundingBoxView?.removeFromSuperview()
                            self.boundingBoxView = nil
                            self.loadingIndicator?.removeFromSuperview()
                            self.loadingIndicator = nil
                            
                            // Clean up all AR resources
                            self.cleanupAR()
                        }
                    }
                }
            }
        }
        
        private func playVideoForObject(_ objectName: String) {
            // Don't play if already playing
            if isVideoPlaying {
                return
            }
            
            // First clean up any existing AR content
            cleanupAR()
            isVideoPlaying = true
            
            // Find the corresponding image anchor
            guard let arView = arView,
                  let imageAnchor = arView.session.currentFrame?.anchors.first(where: {
                      ($0 as? ARImageAnchor)?.name == objectName
                  }) as? ARImageAnchor else {
                isVideoPlaying = false
                return
            }
            
            // Create overlay with detected image dimensions
            let physicalWidth = Float(imageAnchor.referenceImage.physicalSize.width)
            let physicalHeight = Float(imageAnchor.referenceImage.physicalSize.height)
            
            let planeMesh = MeshResource.generatePlane(width: physicalWidth, height: physicalHeight)
            let imageEntity = ModelEntity(mesh: planeMesh)
            
            let anchorEntity = AnchorEntity(anchor: imageAnchor)
            anchorEntity.addChild(imageEntity)
            print("Player Playing")
            imageEntity.position.z = 0.001
            imageEntity.setPosition(SIMD3(0, 0, 0), relativeTo: anchorEntity)
            imageEntity.setOrientation(simd_quatf(angle: -.pi / 2, axis: [1, 0, 0]), relativeTo: anchorEntity)
            
            DispatchQueue.main.async {
                print("➕ Adding overlay to scene")
                self.arView?.scene.addAnchor(anchorEntity)
                self.anchors[imageAnchor.identifier] = anchorEntity
                
                // Start tracking this anchor going out of frame
                self.currentPlayingAnchorID = imageAnchor.identifier
                self.lastSeenTime = Date()
                self.startOutOfFrameTracking()
            }
            
            // Ensure audio session is properly configured before playing
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                try AVAudioSession.sharedInstance().setActive(true, options: .notifyOthersOnDeactivation)
                // Note: setOutputVolume is not available in public API
                // Using explicit volume setting on AVPlayer instead
            } catch {
                print("Failed to configure audio session: \(error)")
            }
            
            if objectName == "lebronboy" {
                print("Lebron Boy Detected")
                
                // Recreate the player instead of reusing to avoid audio issues
                if let videoURL = Bundle.main.url(forResource: "lebron_1", withExtension: "mp4") {
                    player = AVPlayer(url: videoURL)
                    player?.volume = 1.0 // Ensure volume is at maximum
                    
                    var videoMaterial = VideoMaterial(avPlayer: player!)
                    imageEntity.model?.materials = [videoMaterial]
                    player!.seek(to: .zero)
                    player!.play()
                    
                    // Set up a notification to detect when the first video finishes
                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                                          object: player!.currentItem,
                                                          queue: .main) { [weak self] _ in
                        print("First Lebron video finished playing naturally")
                        guard let self = self else { return }
                        
                        // Start speech recognition after the first video
                        self.waitForUserResponseThenPlayNextVideo(imageEntity: imageEntity,
                                                                videoType: "lebron")
                    }
                }
            }  else if objectName == "minecraft_movie" {
                print("Minecraft Movie Detected")
                
                if let videoURL = Bundle.main.url(forResource: "minecraft_movie_0", withExtension: "mp4") {
                    playerMinecraft = AVPlayer(url: videoURL)
                    playerMinecraft?.volume = 1.0
                    
                    var videoMaterial = VideoMaterial(avPlayer: playerMinecraft!)
                    imageEntity.model?.materials = [videoMaterial]
                    playerMinecraft!.seek(to: .zero)
                    playerMinecraft!.play()
                    
                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                                          object: playerMinecraft!.currentItem,
                                                          queue: .main) { [weak self] _ in
                        print("First Minecraft video finished playing naturally")
                        guard let self = self else { return }
                        
                        self.waitForUserResponseThenPlayNextVideo(imageEntity: imageEntity,
                                                                videoType: "minecraft_movie")
                    }
                }
            } else {
                print("Detected Chanel")
                
                // Recreate the player instead of reusing to avoid audio issues
                if let videoURL = Bundle.main.url(forResource: "chanel_1", withExtension: "mp4") {
                    player2 = AVPlayer(url: videoURL)
                    player2?.volume = 1.0 // Ensure volume is at maximum
                    
                    var videoMaterial = VideoMaterial(avPlayer: player2!)
                    imageEntity.model?.materials = [videoMaterial]
                    player2!.seek(to: .zero)
                    player2!.play()
                    
                    // Set up a notification to detect when the first video finishes
                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                                          object: player2!.currentItem,
                                                          queue: .main) { [weak self] _ in
                        print("First Chanel video finished playing naturally")
                        guard let self = self else { return }
                        
                        // Start speech recognition after the first video
                        self.waitForUserResponseThenPlayNextVideo(imageEntity: imageEntity,
                                                                videoType: "chanel")
                    }
                }
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
                
                // Try to detect an object at the touch location
                if let imageAnchor = findImageAnchorInView(at: longPressLocation!) {
                    detectedObject = imageAnchor.name
                    showBoundingBox(atLocation: longPressLocation!, forObject: detectedObject!)
                    startHoldTimer()
                }
                
            case .changed:
                // Update the loading indicator position if user moves finger slightly
                if let location = longPressLocation, let object = detectedObject {
                    let newLocation = gesture.location(in: arView)
                    // Only update if the movement is significant but not too large (to avoid losing the object)
                    let distance = hypot(newLocation.x - location.x, newLocation.y - location.y)
                    if distance < 50 { // Allow small movements without canceling
                        updateBoundingBoxPosition(newLocation)
                    } else {
                        // Cancel if movement too large
                        cancelHoldGesture()
                    }
                }
                
            case .ended, .cancelled, .failed:
                // User stopped pressing before completion
                cancelHoldGesture()
                
            default:
                break
            }
        }
        
        @MainActor func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
            for anchor in anchors {
                guard let imageAnchor = anchor as? ARImageAnchor else {
                    print("⚠️ Non-image anchor detected")
                    continue
                }
                
                print("✅ Reference image detected: \(imageAnchor.name ?? "unnamed")")
                // We don't immediately play videos now - they are triggered by the hold gesture
            }
        }
        
        @MainActor func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
            // This is called when anchors are updated (including tracking state changes)
            if let currentID = currentPlayingAnchorID, isVideoPlaying {
                // Refresh the visible state of the current playing anchor
                let isVisible = isAnchorVisible(anchorID: currentID)
                if isVisible {
                    lastSeenTime = Date()
                }
            }
        }
        
        func session(_ session: ARSession, didFailWithError error: Error) {
            print("❌ AR Session failed: \(error)")
        }
        
        func session(_ session: ARSession, cameraDidChangeTrackingState camera: ARCamera) {
            print("📱 Camera tracking state: \(camera.trackingState)")
        }
    }
}
