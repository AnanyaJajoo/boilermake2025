import Foundation
import ARKit
import RealityKit
import UIKit

// Add this helper method to convert UInt64 to UUID
extension UInt64 {
    func toUUID() -> UUID {
        let uuidString = String(format: "%016llx-0000-0000-0000-000000000000", self)
        return UUID(uuidString: uuidString) ?? UUID()
    }
}

// This extension will be used to integrate Simli into the AR experience
extension ARViewContainer.Coordinator {
    
    // Function to add a Simli agent to the AR scene at a specific anchor point
    func addSimliAgent(at anchorPosition: simd_float4x4, apiKey: String, faceId: String = "tmp9i8bbq7c") {
        guard let arView = self.arView else { return }
        
        // Create a container anchor entity
        let anchorEntity = AnchorEntity(world: anchorPosition)
        
        // Create a plane entity to display the Simli agent on
        let planeMesh = MeshResource.generatePlane(width: 0.5, height: 0.5)
        let material = SimpleMaterial(color: .clear, isMetallic: false)
        let planeEntity = ModelEntity(mesh: planeMesh, materials: [material])
        
        // Position the plane correctly (forward facing)
        planeEntity.transform.rotation = simd_quatf(angle: Float.pi, axis: [0, 1, 0])
        
        // Add the plane to the anchor
        anchorEntity.addChild(planeEntity)
        
        // Add the anchor to the scene
        arView.scene.addAnchor(anchorEntity)
        
        // Store the created anchor's ID to manage its lifecycle
        let anchorID = anchorEntity.id.toUUID()
        anchors[anchorID] = anchorEntity
        
        // Create the Simli view in UIKit
        DispatchQueue.main.async {
            // Create a UIView to hold the Simli agent
            let simliContainer = UIView(frame: CGRect(x: 0, y: 0, width: 300, height: 400))
            
            // Create the SimliView
            let simliView = SimliView(frame: simliContainer.bounds, apiKey: apiKey, faceId: faceId)
            simliView.delegate = self
            simliContainer.addSubview(simliView)
            
            // Add the UIView as a subview to the AR view
            arView.addSubview(simliContainer)
            
            // Store reference to the Simli view for later cleanup
            self.simliViews[anchorID] = simliView
            self.simliContainers[anchorID] = simliContainer
            
            // Position the UIView at the AR anchor's position in screen space
            self.updateSimliViewPosition(anchorID: anchorID)
            
            // Connect to Simli service
            simliView.connect()
        }
    }
    
    // Update the position of the Simli view to follow the AR anchor
    func updateSimliViewPosition(anchorID: UUID) {
        guard let arView = self.arView,
              let anchorEntity = anchors[anchorID],
              let simliContainer = simliContainers[anchorID] else {
            return
        }
        
        // Get the world position of the anchor
        let anchorPosition = anchorEntity.transform.matrix.columns.3
        
        // Project the 3D position to 2D screen space
        if let screenPos = arView.project(SIMD3<Float>(anchorPosition.x, anchorPosition.y, anchorPosition.z)) {
            // Position the Simli container view at the projected point
            let x = CGFloat(screenPos.x) - (simliContainer.frame.width / 2)
            let y = CGFloat(screenPos.y) - (simliContainer.frame.height / 2)
            
            simliContainer.frame.origin = CGPoint(x: x, y: y)
        }
    }
    
    // Remove a Simli agent from the AR scene
    func removeSimliAgent(anchorID: UUID) {
        // Remove the Simli view from the UIKit hierarchy
        DispatchQueue.main.async {
            self.simliViews[anchorID]?.disconnect()
            self.simliContainers[anchorID]?.removeFromSuperview()
            self.simliViews.removeValue(forKey: anchorID)
            self.simliContainers.removeValue(forKey: anchorID)
        }
        
        // Remove the anchor from the AR scene
        if let anchorEntity = anchors[anchorID], let arView = self.arView {
            arView.scene.removeAnchor(anchorEntity)
            anchors.removeValue(forKey: anchorID)
        }
    }
    
