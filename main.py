import cv2
import numpy as np
import mediapipe as mp
from PIL import Image
import sys

class FaceSwapper:
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Store previous landmarks for smoothing
        self.prev_landmarks = None
        self.source_landmarks = None
        
        # Indices for face oval
        self.FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                         397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                         172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

    def get_landmarks(self, image):
        # Convert to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(image_rgb)
        
        if not results.multi_face_landmarks:
            return None
            
        face_landmarks = results.multi_face_landmarks[0]
        landmarks = np.array([(int(point.x * image.shape[1]), int(point.y * image.shape[0]))
                            for point in face_landmarks.landmark])
        
        # Apply smoothing if we have previous landmarks
        if self.prev_landmarks is not None:
            alpha = 0.7  # Smoothing factor
            landmarks = alpha * landmarks + (1 - alpha) * self.prev_landmarks
            
        self.prev_landmarks = landmarks.copy()
        return landmarks

    def face_swap(self, source_img, target_img):
        if self.source_landmarks is None:
            self.source_landmarks = self.get_landmarks(source_img)
            if self.source_landmarks is None:
                return target_img
        
        target_landmarks = self.get_landmarks(target_img)
        if target_landmarks is None:
            return target_img

        try:
            # Get face oval points
            source_points = self.source_landmarks[self.FACE_OVAL]
            target_points = target_landmarks[self.FACE_OVAL]

            # Calculate transformation matrix
            M, _ = cv2.findHomography(source_points, target_points)
            
            # Warp source image
            h, w = target_img.shape[:2]
            warped_source = cv2.warpPerspective(source_img, M, (w, h))
            
            # Create mask from target points
            mask = np.zeros((h, w), dtype=np.uint8)
            cv2.fillConvexPoly(mask, target_points.astype(np.int32), 255)
            
            # Feather the mask
            mask = cv2.GaussianBlur(mask, (15, 15), 10)
            
            # Blend images
            mask_3d = mask.reshape(h, w, 1) / 255.0
            output = warped_source * mask_3d + target_img * (1 - mask_3d)
            
            return output.astype(np.uint8)

        except Exception as e:
            return target_img

def main():
    # Initialize face swapper
    swapper = FaceSwapper()
    
    # Capture reference face
    print("Please look at the camera for reference face capture. Press 'c' to capture, 'q' to quit.")
    cap_ref = cv2.VideoCapture(0)
    face_cutout = None

    while face_cutout is None:
        ret, frame = cap_ref.read()
        if not ret:
            print("Failed to capture reference frame.")
            cap_ref.release()
            sys.exit(1)

        cv2.imshow("Reference Face Capture", frame)
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('c'):
            if swapper.get_landmarks(frame) is not None:
                face_cutout = frame.copy()
                print("Reference face captured!")
                break
            else:
                print("No face detected! Please try again.")
        elif key == ord('q'):
            cap_ref.release()
            cv2.destroyAllWindows()
            sys.exit(0)

    cap_ref.release()
    cv2.destroyAllWindows()

    # Start live video feed
    print("Starting face swap... Press 'q' to quit, 'r' to recapture reference.")
    cap = cv2.VideoCapture(1)
    
    # Set camera properties
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Perform face swap
        output = swapper.face_swap(face_cutout, frame)
        
        # Show results
        cv2.imshow("Face Swap", output)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            swapper.source_landmarks = None

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()