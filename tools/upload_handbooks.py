"""把 private/handbooks/ 的講義 PDF 上傳到 Cloudflare KV（綁定 HANDBOOKS）。

用法：python -X utf8 tools/upload_handbooks.py
重新產生 PDF（tools/build_handbook_pdf.py）之後執行。KV 的鍵就是網址路徑，例如 en/guitar/guitar-handbook.pdf。
PDF 不進 site/ 也不進 Git：private/ 已列入 .gitignore。
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'private' / 'handbooks'
NPX = 'npx.cmd' if sys.platform == 'win32' else 'npx'


def main():
    files = sorted(SRC.rglob('*.pdf'))
    if not files:
        raise SystemExit(f'{SRC} 沒有 PDF')
    for f in files:
        key = f.relative_to(SRC).as_posix()
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
