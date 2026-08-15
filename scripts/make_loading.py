"""ساخت عکس loading با تم اژدها"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = '/home/z/my-project/public'
os.makedirs(OUT_DIR, exist_ok=True)

# رنگ‌ها
PRIMARY = (16, 185, 129, 255)  # سبز
PRIMARY_DARK = (5, 150, 105, 255)
WHITE = (255, 255, 255, 255)
DARK_BG = (10, 10, 10, 255)

def draw_dragon(draw, cx, cy, size, color):
    """رسم یک اژدهای ساده و هندسی"""
    # بدن (موج‌دار)
    points = []
    for i in range(20):
        t = i / 19
        x = cx - size/2 + t * size
        y = cy + size * 0.1 * (1 - 2*abs(t - 0.5)) * (1 if i % 2 == 0 else -1) * 0.3
        points.append((x, y))
    
    # بدن اصلی - یه مار موج‌دار
    body_points = []
    for i in range(15):
        t = i / 14
        x = cx - size*0.4 + t * size * 0.8
        wave = 0.15 * size * (1 - abs(2*t - 1)) * (1 if i % 2 == 0 else -1)
        y = cy + wave
        body_points.append((x, y))
    
    # رسم بدن به‌عنوان یک خط ضخیم
    for i in range(len(body_points) - 1):
        draw.line([body_points[i], body_points[i+1]], fill=color, width=max(3, int(size // 25)))
    
    # سر اژدها (دایره با شاخ)
    head_x = cx + size * 0.4
    head_y = cy - size * 0.05
    head_r = size * 0.12
    
    draw.ellipse(
        [head_x - head_r, head_y - head_r, head_x + head_r, head_y + head_r],
        fill=color
    )
    
    # شاخ‌ها
    horn1 = [(head_x - head_r*0.3, head_y - head_r*0.7),
             (head_x - head_r*0.5, head_y - head_r*1.8)]
    horn2 = [(head_x + head_r*0.3, head_y - head_r*0.7),
             (head_x + head_r*0.5, head_y - head_r*1.8)]
    draw.line(horn1, fill=color, width=max(2, int(size // 35)))
    draw.line(horn2, fill=color, width=max(2, int(size // 35)))
    
    # چشم
    eye_r = max(2, int(size // 80))
    draw.ellipse(
        [head_x + head_r*0.2 - eye_r, head_y - eye_r,
         head_x + head_r*0.2 + eye_r, head_y + eye_r],
        fill=WHITE
    )
    
    # بال‌ها
    wing_points = [
        (cx - size*0.1, cy - size*0.05),
        (cx - size*0.3, cy - size*0.35),
        (cx - size*0.15, cy - size*0.25),
        (cx, cy - size*0.15),
    ]
    draw.polygon(wing_points, fill=color)
    
    # دم
    tail_points = [
        (cx - size*0.4, cy),
        (cx - size*0.5, cy - size*0.1),
        (cx - size*0.55, cy + size*0.05),
    ]
    for i in range(len(tail_points) - 1):
        draw.line([tail_points[i], tail_points[i+1]], fill=color, width=max(3, int(size // 25)))
    
    # پنجه‌ها
    leg_y = cy + size * 0.15
    for i, lx in enumerate([cx - size*0.15, cx + size*0.1]):
        draw.line(
            [(lx, cy + size*0.05), (lx, leg_y)],
            fill=color, width=max(2, int(size // 30))
        )
        # پنجه
        for j in range(3):
            draw.line(
                [(lx, leg_y), (lx - 3 + j*3, leg_y + 5)],
                fill=color, width=max(1, int(size // 50))
            )


def create_loading_image(size, path, with_text=True):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # پس‌زمینه گرد
    draw.rounded_rectangle(
        [0, 0, size, size],
        radius=size // 5,
        fill=DARK_BG
    )
    
    # رسم اژدها
    draw_dragon(draw, size//2, size//2 - size*0.05, size * 0.7, PRIMARY)
    
    # متن لودینگ
    if with_text:
        try:
            font = ImageFont.truetype('/home/z/my-project/public/fonts/Vazirmatn-Bold.woff2', size // 12)
        except:
            font = ImageFont.load_default()
        
        text = "در حال بارگذاری..."
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        text_h = text_bbox[3] - text_bbox[1]
        
        draw.text(
            (size//2 - text_w//2, size - size//8),
            text,
            fill=WHITE,
            font=font
        )
    
    img.save(path, 'PNG')
    print(f'Created: {path} ({size}x{size})')

# ساخت چند اندازه
create_loading_image(512, os.path.join(OUT_DIR, 'loading.png'))
create_loading_image(192, os.path.join(OUT_DIR, 'loading-small.png'))

# بدون متن برای انیمیشن
img2 = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
draw2 = ImageDraw.Draw(img2)
draw2.rounded_rectangle([0, 0, 512, 512], radius=100, fill=DARK_BG)
draw_dragon(draw2, 256, 230, 350, PRIMARY)
img2.save(os.path.join(OUT_DIR, 'loading-anim.png'), 'PNG')
print('Created: loading-anim.png')

print('All loading images created!')
