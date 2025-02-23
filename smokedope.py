#!/usr/bin/env python
"""
A script to replace an object in an image with new content specified by a text prompt.
It uses:
  - SAM (Segment Anything Model) with a ViT-B checkpoint to segment the object.
  - A Stable Diffusion inpainting pipeline to fill (or replace) the segmented region.
  
Usage (command line):
  python replace_object.py --input_img path/to/image.jpg --text_prompt "a teddy bear on a bench" --output output.png --sam_ckpt ./pretrained_models/sam_vit_b_01ec64.pth
  (Optionally provide --point_coords x y. If not provided, you'll be prompted to click on the image.)
"""

import cv2
import numpy as np
import torch
from PIL import Image
import sys

# Import SAM classes
from segment_anything import sam_model_registry, SamPredictor

# Import Stable Diffusion Inpainting pipeline
from diffusers import StableDiffusionInpaintPipeline

# Predefined arguments
INPUT_IMG = "/Users/robertzhang/Documents/GitHub/boilermake2025/replacement.png"  # Replace with your input image path
TEXT_PROMPT = "teddy bear"      # Replace with your desired prompt
OUTPUT_PATH = "output.png"                   # Output image path
POINT_COORDS = None                         # Set to tuple (x, y) to skip clicking
DILATE_KERNEL_SIZE = 0                      # Kernel size for mask dilation
SAM_CHECKPOINT = "/Users/robertzhang/Documents/GitHub/boilermake2025/vithbsamcheckpoint.pth"  # Path to SAM checkpoint
SAM_MODEL_TYPE = "vit_b"                    # SAM model type

# Choose device: try MPS for Apple Silicon, then CUDA, else CPU.
if torch.backends.mps.is_available():
    device = "mps"
elif torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"
print(f"Using device: {device}")

def get_click_coordinate(image):
    """Display image and let user click to select a point.
       Returns the (x, y) coordinate of the first left-click.
    """
    coords = []

    def click_event(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            coords.append((x, y))
            cv2.circle(display_img, (x, y), 5, (0, 255, 0), -1)
            cv2.imshow("Select Object", display_img)

    display_img = image.copy()
    cv2.imshow("Select Object", display_img)
    cv2.setMouseCallback("Select Object", click_event)
    print("Click on the object you wish to replace, then press any key.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    if not coords:
        print("No coordinate selected. Exiting.")
        sys.exit(1)
    return coords[0]

def dilate_mask(mask, kernel_size):
    """Dilate a binary mask using a square kernel of given size."""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.dilate(mask.astype(np.uint8), kernel, iterations=1)

def main():
    # Load input image using OpenCV
    image_bgr = cv2.imread(INPUT_IMG)
    if image_bgr is None:
        print(f"Error: Unable to load image at {INPUT_IMG}")
        sys.exit(1)
    # Convert image to RGB
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    # Get point coordinate: either from predefined coords or via interactive click
    if POINT_COORDS:
        point = POINT_COORDS
    else:
        point = get_click_coordinate(image_bgr)
    point_coords = np.array([point])
    point_labels = np.array([1])  # Assume positive prompt

    # Load SAM model using the specified checkpoint and model type
    print("Loading SAM model...")
    sam = sam_model_registry[SAM_MODEL_TYPE](checkpoint=SAM_CHECKPOINT)
    sam.to(device=device)
    predictor = SamPredictor(sam)
    predictor.set_image(image_rgb)

    # Predict mask for the selected point
    masks, scores, logits = predictor.predict(point_coords=point_coords, point_labels=point_labels, multimask_output=False)
    mask = masks[0]  # Take the first (and only) mask

    # Optionally dilate the mask
    if DILATE_KERNEL_SIZE > 0:
        mask = dilate_mask(mask, DILATE_KERNEL_SIZE)

    # Convert mask to binary (0 and 255)
    mask_bin = (mask.astype(np.uint8) * 255)

    # Convert image and mask to PIL format
    image_pil = Image.fromarray(image_rgb)
    mask_pil = Image.fromarray(mask_bin)

    # Load Stable Diffusion 2 Inpainting pipeline
    print("Loading Stable Diffusion 2 inpainting pipeline...")
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "stabilityai/stable-diffusion-2-inpainting",
        torch_dtype=torch.float16,
        safety_checker=None,
    ).to(device)

    # Get original image dimensions
    original_width, original_height = image_pil.size

    # Ensure input images are properly sized (multiple of 8)
    def prepare_image(img):
        w, h = img.size
        # SD2 prefers 768x768 or similar resolutions
        target_size = 768
        # Keep aspect ratio
        if w > h:
            new_w = target_size
            new_h = int(h * (target_size / w))
            new_h = new_h - (new_h % 8)  # Make multiple of 8
        else:
            new_h = target_size
            new_w = int(w * (target_size / h))
            new_w = new_w - (new_w % 8)  # Make multiple of 8
        return img.resize((new_w, new_h))

    # Prepare images
    image_pil = prepare_image(image_pil)
    mask_pil = prepare_image(mask_pil)

    # Run inpainting with SD2-specific parameters
    print("Running inpainting...")
    output = pipe(
        prompt=TEXT_PROMPT,
        image=image_pil,
        mask_image=mask_pil,
        num_inference_steps=50,
        guidance_scale=7.5,
        negative_prompt="lowres, bad anatomy, bad hands, cropped, worst quality",
    ).images[0]

    # Resize back to original dimensions
    output = output.resize((original_width, original_height), Image.Resampling.LANCZOS)

    # Save the output image
    output.save(OUTPUT_PATH)
    print(f"Output saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()