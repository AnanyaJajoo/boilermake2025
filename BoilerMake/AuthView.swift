//
//  AuthView.swift
//  BoilerMake
//
//  Created by Ananya Jajoo on 4/16/25.
//

import UIKit
import SwiftUI
import FirebaseCore
import FirebaseAuth
import GoogleSignIn
import GoogleSignInSwift

struct AuthView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isLogin = true
    @State private var errorMessage = ""
    @AppStorage("isAuthenticated") var isAuthenticated = false

    var body: some View {
        ZStack {
            // 🌸 Gradient background
            LinearGradient(
                gradient: Gradient(colors: [Color.pink, Color.white]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer()

                // 🧾 Heading
                Text(isLogin ? "Slynk" : "Slynk")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)

                VStack(alignment: .leading, spacing: 10) {
                    if !isLogin {
                        Text("NAME")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))

                        TextField("", text: .constant(""))
                            .padding()
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(12)
                    }

                    Text("EMAIL")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))

                    TextField("", text: $email)
                        .padding()
                        .background(Color.white.opacity(0.9))
                        .cornerRadius(12)

                    Text("PASSWORD")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))

                    SecureField("", text: $password)
                        .padding()
                        .background(Color.white.opacity(0.9))
                        .cornerRadius(12)
                }

                // 🔐 Main Sign Up / Login Button
                Button(action: {
                    isLogin ? login() : signUp()
                }) {
                    Text(isLogin ? "Log In" : "Sign Up")
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.pink.opacity(0.8), Color.pink]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }

                Button(action: {
                    handleGoogleSignIn()
                }) {
                    HStack {
                        Image("new_google") // Your Google "G" logo asset
                            .resizable()
                            .frame(width: 20, height: 20)
                        Text("Sign in with Google")
                            .foregroundColor(.black)
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.15), radius: 5, x: 0, y: 4)
                }

                // 🔁 Mode switch
                Button {
                    isLogin.toggle()
                    errorMessage = ""
                } label: {
                    Text(isLogin ? "Create a new account" : "Already have an account? Log in")
                        .foregroundColor(.white.opacity(0.8))
                        .fontWeight(.bold)
                }

                if !errorMessage.isEmpty {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Spacer()
            }
            .padding()
            .frame(maxWidth: 350)
        }
    }


    func login() {
        Auth.auth().signIn(withEmail: email, password: password) { result, error in
            if let error = error {
                errorMessage = error.localizedDescription
            } else {
                print("✅ Logged in as \(result?.user.email ?? "")")
                isAuthenticated = true
                // Add transition to ContentView here if needed
            }
        }
    }

    func signUp() {
        Auth.auth().createUser(withEmail: email, password: password) { result, error in
            if let error = error {
                errorMessage = error.localizedDescription
            } else {
                print("✅ Signed up as \(result?.user.email ?? "")")
                isAuthenticated = true

                // Add transition to ContentView here if needed
            }
        }
    }
    func handleGoogleSignIn() {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            print("❌ Could not get root view controller")
            return
        }

        GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController) { signInResult, error in
            if let error = error {
                print("❌ Google sign-in error: \(error.localizedDescription)")
                return
            }

            guard
                let user = signInResult?.user,
                let idToken = user.idToken?.tokenString
            else {
                print("❌ Missing Google credentials")
                return
            }
            let accessToken = user.accessToken.tokenString

            let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: accessToken)

            Auth.auth().signIn(with: credential) { result, error in
                if let error = error {
                    print("❌ Firebase sign-in error: \(error.localizedDescription)")
                } else {
                    print("✅ Signed in with Google: \(result?.user.email ?? "")")
                    isAuthenticated = true
                }
            }
        }
    }
}
