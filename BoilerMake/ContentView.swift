import SwiftUI
import RealityKit
import ARKit
import UIKit
//import TranscriptionKit

struct ContentView: View {
    @State private var isLandingPageActive = true
    @State private var isMenuExpanded = false
    @State private var isARActive = true
    @State private var language: String = "English"
    @State private var userName: String = ""
    
    
    var body: some View {
        ZStack {
            if isLandingPageActive {
                LandingPage()
                    .transition(.opacity)
            } else {
                NavigationStack {
                    ZStack {
                        if isARActive {
                            /*
                            RealityView { content in
                                let anchor = AnchorEntity(.camera)
                                content.add(anchor)
                                content.camera = .spatialTracking
                            }
                            .edgesIgnoringSafeArea(.all)
                            .id(isARActive)
                             */
                            ARViewContainer()
                                .edgesIgnoringSafeArea(.all)
                        }

                        VStack {
                            Spacer()
                            HStack {
                                Spacer()

                                if isMenuExpanded {
                                    VStack(spacing: 12) {
                                        CircleMenuItem(icon: "heart.fill")

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
                }
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                withAnimation {
                    isLandingPageActive = false
                }
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
    @State private var isTapped = false // Track button state

    var body: some View {
        Button(action: {
            isTapped.toggle() // Toggle the state
        }) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .frame(width: 50, height: 50)
                .background(Color.white)
                .foregroundColor(isTapped ? .pink : .blue) // Change color when tapped
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
        let referenceImage2 = createReferenceImage2()
        if let referenceImage = createReferenceImage() {
            config.detectionImages = Set([referenceImage, referenceImage2!])
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
        
        return arView
    }
    
    func updateUIView(_ uiView: ARView, context: Context) {}
    
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
        
        
        @MainActor func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
            for anchor in anchors {
                guard let imageAnchor = anchor as? ARImageAnchor else {
                    print("⚠️ Non-image anchor detected")
                    continue
                }
                
                
                
                print("✅ Reference image detected: \(imageAnchor.name ?? "unnamed")")
                
                // Create overlay with detected image dimensions
                let physicalWidth = Float(imageAnchor.referenceImage.physicalSize.width)
                let physicalHeight = Float(imageAnchor.referenceImage.physicalSize.height)
                
                print("📏 Creating overlay with size: \(physicalWidth)x\(physicalHeight)")
                
                let planeMesh = MeshResource.generatePlane(width: physicalWidth,
                                                         height: physicalHeight)
                
                /*guard let texture = cachedTexture else {
                    print("❌ Overlay texture not preloaded")
                    return
                }*/
                
                let imageEntity = ModelEntity(mesh: planeMesh)
                // var material = UnlitMaterial()
                if (imageAnchor.name == "lebronboy") {
                    print("Lebron Boy Detected")
                    var videoMaterial = VideoMaterial(avPlayer: player!)
                    // material.baseColor = MaterialColorParameter.texture(texture)
                    imageEntity.model?.materials = [videoMaterial]
                    player!.seek(to: .zero)
                    player!.play()
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 12.0) {
                        videoMaterial = VideoMaterial(avPlayer: self.playerL!)
                        imageEntity.model?.materials = [videoMaterial]
                        // Code to play another video here
                        print("Playing next video")
                        // Replace this with your logic for playing another video
                        self.playerL!.seek(to: .zero)
                        self.playerL!.play()
                    }
                }
                else {
                    print("Detected Chanel")
                    var videoMaterial = VideoMaterial(avPlayer: player2!)
                    imageEntity.model?.materials = [videoMaterial]
                    player2?.seek(to: .zero)
                    player2!.play()
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 12.0) {
                        videoMaterial = VideoMaterial(avPlayer: self.playerC!)
                        imageEntity.model?.materials = [videoMaterial]
                        // Code to play another video here
                        print("Playing next video")
                        // Replace this with your logic for playing another video
                        self.playerC!.seek(to: .zero)
                        self.playerC!.play()
                    }
                    
                }
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 20.0) {
                    print("Videos finished - Starting transcription now...")
                    self.speechRecognizer.startTranscribing()
                    
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
                            
                            // After 6 seconds of silence, stop transcribing
                            if silenceCounter >= 3 {
                                print("No new speech for 6 seconds - stopping transcription")
                                self.speechRecognizer.stopTranscribing()
                                timer.invalidate()
                                
                                // Print final transcript
                                print("FINAL TRANSCRIPT: \(currentTranscript)")
                                
                                // Consider adding UI element to display the transcript
                                // or saving it for later use
                            }
                        }
                    }
                }
                
                
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

