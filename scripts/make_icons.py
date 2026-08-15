"""ساخت آیکن‌های PWA - PNG با اندازه‌های 192 و 512 و maskable"""
from PIL import Image, ImageDraw
import os

OUT_DIR = '/home/z/my-project/public/icons'
os.makedirs(OUT_DIR, exist_ok=True)

# رنگ‌ها
PRIMARY = (16, 185, 129, 255)  # emerald-500 #10b981
PRIMARY_DARK = (5, 150, 105, 255)  # emerald-600
WHITE = (255, 255, 255, 255)

def draw_icon(size: int, maskable: bool = False, path: str = ''):
    pad = int(size * 0.1) if maskable else int(size * 0.05)
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if maskable:
        draw.rectangle([0, 0, size, size], fill=PRIMARY_DARK)
        inner_pad = int(size * 0.1)
        draw.rounded_rectangle(
            [inner_pad, inner_pad, size - inner_pad, size - inner_pad],
            radius=int(size * 0.18),
            fill=PRIMARY,
        )
    else:
        draw.rounded_rectangle(
            [pad, pad, size - pad, size - pad],
            radius=int(size * 0.22),
            fill=PRIMARY,
        )
    
    cx, cy = size // 2, size // 2
    r = int(size * 0.28)
    
    draw.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        outline=WHITE,
        width=max(4, size // 50),
    )
    
    hand_w = max(4, size // 60)
    draw.line(
        [cx, cy, cx, cy - r + int(size * 0.06)],
        fill=WHITE,
        width=hand_w,
    )
    draw.line(
        [cx, cy, cx + r - int(size * 0.06), cy],
        fill=WHITE,
        width=hand_w,
    )
    
    dot_r = max(3, size // 60)
    draw.ellipse(
        [cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
        fill=WHITE,
    )
    
    tick_size = int(size * 0.18)
    tick_x = size - pad - tick_size - int(size * 0.05)
    tick_y = size - pad - tick_size - int(size * 0.05)
    
    draw.ellipse(
        [tick_x, tick_y, tick_x + tick_size, tick_y + tick_size],
        fill=WHITE,
    )
    
    tick_pad = int(tick_size * 0.3)
    points = [
        (tick_x + tick_pad, tick_y + tick_size * 0.5),
        (tick_x + tick_size * 0.42, tick_y + tick_size * 0.72),
        (tick_x + tick_size - tick_pad, tick_y + tick_size * 0.28),
    ]
    tick_line_w = max(3, size // 50)
    draw.line(points[:2], fill=PRIMARY_DARK, width=tick_line_w, joint='curve')
    draw.line(points[1:], fill=PRIMARY_DARK, width=tick_line_w, joint='curve')
    
    img.save(path, 'PNG')
    print(f'Created: {path} ({size}x{size})')

sizes = [192, 512]
for s in sizes:
    draw_icon(s, maskable=False, path=os.path.join(OUT_DIR, f'icon-{s}.png'))
    draw_icon(s, maskable=True, path=os.path.join(OUT_DIR, f'icon-{s}-maskable.png'))

draw_icon(180, maskable=False, path=os.path.join(OUT_DIR, 'apple-touch-icon.png'))
draw_icon(32, maskable=False, path=os.path.join(OUT_DIR, 'favicon-32.png'))

print('All icons created!')
for f in sorted(os.listdir(OUT_DIR)):
    full = os.path.join(OUT_DIR, f)
    print(f'  {f} ({os.path.getsize(full)} bytes)')
