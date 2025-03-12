#!/usr/bin/env python3

import os
import cv2
import torch
import numpy as np
import matplotlib.pyplot as plt
import sys

# Add necessary paths
REPO_DIR = os.path.join(os.path.dirname(__file__), "Grounded-Segment-Anything")
GROUNDING_DINO_DIR = os.path.join(REPO_DIR, "GroundingDINO")
sys.path.append(REPO_DIR)
sys.path.append(GROUNDING_DINO_DIR)

# Model paths
GROUNDING_DINO_CONFIG_PATH = os.path.join(GROUNDING_DINO_DIR, "groundingdino/config/GroundingDINO_SwinT_OGC.py")
GROUNDING_DINO_CHECKPOINT_PATH = os.path.join(REPO_DIR, "weights/groundingdino_swint_ogc.pth")
SAM_CHECKPOINT_PATH = os.path.join(REPO_DIR, "weights/sam_vit_h_4b8939.pth")

# Imports
from groundingdino.util.inference import load_model, load_image, predict
from segment_anything import sam_model_registry, SamPredictor
from diffusers import StableDiffusionPipeline

# Initialize models
grounding_dino_model = load_model(GROUNDING_DINO_CONFIG_PATH, GROUNDING_DINO_CHECKPOINT_PATH)
sam = sam_model_registry["vit_b"](checkpoint=SAM_CHECKPOINT_PATH)
device = "mps" if torch.mps.is_available() else "cpu"
sam.to(device=device)
predictor = SamPredictor(sam)

# ------------------------- #
#      HELPER FUNCTIONS     #
# ------------------------- #

