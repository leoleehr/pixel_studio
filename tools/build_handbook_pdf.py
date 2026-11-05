"""由各 Lab 的 handbook-print.html 產生講義 PDF（中文與英文）。

用法：python -X utf8 tools/build_handbook_pdf.py [vocal guitar piano songwriting] [--lang zh|en]
需要 Playwright、本機 Chrome、PyMuPDF、pikepdf。
流程：開本機伺服器 → 載入圖片（含 guitar.js 接近畫面才載入的插圖）→ 列印 → 連結改正式網址 → compress_pdf_images.py。
輸出到 private/handbooks/（不進 Git），完成後執行 tools/upload_handbooks.py 上傳，網站才會換新檔。
完成後印出頁數；頁數變了要同步講義頁寫的頁數。
"""
import http.server
import pathlib
import subprocess
import sys
import tempfile
import threading
from functools import partial

import pymupdf
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
OUT = ROOT / 'private' / 'handbooks'
PROD = 'https://pixel-studio.musicallanding.workers.dev/'
PDFS = {'vocal': 'vocal-class-handbook.pdf', 'guitar': 'guitar-handbook.pdf',
        'piano': 'piano-handbook.pdf', 'songwriting': 'songwriting-handbook.pdf'}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def render(browser, base, lab, lang, raw):
    prefix = 'en/' if lang == 'en' else ''
    page = browser.new_page()
    page.goto(f'{base}{prefix}{lab}/handbook-print.html', wait_until='networkidle')
    page.wait_for_function("document.body.dataset.ready==='1'", timeout=120000)
    page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
    # guitar.js 的插圖要收到 beforeprint 才載入，否則照片是空的
    page.evaluate("window.dispatchEvent(new Event('beforeprint'))")
    page.wait_for_function("Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)", timeout=120000)
    page.wait_for_function("!document.querySelector('image[data-lazy-href]:not([href])')", timeout=120000)
    page.wait_for_load_state('networkidle')
    page.evaluate('document.fonts.ready')
    page.pdf(path=str(raw), print_background=True, prefer_css_page_size=True)
    page.close()


def fix_links(raw, out, base):
    doc = pymupdf.open(raw)
    for pg in doc:
        for link in pg.get_links():
            uri = link.get('uri', '')
            if uri.startswith(base):
                link['uri'] = PROD + uri[len(base):]
                pg.update_link(link)
    doc.save(out, garbage=4, deflate=True)
    doc.close()


def main():
    args = sys.argv[1:]
    langs = ['zh', 'en']
    if '--lang' in args:
        i = args.index('--lang')
        langs = [args[i + 1]]
        args = args[:i] + args[i + 2:]
    labs = args or list(PDFS)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(SITE)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_address[1]}/'
    try:
        with sync_playwright() as pw, tempfile.TemporaryDirectory() as tmp:
            browser = pw.chromium.launch(channel='chrome')
            for lab in labs:
                for lang in langs:
                    raw = pathlib.Path(tmp) / f'{lab}-{lang}-raw.pdf'
                    linked = pathlib.Path(tmp) / f'{lab}-{lang}-links.pdf'
                    dest = OUT / ('en' if lang == 'en' else '') / lab / PDFS[lab]
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    render(browser, base, lab, lang, raw)
                    fix_links(raw, linked, base)
                    subprocess.run([sys.executable, '-X', 'utf8', str(ROOT / 'tools' / 'compress_pdf_images.py'), str(linked), str(dest)],
                                   check=True, stdout=subprocess.DEVNULL)
                    doc = pymupdf.open(dest)
                    print(f'{lab} {lang}: {len(doc)} pages, {dest.stat().st_size // 1024} KB')
                    doc.close()
            browser.close()
    finally:
        srv.shutdown()


if __name__ == '__main__':
    main()
