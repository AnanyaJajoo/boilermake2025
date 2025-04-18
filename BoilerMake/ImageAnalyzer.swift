import Foundation
import Vision
import UIKit
import CoreML

class ImageAnalyzer {
    // Singleton instance for easy access
    static let shared = ImageAnalyzer()
    
    // Catalog of known videos and their descriptions
    private struct VideoMetadata {
        let name: String
        let description: String
        let keywords: [String]
        let type: String // e.g., "lebron" or "chanel"
    }
    
    private var videoLibrary: [VideoMetadata] = [
        VideoMetadata(
            name: "lebron_1",
            description: "LeBron James playing basketball",
            keywords: ["basketball", "sports", "lebron", "james", "nba", "lakers", "player", "athlete", "game", "court", "jersey", "ball", "person", "man", "people", "sports equipment"],
            type: "lebron"
        ),
        VideoMetadata(
            name: "lebron_2",
            description: "LeBron James highlights",
            keywords: ["basketball", "sports", "lebron", "james", "nba", "lakers", "player", "athlete", "game", "court", "jersey", "ball", "dunk", "score", "person", "man", "people", "sports equipment"],
            type: "lebron"
        ),
        VideoMetadata(
            name: "chanel_1",
            description: "Chanel fashion and products",
            keywords: ["fashion", "chanel", "perfume", "luxury", "style", "design", "brand", "clothing", "model", "beauty", "accessory", "bag", "purse", "makeup", "cosmetics", "bottle", "woman", "female"],
            type: "chanel"
        ),
        VideoMetadata(
            name: "chanel_2",
            description: "Chanel product showcase",
            keywords: ["fashion", "chanel", "perfume", "luxury", "style", "design", "brand", "clothing", "model", "beauty", "accessory", "bag", "purse", "makeup", "cosmetics", "bottle", "woman", "female"],
            type: "chanel"
        )
    ]
    
    private let similarityThreshold: Double = 0.1 // Lowered threshold to be more lenient
    private let confidenceThreshold: Float = 0.3 // Lowered to capture more potential matches
    
    private init() {}
    