    // Check if the anchor is visible to the camera
    func isAnchorVisible(anchorID: UUID) -> Bool {
        guard let arView = arView,
              let anchorEntity = anchors[anchorID],
              let frame = arView.session.currentFrame else {
            return false
        }
        
        // Get the position of the anchor
        let anchorPosition = anchorEntity.transform.matrix.columns.3
        
        // Project the anchor position to the screen
        if let screenPos = projectPoint(anchorPosition, in: arView) {
            // Check if the position is within the bounds of the screen
            let isOnScreen = arView.bounds.contains(screenPos)
            
            // Check if the anchor is not too far away (could adjust this threshold)
            let distance = simd_distance(
                SIMD3<Float>(frame.camera.transform.columns.3.x, frame.camera.transform.columns.3.y, frame.camera.transform.columns.3.z),
                SIMD3<Float>(anchorPosition.x, anchorPosition.y, anchorPosition.z)
            )
            
            return isOnScreen && distance < 3.0  // 3 meters max distance
        }
        
        return false
    }
    
    // Start tracking visibility and updating positions
    func startTrackingSimliAgents() {
        // Cancel any existing tracking
        stopTrackingSimliAgents()
        
        // Create a timer to update positions and check visibility
        simliTrackingTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            
            for (anchorID, _) in self.simliViews {
                // Update the position
                self.updateSimliViewPosition(anchorID: anchorID)
                
                // Check visibility
                let isVisible = self.isAnchorVisible(anchorID: anchorID)
                
                // Hide/show container based on visibility
                DispatchQueue.main.async {
                    self.simliContainers[anchorID]?.isHidden = !isVisible
                }
            }
        }
    }
    
    // Stop tracking Simli agents
    func stopTrackingSimliAgents() {
        simliTrackingTimer?.invalidate()
        simliTrackingTimer = nil
    }
    
    // Handle tap on AR view to potentially add a Simli agent
    func handleTapForSimliAgent(_ gesture: UITapGestureRecognizer) {
        guard let arView = arView else { return }
        
        let location = gesture.location(in: arView)
        
        // Perform a hit test
        let results = arView.raycast(from: location, allowing: .estimatedPlane, alignment: .vertical)
        
        if let firstResult = results.first {
            // Get the transform where the ray hit
            let hitTransform = firstResult.worldTransform
            
            // Add Simli agent at this position 
            // Use your API key here
            addSimliAgent(at: hitTransform, apiKey: "7ky8itpin1lornrvtett8d")
            
            // Start tracking positions
            startTrackingSimliAgents()
        }
    }
}

// Dictionary storage for Simli views and containers
extension ARViewContainer.Coordinator {
    // New properties for Simli integration
    var simliViews: [UUID: SimliView] {
        get {
            if let views = objc_getAssociatedObject(self, &AssociatedKeys.simliViews) as? [UUID: SimliView] {
                return views
            }
            let views = [UUID: SimliView]()
            objc_setAssociatedObject(self, &AssociatedKeys.simliViews, views, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            return views
        }
        set {
            objc_setAssociatedObject(self, &AssociatedKeys.simliViews, newValue, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
    
    var simliContainers: [UUID: UIView] {
        get {
            if let containers = objc_getAssociatedObject(self, &AssociatedKeys.simliContainers) as? [UUID: UIView] {
                return containers
            }
            let containers = [UUID: UIView]()
            objc_setAssociatedObject(self, &AssociatedKeys.simliContainers, containers, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            return containers
        }
        set {
            objc_setAssociatedObject(self, &AssociatedKeys.simliContainers, newValue, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
    
    var simliTrackingTimer: Timer? {
        get {
            return objc_getAssociatedObject(self, &AssociatedKeys.simliTrackingTimer) as? Timer
        }
        set {
            objc_setAssociatedObject(self, &AssociatedKeys.simliTrackingTimer, newValue, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
}

// Keys for associated objects
private struct AssociatedKeys {
    static var simliViews = "simliViews"
    static var simliContainers = "simliContainers"
    static var simliTrackingTimer = "simliTrackingTimer"
}

// Conform to SimliViewDelegate
extension ARViewContainer.Coordinator: SimliViewDelegate {
    func simliViewDidConnect(_ simliView: SimliView) {
        print("Simli agent connected successfully")
    }
    
    func simliViewDidDisconnect(_ simliView: SimliView) {
        print("Simli agent disconnected")
        
        // Find and remove the agent that disconnected
        for (anchorID, view) in simliViews {
            if view === simliView {
                removeSimliAgent(anchorID: anchorID)
                break
            }
        }
    }
    
    func simliView(_ simliView: SimliView, didFailWithError error: Error) {
        print("Simli agent connection failed: \(error.localizedDescription)")
    }
} 