def visualize_detections(image_np, boxes, labels):
    """
    Draw bounding boxes and labels on the image using OpenCV, then display with matplotlib.
    """
    disp_image = image_np.copy()
    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box)
        cv2.rectangle(disp_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(disp_image, labels[i], (x1, y1-5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,0), 1, cv2.LINE_AA)
    plt.figure(figsize=(8, 6))
    plt.imshow(cv2.cvtColor(disp_image, cv2.COLOR_BGR2RGB))
    plt.title("GroundingDINO Detection")
    plt.axis("off")
    plt.show()

def visualize_segmentation(image_np, mask):
    """
    Show the segmentation mask overlay on the original image.
    """
    disp_image = image_np.copy()
    # Create an overlay where mask is True
    red_mask = np.zeros_like(disp_image)
    red_mask[:,:,0] = 255  # Red channel
    alpha = 0.5
    disp_image[mask] = cv2.addWeighted(disp_image[mask], alpha, red_mask[mask], 1-alpha, 0)
    plt.figure(figsize=(8, 6))
    plt.imshow(cv2.cvtColor(disp_image, cv2.COLOR_BGR2RGB))
    plt.title("Segment Anything Mask")
    plt.axis("off")
    plt.show()

def crop_or_pad_to_box(image_np, mask_box):
    """
    Extracts the region (x1,y1,x2,y2) from the image, returning a cropped sub-image.
    """
    x1, y1, x2, y2 = map(int, mask_box)
    cropped = image_np[y1:y2, x1:x2]
    return cropped

def overlay_generated_object(base_image, gen_image, mask_box):
    """
    Place the generated image content onto the base image in the bounding box region.
    Adjusts the generated image to the bounding box size.
    """
    x1, y1, x2, y2 = map(int, mask_box)
    h, w, _ = base_image.shape
    # Clip if bounding box extends beyond image
    x2 = min(x2, w)
    y2 = min(y2, h)

    region_w = x2 - x1
    region_h = y2 - y1
    if region_w <= 0 or region_h <= 0:
        return base_image  # no overlay if invalid region

    # Resize generated image to the bounding box size
    gen_image_resized = cv2.resize(gen_image, (region_w, region_h))
    output_img = base_image.copy()
    output_img[y1:y1+region_h, x1:x1+region_w] = gen_image_resized
    return output_img

# ------------------------- #
#          MAIN CODE        #
# ------------------------- #

def main():
    # 1. Load your image
    image_path = input("Enter the path to your image: ").strip()
    if not os.path.exists(image_path):
        print("Image file not found!")
        return

    # 2. Provide a textual prompt for detection
    detection_prompt = input("Enter a textual prompt to detect (e.g. 'dog', 'chair', 'person'): ")

    # 3. Provide a textual prompt for generation (Stable Diffusion)
    generation_prompt = input("Enter a prompt for the new object to generate (e.g. 'a cute plush toy'): ")

    # ---- LOAD IMAGE with Grounding DINO recommended utility (or just OpenCV) ----
    image_pil, image_np = load_image(image_path)  # image_np = BGR
    orig_h, orig_w, _ = image_np.shape

    # ---- GROUNDING DINO SETUP ----
    # Download the GroundingDINO weights or specify the path
    # e.g. https://github.com/IDEA-Research/GroundingDINO#model-checkpoints
    grounding_model_path = "<PATH_TO_GROUNDING_DINO_WEIGHTS.pth>"
    config_file = "<PATH_TO_GROUNDING_DINO_CONFIG.py>"

    dino_model = Model(model_config_path=config_file, 
                       model_checkpoint_path=grounding_model_path)
    
    # ---- RUN DETECTION (Grounding DINO) ----
    boxes, logits, phrases = predict(
        model=dino_model,
        image=image_pil,
        caption=detection_prompt,
        box_threshold=0.35,
        text_threshold=0.25
    )
    # boxes: list of [x1, y1, x2, y2]
    # phrases: list of text labels

    if len(boxes) == 0:
        print(f"No objects detected for prompt '{detection_prompt}'. Exiting.")
        return

    # Show bounding boxes
    visualize_detections(image_np, boxes, phrases)

    # For simplicity, let's just pick the first detected box
    selected_box = boxes[0]
    selected_label = phrases[0]
    print(f"Using bounding box {selected_box} for '{selected_label}'")

    # ---- SEGMENT ANYTHING SETUP ----
    # Download a SAM model from: https://github.com/facebookresearch/segment-anything#model-checkpoints
    sam_checkpoint = "<PATH_TO_SAM_CHECKPOINT.pth>"
    sam_type = "vit_h"  # or vit_l, vit_b, depends on your checkpoint
    device = "cuda" if torch.cuda.is_available() else "cpu"

    sam = sam_model_registry[sam_type](checkpoint=sam_checkpoint)
    sam.to(device=device)
    predictor = SamPredictor(sam)

    # Prepare image for SAM
    image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
    predictor.set_image(image_rgb)

    # Provide the bounding box to SAM (must be in XYWH format, not XYXY)
    x1, y1, x2, y2 = selected_box
    input_box = np.array([x1, y1, (x2 - x1), (y2 - y1)], dtype=np.float32)

    # Predict the mask from the bounding box
    masks, scores, _ = predictor.predict(
        point_coords=None,
        point_labels=None,
        box=input_box[None, :],
        multimask_output=True
    )

    # Use the highest scoring mask
    best_idx = np.argmax(scores)
    best_mask = masks[best_idx]  # shape (H, W), bool

    # Show the segmentation overlay
    visualize_segmentation(image_np, best_mask)

    # ---- STABLE DIFFUSION SETUP ----
    # Download or use a local model
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        # or any other stable diffusion model
        # pass in your HF token if needed: use_auth_token=True
    )
    pipe.to(device)

    # Generate an image from the prompt
    print(f"Generating replacement object for prompt: '{generation_prompt}'...")
    sd_result = pipe(generation_prompt, num_inference_steps=30, guidance_scale=7.5)
    gen_image_pil = sd_result.images[0].convert("RGB")
    # Convert to NumPy (BGR) for OpenCV usage
    gen_image_np = cv2.cvtColor(np.array(gen_image_pil), cv2.COLOR_RGB2BGR)

    # ---- CROP & REPLACE ----
    # Instead of cropping the original object, we skip that. We simply overlay the generated image
    # where the bounding box was. If you'd like to do more advanced blending, you can.
    replaced_image = overlay_generated_object(image_np, gen_image_np, selected_box)

    # Show final result
    plt.figure(figsize=(8, 6))
    plt.imshow(cv2.cvtColor(replaced_image, cv2.COLOR_BGR2RGB))
    plt.title("Final Image with Object Replaced")
    plt.axis("off")
    plt.show()

    # Save final image
    output_path = "output_replaced.jpg"
    cv2.imwrite(output_path, replaced_image)
    print(f"Final image saved to {output_path}")

if __name__ == "__main__":
    main()