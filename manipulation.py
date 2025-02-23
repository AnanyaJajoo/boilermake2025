import torch
import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import os
from torchvision import transforms
import urllib.request

# ---- GroundingDINO imports ----
# Assumes you have GroundingDINO repository available in your PYTHONPATH.
# For example, clone it and add its root folder to PYTHONPATH.
from groundingdino.util.inference import load_model, predict

# ---- SAM imports ----
from segment_anything import sam_model_registry, SamPredictor


def load_grounding_dino_model(config_path, checkpoint_path, device):
    """
    Loads the GroundingDINO model given its config and checkpoint.
    """
    # Initialize model on CPU first
    model = load_model(config_path, checkpoint_path, device='cpu')
    # Then move to target device
    model = model.to(device)
    return model


def get_grounding_dino_boxes(model, image, prompt, box_threshold=0.25, text_threshold=0.2):
    """
    Runs inference on the image using GroundingDINO and the provided text prompt.
    Returns bounding boxes, logits, and phrases.
    """
    # Ensure model is on the correct device
    device = next(model.parameters()).device
    
    # Convert PIL Image to torch tensor
    if isinstance(image, Image.Image):
        # Convert PIL Image to numpy array
        image_array = np.array(image)
        # Convert numpy array to torch tensor and normalize
        image_tensor = torch.from_numpy(image_array).permute(2, 0, 1).float()
        # Normalize to [0, 1]
        image_tensor = image_tensor / 255.0
        # Normalize with ImageNet stats
        normalize = transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
        image_tensor = normalize(image_tensor)
        image = image_tensor.to(device)
    
    boxes, logits, phrases = predict(
        model=model,
        image=image,
        caption=prompt,
        box_threshold=box_threshold,  # Lowered threshold
        text_threshold=text_threshold,  # Lowered threshold
        device=device
    )
    return boxes, logits, phrases


def load_sam_predictor(sam_checkpoint, model_type="vit_h", device="cuda"):
    """
    Loads the SAM model and creates a predictor.
    """
    if device is None:
        device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")
    
    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device=device)
    predictor = SamPredictor(sam)
    return predictor


def get_sam_mask(predictor, image, bbox):
    """
    Given a SAM predictor, an image, and a bounding box [x0, y0, x1, y1],
    returns a segmentation mask for the object within the bounding box.
    """
    # SAM expects the image in np.array (RGB)
    image_np = np.array(image)
    predictor.set_image(image_np)
    
    # Convert bbox to numpy array and ensure correct format
    bbox_np = np.array(bbox)
    
    # Get the mask; here we request a single mask (multimask_output=False)
    masks, scores, logits = predictor.predict(
        box=bbox_np,
        multimask_output=False
    )
    # Return the first mask
    return masks[0]


def download_sam_checkpoint():
    """
    Downloads the SAM checkpoint if it doesn't exist.
    """
    checkpoint_path = "sam_vit_h_4b8939.pth"
    if not os.path.exists(checkpoint_path):
        print("Downloading SAM checkpoint...")
        url = "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth"
        urllib.request.urlretrieve(url, checkpoint_path)
        print("Download completed!")
    return checkpoint_path


def main():
    # Determine device - try MPS first, then fall back to CPU
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("Using MPS device")
    else:
        device = torch.device("cpu")
        print("MPS not available, using CPU")

    # Force PyTorch to use CPU for certain operations that might not be supported on MPS
    torch.set_default_device(device)

    # --- Paths and configurations ---
    image_path = "chairs.JPG"
    grounding_config_path = "GroundingDINO/groundingdino/config/GroundingDINO_SwinT_OGC.py"
    grounding_checkpoint_path = "GroundingDINO/weights/groundingdino_swint_ogc.pth"
    
    # Download SAM checkpoint if needed
    sam_checkpoint = download_sam_checkpoint()

    # Check if all required files exist
    required_files = {
        "Image": image_path,
        "GroundingDINO config": grounding_config_path,
        "GroundingDINO weights": grounding_checkpoint_path,
        "SAM weights": sam_checkpoint
    }
    
    for name, path in required_files.items():
        if not os.path.exists(path):
            print(f"Error: {name} file not found at {path}")
            return

    # Load input image
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return
        
    image = Image.open(image_path).convert("RGB")
    
    # Add size check and resize if needed
    max_size = 800
    if max(image.size) > max_size:
        ratio = max_size / max(image.size)
        new_size = tuple(int(dim * ratio) for dim in image.size)
        image = image.resize(new_size, Image.LANCZOS)
        print(f"Resized image to {new_size}")

    # Load GroundingDINO model
    print("Loading GroundingDINO model...")
    gdino_model = load_grounding_dino_model(grounding_config_path, grounding_checkpoint_path, device)

    # Try multiple prompts for better detection
    prompt = "chair . a chair . chairs . sitting chair . furniture chair"
    print(f"Running GroundingDINO with prompt: '{prompt}'")
    boxes, logits, phrases = get_grounding_dino_boxes(gdino_model, image, prompt)

    if len(boxes) == 0:
        print("No objects detected for prompt:", prompt)
        return

    # For this prototype, use the first detected bounding box.
    bbox = boxes[0].cpu().numpy()  # Convert tensor to numpy array
    print("Detected bounding box:", bbox.tolist())  # Convert to list for printing

    # --- SAM: Refine Segmentation ---
    print("Loading SAM model...")
    sam_predictor = load_sam_predictor(sam_checkpoint, model_type="vit_h", device=device)
    print("Generating segmentation mask using SAM...")
    mask = get_sam_mask(sam_predictor, image, bbox)

    # Save the mask image (convert mask from boolean to 0-255)
    mask_image = Image.fromarray((mask * 255).astype(np.uint8))
    mask_image.save("segmentation_mask.png")
    print("Segmentation mask saved as 'segmentation_mask.png'.")

    # --- Optional: Visualization ---
    plt.figure(figsize=(10, 10))
    plt.imshow(image)
    # Draw the bounding box
    rect = plt.Rectangle((bbox[0], bbox[1]), bbox[2]-bbox[0], bbox[3]-bbox[1],
                         fill=False, edgecolor='red', linewidth=3)
    plt.gca().add_patch(rect)
    # Overlay the segmentation mask with transparency
    plt.imshow(mask, cmap="jet", alpha=0.5)
    plt.axis("off")
    plt.title("Detected Object and Segmentation Mask")
    plt.show()


if __name__ == "__main__":
    main()