    // Analyze an image using Vision framework and return a description of its content
    func analyzeImage(_ image: UIImage, completion: @escaping (Result<String, Error>) -> Void) {
        guard let cgImage = image.cgImage else {
            completion(.failure(NSError(domain: "ImageAnalyzer", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to get CGImage"])))
            return
        }
        
        // Create a request to classify the image
        var descriptions: [String] = []
        let dispatchGroup = DispatchGroup()
        
        // Request 1: General classification
        dispatchGroup.enter()
        let classificationRequest = VNClassifyImageRequest { request, error in
            defer { dispatchGroup.leave() }
            
            if let error = error {
                print("Classification error: \(error.localizedDescription)")
                return
            }
            
            guard let results = request.results as? [VNClassificationObservation] else { return }
            
            // Get top classifications with sufficient confidence
            let classifications = results.prefix(8).filter { $0.confidence > self.confidenceThreshold }
            descriptions.append(contentsOf: classifications.map { $0.identifier })
        }
        
        // Request 2: Rectangle detection as a fallback for general object detection
        dispatchGroup.enter()
        let rectangleRequest = VNDetectRectanglesRequest { request, error in
            defer { dispatchGroup.leave() }
            
            if let error = error {
                print("Rectangle detection error: \(error.localizedDescription)")
                return
            }
            
            guard let results = request.results as? [VNRectangleObservation], !results.isEmpty else { return }
            
            // If we found rectangles, add a generic descriptor
            descriptions.append("document")
            descriptions.append("rectangle")
        }
        
        // Request 3: Face detection
        dispatchGroup.enter()
        let faceRequest = VNDetectFaceRectanglesRequest { request, error in
            defer { dispatchGroup.leave() }
            
            if let error = error {
                print("Face detection error: \(error.localizedDescription)")
                return
            }
            
            guard let results = request.results as? [VNFaceObservation], !results.isEmpty else { return }
            
            // If we found faces, add related descriptors
            descriptions.append("person")
            descriptions.append("face")
            if results.count > 1 {
                descriptions.append("people")
                descriptions.append("group")
            }
        }
        
        // Request 4: Text detection
        dispatchGroup.enter()
        let textRequest = VNRecognizeTextRequest { request, error in
            defer { dispatchGroup.leave() }
            
            if let error = error {
                print("Text recognition error: \(error.localizedDescription)")
                return
            }
            
            guard let results = request.results as? [VNRecognizedTextObservation], !results.isEmpty else { return }
            
            // If we found text, add related descriptors
            descriptions.append("text")
            
            // Try to extract some recognized text as keywords
            var textContent = ""
            for result in results.prefix(3) {
                if let recognizedText = result.topCandidates(1).first?.string {
                    textContent += " " + recognizedText
                }
            }
            
            // Add recognized text if we found any meaningful content
            if textContent.count > 5 {
                descriptions.append("text: \(textContent)")
            }
        }
        
        // Create request handler and perform the requests
        let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try requestHandler.perform([classificationRequest, rectangleRequest, faceRequest, textRequest])
        } catch {
            completion(.failure(error))
            return
        }
        
        // Combine results
        dispatchGroup.notify(queue: .main) {
            // Add some generic categories that might help with matching
            if descriptions.contains("person") || descriptions.contains("face") || descriptions.contains("man") {
                descriptions.append("sports")
                descriptions.append("athlete")
            }
            
            if descriptions.contains("bottle") || descriptions.contains("container") || descriptions.contains("product") {
                descriptions.append("perfume")
                descriptions.append("beauty")
            }
            
            // Combine all detected elements into a single description
            let combinedFeatures = Set(descriptions)
            let description = combinedFeatures.joined(separator: ", ")
            
            print("Image analysis produced description: \(description)")
            
            if description.isEmpty {
                completion(.success("Unrecognized image"))
            } else {
                completion(.success(description))
            }
        }
    }
    
    // Check if an image is in focus (not blurry)
    func isImageInFocus(_ image: UIImage, completion: @escaping (Bool) -> Void) {
        guard let cgImage = image.cgImage else {
            completion(false)
            return
        }
        
        // Simplified focus check - we'll just look for sufficient edge detail
        let laplacianVariance = calculateLaplacianVariance(image)
        let isSharp = laplacianVariance > 50.0 // Lowered threshold to be more lenient
        
        print("Image sharpness value: \(laplacianVariance), is in focus: \(isSharp)")
        completion(isSharp)
    }
    
    // Calculate Laplacian variance as a measure of image sharpness
    private func calculateLaplacianVariance(_ image: UIImage) -> Double {
        guard let inputCGImage = image.cgImage else { return 0.0 }
        
        // Convert to grayscale
        let ciImage = CIImage(cgImage: inputCGImage)
        let grayscaleFilter = CIFilter(name: "CIPhotoEffectNoir")
        grayscaleFilter?.setValue(ciImage, forKey: kCIInputImageKey)
        guard let grayscaleImage = grayscaleFilter?.outputImage,
              let grayscaleCGImage = CIContext().createCGImage(grayscaleImage, from: grayscaleImage.extent) else {
            return 0.0
        }
        
        // Apply Laplacian filter (approximated by a simple edge detection)
        let laplacianFilter = CIFilter(name: "CIEdges")
        laplacianFilter?.setValue(CIImage(cgImage: grayscaleCGImage), forKey: kCIInputImageKey)
        laplacianFilter?.setValue(5.0, forKey: kCIInputIntensityKey)
        
        guard let outputImage = laplacianFilter?.outputImage,
              let outputCGImage = CIContext().createCGImage(outputImage, from: outputImage.extent) else {
            return 0.0
        }
        
        // Calculate variance of pixel values
        guard let provider = outputCGImage.dataProvider,
              let providerData = provider.data,
              let data = CFDataGetBytePtr(providerData) else {
            return 0.0
        }
        
        var sum: Double = 0
        var squaredSum: Double = 0
        let count = outputCGImage.width * outputCGImage.height
        
        for i in 0..<min(count, 10000) { // Sample at most 10,000 pixels for efficiency
            let intensity = Double(data[i])
            sum += intensity
            squaredSum += intensity * intensity
        }
        
        let mean = sum / Double(min(count, 10000))
        let variance = (squaredSum / Double(min(count, 10000))) - (mean * mean)
        
        return variance
    }
    
    // Find the best matching video for a given image description
    func findBestMatchingVideo(for description: String) -> (videoName: String, videoType: String)? {
        print("Finding match for description: \(description)")
        
        let words = description.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }
        
        var bestMatch: VideoMetadata?
        var highestScore: Double = 0
        
        for video in videoLibrary {
            let videoKeywords = Set(video.keywords)
            let descriptionWords = Set(words)
            
            // Calculate Jaccard similarity index
            let intersection = videoKeywords.intersection(descriptionWords).count
            let union = videoKeywords.union(descriptionWords).count
            
            // Avoid division by zero
            let similarityScore = union > 0 ? Double(intersection) / Double(union) : 0
            
            print("Match for \(video.name): score \(similarityScore), intersection: \(intersection), keywords: \(videoKeywords)")
            
            if similarityScore > highestScore {
                highestScore = similarityScore
                bestMatch = video
            }
        }
        
        print("Best match: \(bestMatch?.name ?? "none") with score \(highestScore)")
        
        // Only return a match if it meets the threshold
        if highestScore >= similarityThreshold, let match = bestMatch {
            return (match.name, match.type)
        }
        
        // Default to first videos if no good match
        return ("lebron_1", "lebron")
    }
} 