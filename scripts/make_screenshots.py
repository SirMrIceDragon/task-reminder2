"""ساخت screenshot برای PWA manifest"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = '/home/z/my-project/public/icons'
os.makedirs(OUT_DIR, exist_ok=True)

# رنگ‌ها
PRIMARY = (16, 185, 129, 255)
PRIMARY_DARK = (5, 150, 105, 255)
WHITE = (255, 255, 255, 255)
DARK_BG = (10, 10, 10, 255)
MUTED = (115, 115, 115, 255)
CARD_BG = (24, 24, 24, 255)

def create_screenshot(width, height, path, label_fa):
    img = Image.new('RGBA', (width, height), DARK_BG)
    draw = ImageDraw.Draw(img)
    
    # هدر
    draw.rectangle([0, 0, width, 80], fill=CARD_BG)
    
    # عنوان
    try:
        font_large = ImageFont.truetype('/home/z/my-project/public/fonts/Vazirmatn-Bold.woff2', 28) if os.path.exists('/home/z/my-project/public/fonts/Vazirmatn-Bold.woff2') else ImageFont.load_default()
        font_med = ImageFont.truetype('/home/z/my-project/public/fonts/Vazirmatn-Medium.woff2', 18) if os.path.exists('/home/z/my-project/public/fonts/Vazirmatn-Medium.woff2') else ImageFont.load_default()
        font_small = ImageFont.truetype('/home/z/my-project/public/fonts/Vazirmatn-Regular.woff2', 14) if os.path.exists('/home/z/my-project/public/fonts/Vazirmatn-Regular.woff2') else ImageFont.load_default()
    except:
        font_large = ImageFont.load_default()
        font_med = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # عنوان اپ
    draw.text((width - 30, 20), "یادآور تسک‌ها", fill=WHITE, font=font_large, anchor='ra')
    draw.text((width - 30, 55), label_fa, fill=MUTED, font=font_small, anchor='ra')
    
    # دکمه + سبز
    cx = 40
    cy = 40
    draw.ellipse([cx-20, cy-20, cx+20, cy+20], fill=PRIMARY)
    draw.text((cx, cy), "+", fill=WHITE, font=font_large, anchor='mm')
    
    # کارت‌های تسک نمونه
    y = 110
    tasks = [
        ("📚", "مطالعه فیزیک - فصل ۵", "امروز - ۱۴:۳۰", True),
        ("💼", "جلسه کاری", "فردا - ۱۰:۰۰", False),
        ("🎯", "تمرین ورزش", "امروز - ۱۸:۰۰", False),
        ("💻", "پروژه برنامه‌نویسی", "این هفته", False),
    ]
    
    for emoji, title, time_str, is_today in tasks:
        # کارت
        card_color = (30, 30, 30, 255) if not is_today else (20, 40, 35, 255)
        draw.rounded_rectangle([20, y, width-20, y+70], radius=12, fill=card_color)
        
        # نوار رنگی سمت راست
        bar_color = PRIMARY if is_today else MUTED
        draw.rounded_rectangle([width-24, y, width-20, y+70], radius=2, fill=bar_color)
        
        # ایموجی
        draw.text((45, y+15), emoji, fill=WHITE, font=font_med)
        
        # عنوان
        draw.text((80, y+12), title, fill=WHITE, font=font_med)
        
        # زمان
        draw.text((80, y+40), time_str, fill=MUTED, font=font_small)
        
        # checkbox
        cb_x = width - 60
        cb_y = y + 25
        if is_today:
            draw.ellipse([cb_x, cb_y, cb_x+20, cb_y+20], fill=PRIMARY)
            draw.text((cb_x+10, cb_y+10), "✓", fill=WHITE, font=font_small, anchor='mm')
        else:
            draw.ellipse([cb_x, cb_y, cb_x+20, cb_y+20], outline=MUTED, width=2)
        
        y += 85
    
    # نوار پایین
    nav_y = height - 70
    draw.rectangle([0, nav_y, width, height], fill=CARD_BG)
    
    nav_items = [("تسک‌ها", True), ("تایمر", False), ("سوشال", False), ("پروفایل", False)]
    item_w = width // 4
    for i, (label, active) in enumerate(nav_items):
        x = i * item_w + item_w // 2
        color = PRIMARY if active else MUTED
        # آیکون دایره
        draw.ellipse([x-12, nav_y+12, x+12, nav_y+36], fill=color)
        draw.text((x, nav_y+50), label, fill=color, font=font_small, anchor='ma')
    
    img.save(path, 'PNG')
    print(f'Created: {path} ({width}x{height})')

# ساخت screenshot‌ها
# موبایل (portrait)
create_screenshot(390, 844, os.path.join(OUT_DIR, 'screenshot-mobile.png'), '۴ تسک · ۱ تأخیر')

# دسکتاپ (landscape)
create_screenshot(1280, 800, os.path.join(OUT_DIR, 'screenshot-desktop.png'), '۴ تسک · ۱ تأخیر')

print('Screenshots created!')
