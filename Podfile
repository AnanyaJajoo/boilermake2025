# Uncomment the next line to define a global platform for your project
platform :ios, '14.0'

target 'BoilerMake' do
  # Comment the next line if you don't want to use dynamic frameworks
  use_frameworks!

  # Firebase dependencies
  pod 'FirebaseCore'
  pod 'FirebaseAuth'
  pod 'FirebaseFirestore'
  
  # WebRTC dependencies
  pod 'GoogleWebRTC'
  pod 'Starscream', '~> 4.0.0'  # WebSocket library
  
  # Optional: Audio/video processing enhancements
  pod 'HaishinKit', '~> 1.2.0'  # For handling audio/video streams
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
    end
  end
end 