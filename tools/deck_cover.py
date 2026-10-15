"""投影片封面的主視覺與簽名標誌直接寫進 HTML。

原本由 assets/deck.js 在執行時插入；封面主視覺是頁面的最大內容元素，
寫進 HTML 後隨第一次繪製出現，不必等全部腳本下載與執行。deck.js 看到已存在就不再插入。
"""
import re


def static_cover(html, prefix):
    """prefix：從投影片頁面到網站根目錄的相對路徑，例如 '../../'。"""
    if 'class="cover-art"' in html:
        return html
    m = re.search(r'<section class="slide cover"[^>]*>', html)
    if not m:
        return html
    end = html.index('</section>', m.end())
    brand = prefix + 'assets/brand/'
    art = (f'<div class="cover-art" aria-hidden="true"><span class="ca-glow"></span>'
           f'<img src="{brand}pixel-studio-symbol-color.svg" alt="" width="1024" height="1024" fetchpriority="high"></div>')
    sig = f'<img class="cover-sig" src="{brand}pixel-studio-primary-mono-white.svg" alt="Pixel Studio 畫素音樂工作坊" width="1600" height="1440" loading="lazy" decoding="async">'
    return html[:m.end()] + art + html[m.end():end] + sig + html[end:]


def lazy_images(html):
    """投影片內的圖片延遲載入（手機直向排列時，畫面外投影片的圖不搶首屏頻寬）。

    已指定 loading 或 fetchpriority 的圖（例如封面主視覺）不動；桌機簡報模式由 deck.js 在閒置時預載。
    """
    return re.sub(r'<img (?![^>]*\b(?:loading|fetchpriority)=)', '<img loading="lazy" decoding="async" ', html)
