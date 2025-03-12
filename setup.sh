#!/bin/bash

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate

# Install basic dependencies
pip install torch torchvision
pip install opencv-python numpy pillow matplotlib

# Clone repositories
git clone https://github.com/IDEA-Research/Grounded-Segment-Anything.git
cd Grounded-Segment-Anything

# Install Segment Anything
pip install segment-anything

# Install GroundingDINO
git clone https://github.com/IDEA-Research/GroundingDINO.git
cd GroundingDINO
pip install -e .
cd ..

# Download model weights
wget https://github.com/IDEA-Research/GroundingDINO/releases/download/v0.1.0-alpha/groundingdino_swint_ogc.pth
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth

# Move weights to appropriate location
mkdir -p weights/
mv groundingdino_swint_ogc.pth weights/
mv sam_vit_h_4b8939.pth weights/

cd ..

# Install additional dependencies
pip install supervision diffusers transformers 