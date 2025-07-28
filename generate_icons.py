#!/usr/bin/env python3
"""
Simple icon generator for SSH to HTTPS Converter Chrome Extension
Creates basic PNG icons using PIL (Pillow)
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("PIL (Pillow) not found. Install with: pip install Pillow")
    exit(1)

def create_icon(size, filename):
    """Create a simple icon with the given size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background circle
    margin = size // 8
    circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(circle_bbox, fill=(102, 126, 234, 255))  # #667eea
    
    # Calculate font size based on icon size
    font_size = max(size // 6, 8)
    
    try:
        # Try to use a system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
    
    # Draw "S→H" text
    text = "S→H"
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw text in white
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    """Generate all required icon sizes"""
    # Create icons directory if it doesn't exist
    icons_dir = "icons"
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
    
    # Generate icons for required sizes
    sizes = [16, 48, 128]
    
    for size in sizes:
        filename = os.path.join(icons_dir, f"icon{size}.png")
        create_icon(size, filename)
    
    print("\n✅ All icons generated successfully!")
    print("Icons saved in the 'icons' directory:")
    for size in sizes:
        print(f"  - icon{size}.png")

if __name__ == "__main__":
    main()
