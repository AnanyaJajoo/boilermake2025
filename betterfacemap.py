#!/usr/bin/env python
import cv2
import numpy as np
from PIL import Image
import torch

# ----- Configuration Variables -----
VIDEO_PATH = "/Users/robertzhang/Documents/GitHub/boilermake2025/input.mp4"
DETECTION_PROMPT = "person"  # Remove the period
REPLACEMENT_PROMPT = "red yoga ball"  # Remove the period

# Update these paths to match your actual paths
GROUNDING_DINO_CONFIG = "/Users/robertzhang/Documents/GitHub/boilermake2025/GroundingDINO/groundingdino/config/GroundingDINO_SwinT_OGC.py"
GROUNDING_DINO_CHECKPOINT = "/Users/robertzhang/Documents/GitHub/boilermake2025/GroundingDINO/weights/groundingdino_swint_ogc.pth"
SAM_CHECKPOINT = "/Users/robertzhang/Documents/GitHub/boilermake2025/sam_vit_h_4b8939.pth"

# ----- Object Detection (using Grounding DINO) -----
# Note: Install and set up Grounding DINO and update the paths below.
from groundingdino.util.inference import load_model, predict
from torchvision import transforms

def load_detection_model(device):
    # Update these paths to your Grounding DINO config and checkpoint.
    config_file = GROUNDING_DINO_CONFIG
    checkpoint_path = GROUNDING_DINO_CHECKPOINT
    model = load_model(config_file, checkpoint_path, device=device)
    return model

def detect_objects(frame, prompt, model, device, box_threshold=0.15, text_threshold=0.15):
    # Convert the frame (BGR) to a PIL RGB image.
    image_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    
    # Add proper normalization for GroundingDINO
    transform_pipeline = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image_tensor = transform_pipeline(image_pil).to(device)
    
    # Use the detection model to get bounding boxes.
    boxes, logits, phrases = predict(
        model=model, 
        image=image_tensor,
        caption=prompt, 
        device=device, 
        box_threshold=box_threshold, 
        text_threshold=text_threshold
    )
    
    # Add debugging information
    print(f"Detection results:")
    print(f"Number of boxes: {len(boxes)}")
    print(f"Logits: {logits}")
    print(f"Phrases: {phrases}")
    
    # Convert boxes to numpy array and check if any boxes were detected
    boxes_np = boxes.cpu().numpy()
    return boxes_np if len(boxes_np) > 0 else None

# ----- Segmentation (using SAM) -----
# Note: Install segment-anything and ensure you have the SAM checkpoint.
from segment_anything import SamPredictor, sam_model_registry

def load_sam_predictor(device):
    # Update path to your local SAM checkpoint
    sam_checkpoint = SAM_CHECKPOINT
    model_type = "vit_h"
    
    print(f"Loading SAM from: {sam_checkpoint}")
    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device=device)
    predictor = SamPredictor(sam)
    return predictor

def generate_masks(frame, boxes, predictor):
    # Prepare the predictor with the current frame.
    predictor.set_image(frame)
    masks = []
    # For each detected box (assumed format: [x1, y1, x2, y2]), get a segmentation mask.
    for box in boxes:
        box = np.array(box)
        # The predictor returns a tuple; here we take the first (and only) mask.
        mask, _, _ = predictor.predict(box=box, multimask_output=False)
        masks.append(mask[0])
    return masks

# ----- Inpainting (using Stable Diffusion Inpainting) -----
# Note: Install diffusers and its dependencies.
from diffusers import StableDiffusionInpaintPipeline

def load_inpaint_pipeline(device):
    print("Loading Stable Diffusion Inpainting pipeline...")
    
    # Use CPU for now since CUDA seems unavailable
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "runwayml/stable-diffusion-inpainting",
        torch_dtype=torch.float32,  # Use float32 for CPU
        safety_checker=None  # Disable safety checker if needed
    )
    pipe = pipe.to(device)
    return pipe

def inpaint_region(frame, mask, prompt, pipe):
    # Convert the frame to a PIL RGB image.
    image_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    
    # Get original dimensions
    original_size = image_pil.size  # (width, height)
    
    # Resize input image and mask to 512x512 (SD inpainting requirement)
    image_pil = image_pil.resize((512, 512), Image.Resampling.LANCZOS)
    mask = cv2.resize((mask * 255).astype(np.uint8), (512, 512), interpolation=cv2.INTER_LINEAR)
    mask_pil = Image.fromarray(mask, mode="L")
    
    # Run the inpainting pipeline
    result = pipe(prompt=prompt, image=image_pil, mask_image=mask_pil).images[0]
    
    # Resize result back to original dimensions
    result = result.resize(original_size, Image.Resampling.LANCZOS)
    
    # Convert back to BGR for OpenCV
    result_cv = cv2.cvtColor(np.array(result), cv2.COLOR_RGB2BGR)
    return result_cv

# ----- Processing Pipeline -----
def process_frame(frame, detection_prompt, replacement_prompt, detection_model, sam_predictor, inpaint_pipe, device):
    # Add debug prints
    print(f"\nProcessing frame with:")
    print(f"Detection prompt: {detection_prompt}")
    print(f"Replacement prompt: {replacement_prompt}")
    
    # Store original dimensions
    original_h, original_w = frame.shape[:2]
    
    # Resize frame if too large (SD has size limits)
    max_size = 1024
    if original_h > max_size or original_w > max_size:
        scale = max_size / max(original_h, original_w)
        frame = cv2.resize(frame, (int(original_w * scale), int(original_h * scale)))
        print(f"Resized frame to {frame.shape}")
    
    boxes = detect_objects(frame, detection_prompt, detection_model, device)
    if boxes is None or len(boxes) == 0:
        print("No objects detected with the given prompt.")
        return frame

    # 2. Generate segmentation masks for the detected bounding boxes.
    masks = generate_masks(frame, boxes, sam_predictor)
    output_frame = frame.copy()
    
    # 3. For each mask, run inpainting and composite the result.
    for mask in masks:
        inpainted = inpaint_region(output_frame, mask, replacement_prompt, inpaint_pipe)
        # Create a 3-channel version of the mask
        mask_3c = np.stack([mask]*3, axis=-1)
        # Composite: replace pixels where mask is "active"
        output_frame = np.where(mask_3c > 0.5, inpainted, output_frame)
    
    # Resize back to original dimensions if needed
    if output_frame.shape[:2] != (original_h, original_w):
        output_frame = cv2.resize(output_frame, (original_w, original_h))
    
    return output_frame

# ----- Main Video Loop -----
def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("Loading detection model...")
    detection_model = load_detection_model(device)
    print("Loading SAM predictor...")
    sam_predictor = load_sam_predictor(device)
    print("Loading inpainting pipeline...")
    inpaint_pipe = load_inpaint_pipeline(device)

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print("Error: Unable to open video file.")
        return

    print("Press 'c' to capture and process a frame, or 'q' to quit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("End of video stream.")
            break

        cv2.imshow("Video", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('c'):
            print("Capturing frame and processing...")
            processed_frame = process_frame(
                frame,
                DETECTION_PROMPT,
                REPLACEMENT_PROMPT,
                detection_model,
                sam_predictor,
                inpaint_pipe,
                device
            )
            cv2.imshow("Processed Frame", processed_frame)
            # Optionally, save the processed frame.
            cv2.imwrite("processed_frame.jpg", processed_frame)
            print("Processed frame saved as processed_frame.jpg")
            cv2.waitKey(0)
        elif key == ord('q'):
            print("Quitting...")
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()