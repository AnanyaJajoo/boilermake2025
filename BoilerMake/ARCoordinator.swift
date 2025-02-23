import SwiftUI
import RealityKit
import ARKit


class ARCoordinator: NSObject, ARSessionDelegate {
    var onPlaneDetected: ((ARPlaneAnchor) -> Void)?

    init(onPlaneDetected: ((ARPlaneAnchor) -> Void)?) {
        self.onPlaneDetected = onPlaneDetected
    }

    // Detect vertical planes (walls)
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        for anchor in anchors {
            if let planeAnchor = anchor as? ARPlaneAnchor, planeAnchor.alignment == .vertical {
                onPlaneDetected?(planeAnchor) // Call back with detected plane
            }
        }
    }
}
