"""Install progressive learning tools; safe to rerun after rebuilding decks."""
from pathlib import Path
import os
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = '20261016learning1'

def enhance_file(path):
    path = Path(path)
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'((?:piano|songwriting)\.js\?v=)[^"\s>]+', r'\g<1>'+VERSION, text)
    if 'learning-tools.js' in text:
        path.write_text(text, encoding='utf-8', newline='\n')
        return
    base = os.path.relpath(ROOT / 'site/assets', path.parent).replace('\\', '/')
    text = text.replace('</head>', f'<link rel="stylesheet" href="{base}/learning-tools.css?v={VERSION}">\n</head>')
    text = text.replace('</body>', f'<script src="{base}/learning-tools.js?v={VERSION}" defer></script>\n</body>')
    path.write_text(text, encoding='utf-8', newline='\n')

def install():
    for course, pattern in [('vocal','slides/lesson-*/index.html'),('guitar','ch*/index.html'),('piano','p*/index.html'),('songwriting','s*/index.html')]:
        for path in (ROOT/'site'/course).glob(pattern):
            enhance_file(path)
        enhance_file(ROOT/'site'/course/'index.html')
        enhance_file(ROOT/'site'/course/'handbook.html')

if __name__ == '__main__':
    install()
