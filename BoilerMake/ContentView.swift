import SwiftUI
import RealityKit

struct ContentView: View {
    @State private var isLandingPageActive = true // Track if Landing Page is active
    @State private var isMenuExpanded = false
    @State private var isARActive = true
    @State private var language: String = "English"
    @State private var userName: String = ""

    var body: some View {
        ZStack {
            if isLandingPageActive {
                LandingPage()
                    .transition(.opacity) // Smooth fade-out transition after 10 seconds
            } else {
                // Main Content (your original view)
                NavigationStack {
                    ZStack {
                        if isARActive {
                            RealityView { content in
                                let anchor = AnchorEntity(.camera)
                                content.add(anchor)
                                content.camera = .spatialTracking
                            }
                            .edgesIgnoringSafeArea(.all)
                            .id(isARActive)
                        }

                        VStack {
                            Spacer()
                            HStack {
                                Spacer()

                                if isMenuExpanded {
                                    VStack(spacing: 12) {
                                        CircleMenuItem(icon: "heart", action: {
                                            print("heart tapped")
                                        })

                                        NavigationLink {
                                            AppView(isARActive: $isARActive, userName: $userName)
                                        } label: {
                                            Image(systemName: "square")
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
                                            Image(systemName: "circle")
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
            // Set a timer to hide the landing page after 10 seconds
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

struct CircleMenuItem: View {
    var icon: String
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .frame(width: 50, height: 50)
                .background(Color.white)
                .foregroundColor(.blue)
                .clipShape(Circle())
                .shadow(radius: 3)
        }
    }
}
