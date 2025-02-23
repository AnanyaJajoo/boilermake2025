import SwiftUI
import RealityKit

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
    let images = [("freakbob", "FreakBob"), ("slynklogo2", "Slynk Logo 2")] // Image names and labels

    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(images, id: \.0) { imageName, label in
                    NavigationLink(destination: DetailView(imageName: imageName, label: label)) {
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

    var body: some View {
        VStack {
            Image(imageName)
                .resizable()
                .scaledToFit()
                .frame(height: 300)
                .cornerRadius(12)
                .shadow(radius: 6)

            Text(label)
                .font(.title)
                .padding()

            Spacer()
        }
        .padding()
        .navigationTitle(label)
        .navigationBarTitleDisplayMode(.inline)
    }
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

