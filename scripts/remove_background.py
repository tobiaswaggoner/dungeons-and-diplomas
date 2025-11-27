"""
Script to remove background from shrine image and make it transparent.
Uses PIL/Pillow to detect and remove the gray stone background.
"""

from PIL import Image
import os

def remove_background(input_path: str, output_path: str):
    """
    Remove the gray stone background from the shrine image.
    Uses flood fill from corners to detect connected background pixels.
    """
    import sys
    sys.setrecursionlimit(50000)

    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    # Create a mask for pixels to make transparent
    to_remove = set()

    def is_background_color(r, g, b):
        """Check if a color looks like the stone background"""
        brightness = (r + g + b) / 3
        max_diff = max(abs(r-g), abs(g-b), abs(r-b))
        # Light grayish colors with low saturation
        # Lowered brightness threshold to catch darker gray areas
        return brightness > 100 and max_diff < 65

    def flood_fill(start_x, start_y):
        """Flood fill from starting point, marking background colors"""
        stack = [(start_x, start_y)]
        visited = set()

        while stack:
            x, y = stack.pop()
            if (x, y) in visited:
                continue
            if x < 0 or x >= width or y < 0 or y >= height:
                continue

            visited.add((x, y))
            r, g, b, a = pixels[x, y]

            if is_background_color(r, g, b):
                to_remove.add((x, y))
                stack.extend([(x+1, y), (x-1, y), (x, y+1), (x, y-1)])

    # Start flood fill from all four corners
    flood_fill(0, 0)
    flood_fill(width-1, 0)
    flood_fill(0, height-1)
    flood_fill(width-1, height-1)

    # Also start from edges at multiple points
    for i in range(0, width, 5):
        flood_fill(i, 0)
        flood_fill(i, height-1)
    for i in range(0, height, 5):
        flood_fill(0, i)
        flood_fill(width-1, i)

    # Make marked pixels transparent
    for x, y in to_remove:
        pixels[x, y] = (0, 0, 0, 0)

    img.save(output_path, "PNG")
    print(f"Saved transparent image to: {output_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    input_file = os.path.join(project_root, "docs", "Concepts", "Schrein", "Screenshot 2025-11-27 143457.png")
    output_file = os.path.join(project_root, "public", "Assets", "shrine.png")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    remove_background(input_file, output_file)
    print("Done! The shrine sprite is now at public/Assets/shrine.png")
