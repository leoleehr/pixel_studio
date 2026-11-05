"""把講義 PDF（private/handbooks/）與網頁版 Markdown（site/ 內，不進 Git）上傳到 Cloudflare KV（綁定 HANDBOOKS）。

用法：python -X utf8 tools/upload_handbooks.py
修改講義或重新產生 PDF（tools/build_handbook_pdf.py）之後執行。KV 的鍵就是網址路徑，例如 en/guitar/guitar-handbook.pdf。
PDF 不進 site/ 也不進 Git：private/ 已列入 .gitignore。
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'private' / 'handbooks'
SITE = ROOT / 'site'
NPX = 'npx.cmd' if sys.platform == 'win32' else 'npx'


def main():
    files = [(f, f.relative_to(SRC).as_posix()) for f in sorted(SRC.rglob('*.pdf'))]
    files += [(f, f.relative_to(SITE).as_posix()) for name in ('handbook.md', 'course-handbook.md') for f in sorted(SITE.rglob(name))]
    if len(files) != 16:
        raise SystemExit(f'應有 8 份 PDF 與 8 份 Markdown，只找到 {len(files)} 份')
    for f, key in files:
        cmd = [NPX, '--no-install', 'wrangler', 'kv', 'key', 'put', key, '--binding', 'HANDBOOKS', '--path', str(f), '--remote']
        # wrangler 偶爾在寫入後以非零狀態結束；同一個鍵重寫沒有副作用，重試即可
        for attempt in range(3):
            if subprocess.run(cmd, cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
                break
            if attempt == 2:
                raise SystemExit(f'{key} 上傳失敗')
        print(f'{key}: {f.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
