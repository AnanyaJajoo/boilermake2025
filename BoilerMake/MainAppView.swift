import SwiftUI
import FirebaseAuth

struct MainAppView: View {
    @AppStorage("isAuthenticated") var isAuthenticated = false
    @State private var firebaseUser: User? = Auth.auth().currentUser
    @State private var isLandingPageActive = true

    var body: some View {
        ZStack {
            if isLandingPageActive {
                LandingPage()
            } else {
                if isAuthenticated && firebaseUser != nil {
                    ContentView()
                } else {
                    AuthView()
                }
            }
        }
        .onAppear {
            // Listen for login/logout
            Auth.auth().addStateDidChangeListener { _, user in
                self.firebaseUser = user
                self.isAuthenticated = (user != nil)
            }

            // Show landing page briefly
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                withAnimation {
                    isLandingPageActive = false
                }
            }
        }
    }
}
