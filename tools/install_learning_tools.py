"""Install progressive learning tools; safe to rerun after rebuilding decks.

已掛好的標籤保留原本的版本號，缺少的才補上（版本取內容雜湊）。
要強制統一升版才用：python -X utf8 tools/install_learning_tools.py --bump 20261105a
"""
from pathlib import Path
import os
import re
import sys

from teaching_visuals import content_version, save

ROOT = Path(__file__).resolve().parents[1]

def refresh_versions(text, version):
    names = r'(?:piano\.js|songwriting\.js|works-lab\.js|ui\.js|responsive\.css|youtube\.css|deck-bundle\.css|studio\.css|theme\.css|learning-tools\.(?:js|css)|learning-print\.css)'
    return re.sub(r'('+names+r'\?v=)[^"\s>]+', r'\g<1>'+version, text)

def tag_version(name, bump=None):
    return bump or content_version(ROOT / 'site/assets' / name)

def enhance_file(path, bump=None):
    path = Path(path)
    text = path.read_text(encoding='utf-8')
    base = os.path.relpath(ROOT / 'site/assets', path.parent).replace('\\', '/')
    if path.name in ('handbook.html','handbook-print.html') and 'learning-print.css' not in text:
        text = text.replace('</head>', f'<link rel="stylesheet" href="{base}/learning-print.css?v={tag_version("learning-print.css", bump)}">\n</head>')
    if path.name == 'handbook-print.html':
        save(path, text)
        return
    if bump:
        text = refresh_versions(text, bump)
    if 'ps-audio.js' not in text:
        audio = f'<script src="{base}/ps-audio.js?v={tag_version("ps-audio.js", bump)}" defer></script>\n'
        if 'learning-tools.js' in text:
            text = re.sub(r'(?=<script[^>]+src="[^"]*learning-tools\.js)', lambda m: audio, text, count=1)
        else:
            text = text.replace('</body>', audio+'</body>')
    if 'learning-tools.js' not in text:
        if 'learning-tools.css' not in text:
            text = text.replace('</head>', f'<link rel="stylesheet" href="{base}/learning-tools.css?v={tag_version("learning-tools.css", bump)}">\n</head>')
        text = text.replace('</body>', f'<script src="{base}/learning-tools.js?v={tag_version("learning-tools.js", bump)}" defer></script>\n</body>')
    save(path, text)

def install(bump=None):
    if bump:
        for path in (ROOT/'site').rglob('*.html'):
            if path.relative_to(ROOT/'site').parts[0] == 'en':
                continue
            save(path, refresh_versions(path.read_text(encoding='utf-8'), bump))
    for course, pattern in [('vocal','slides/lesson-*/index.html'),('guitar','ch*/index.html'),('piano','p*/index.html'),('songwriting','s*/index.html')]:
        for path in (ROOT/'site'/course).glob(pattern):
            enhance_file(path, bump)
        enhance_file(ROOT/'site'/course/'index.html', bump)
        enhance_file(ROOT/'site'/course/'handbook.html', bump)
        enhance_file(ROOT/'site'/course/'handbook-print.html', bump)

if __name__ == '__main__':
    install(sys.argv[sys.argv.index('--bump') + 1] if '--bump' in sys.argv else None)
