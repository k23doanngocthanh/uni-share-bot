#!/usr/bin/env python3
"""
Script to create a professional banner/hero image for UniShare
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_banner():
    # Banner dimensions (optimized for social media)
    width, height = 1200, 630
    
    # Create image with gradient background
    img = Image.new('RGB', (width, height), color='#1e40af')
    draw = ImageDraw.Draw(img)
    
    # Create gradient effect
    for y in range(height):
        # Gradient from blue to purple
        r = int(30 + (147 - 30) * y / height)  # 1e40af to 9333ea
        g = int(64 + (51 - 64) * y / height)
        b = int(175 + (234 - 175) * y / height)
        color = (r, g, b)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add subtle pattern overlay
    for x in range(0, width, 100):
        for y in range(0, height, 100):
            if (x + y) % 200 == 0:
                draw.ellipse([x-20, y-20, x+20, y+20], fill=(255, 255, 255, 10))
    
    # Try to load a font (fallback to default if not available)
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
        desc_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Add text content
    title_text = "UniShare"
    subtitle_text = "Nền tảng chia sẻ tài liệu học tập"
    desc_text = "Kết nối sinh viên • Chia sẻ kiến thức • Học tập thông minh"
    
    # Calculate text positions (centered)
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 100
    
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = title_y + 100
    
    desc_bbox = draw.textbbox((0, 0), desc_text, font=desc_font)
    desc_width = desc_bbox[2] - desc_bbox[0]
    desc_x = (width - desc_width) // 2
    desc_y = subtitle_y + 60
    
    # Add shadow effect for text
    shadow_offset = 3
    draw.text((title_x + shadow_offset, title_y + shadow_offset), title_text, font=title_font, fill=(0, 0, 0, 100))
    draw.text((subtitle_x + shadow_offset, subtitle_y + shadow_offset), subtitle_text, font=subtitle_font, fill=(0, 0, 0, 100))
    draw.text((desc_x + shadow_offset, desc_y + shadow_offset), desc_text, font=desc_font, fill=(0, 0, 0, 100))
    
    # Draw main text
    draw.text((title_x, title_y), title_text, font=title_font, fill='white')
    draw.text((subtitle_x, subtitle_y), subtitle_text, font=subtitle_font, fill='#e0e7ff')
    draw.text((desc_x, desc_y), desc_text, font=desc_font, fill='#c7d2fe')
    
    # Add decorative elements
    # Book icon representation
    book_x, book_y = 100, height // 2 - 50
    draw.rectangle([book_x, book_y, book_x + 60, book_y + 80], fill='white', outline='#1e40af', width=3)
    draw.rectangle([book_x + 10, book_y + 10, book_x + 50, book_y + 30], fill='#1e40af')
    draw.rectangle([book_x + 10, book_y + 40, book_x + 50, book_y + 60], fill='#1e40af')
    
    # Telegram icon representation
    telegram_x, telegram_y = width - 160, height // 2 - 30
    draw.ellipse([telegram_x, telegram_y, telegram_x + 60, telegram_y + 60], fill='#0088cc')
    # Simple paper plane shape
    draw.polygon([
        (telegram_x + 20, telegram_y + 30),
        (telegram_x + 40, telegram_y + 20),
        (telegram_x + 40, telegram_y + 40),
        (telegram_x + 35, telegram_y + 35),
        (telegram_x + 30, telegram_y + 40)
    ], fill='white')
    
    return img

def create_icon_sizes():
    """Create various icon sizes for different purposes"""
    # Create base icon (512x512)
    base_size = 512
    icon = Image.new('RGB', (base_size, base_size), color='#1e40af')
    draw = ImageDraw.Draw(icon)
    
    # Add gradient
    for y in range(base_size):
        r = int(30 + (147 - 30) * y / base_size)
        g = int(64 + (51 - 64) * y / base_size)
        b = int(175 + (234 - 175) * y / base_size)
        color = (r, g, b)
        draw.line([(0, y), (base_size, y)], fill=color)
    
    # Add rounded corners
    mask = Image.new('L', (base_size, base_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, base_size, base_size], radius=80, fill=255)
    
    # Apply mask
    icon.putalpha(mask)
    
    # Add U letter in the center
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 300)
    except:
        font = ImageFont.load_default()
    
    text = "U"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (base_size - text_width) // 2
    text_y = (base_size - text_height) // 2 - 20
    
    # Add shadow
    draw.text((text_x + 5, text_y + 5), text, font=font, fill=(0, 0, 0, 100))
    draw.text((text_x, text_y), text, font=font, fill='white')
    
    return icon

if __name__ == "__main__":
    # Create directories if they don't exist
    os.makedirs('/workspaces/uni-share-bot/public/assets', exist_ok=True)
    os.makedirs('/workspaces/uni-share-bot/src/assets', exist_ok=True)
    
    print("Creating banner image...")
    banner = create_banner()
    
    # Save banner to both locations
    banner.save('/workspaces/uni-share-bot/public/assets/hero-image.jpg', 'JPEG', quality=95, optimize=True)
    banner.save('/workspaces/uni-share-bot/src/assets/hero-image.jpg', 'JPEG', quality=95, optimize=True)
    
    # Create additional social media sizes
    banner_1200x600 = banner.resize((1200, 600), Image.Resampling.LANCZOS)
    banner_1200x600.save('/workspaces/uni-share-bot/public/assets/og-image.jpg', 'JPEG', quality=95, optimize=True)
    
    banner_800x400 = banner.resize((800, 400), Image.Resampling.LANCZOS)
    banner_800x400.save('/workspaces/uni-share-bot/public/assets/twitter-card.jpg', 'JPEG', quality=95, optimize=True)
    
    print("Creating icon...")
    icon = create_icon_sizes()
    
    # Save icon in different sizes
    sizes = [16, 32, 48, 96, 144, 192, 256, 512]
    for size in sizes:
        resized_icon = icon.resize((size, size), Image.Resampling.LANCZOS)
        resized_icon.save(f'/workspaces/uni-share-bot/public/icon-{size}x{size}.png', 'PNG', optimize=True)
    
    # Create favicon.ico with multiple sizes
    icon_16 = icon.resize((16, 16), Image.Resampling.LANCZOS)
    icon_32 = icon.resize((32, 32), Image.Resampling.LANCZOS)
    icon_48 = icon.resize((48, 48), Image.Resampling.LANCZOS)
    
    icon_16.save('/workspaces/uni-share-bot/public/favicon.ico', 
                sizes=[(16, 16), (32, 32), (48, 48)],
                append_images=[icon_32, icon_48])
    
    # Apple touch icon
    apple_icon = icon.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save('/workspaces/uni-share-bot/public/apple-touch-icon.png', 'PNG', optimize=True)
    
    print("All images created successfully!")
    print("Files created:")
    print("- /public/assets/hero-image.jpg (main banner)")
    print("- /public/assets/og-image.jpg (Open Graph)")
    print("- /public/assets/twitter-card.jpg (Twitter)")
    print("- /public/favicon.ico (favicon)")
    print("- /public/apple-touch-icon.png (Apple)")
    print("- /public/icon-*x*.png (various sizes)")
