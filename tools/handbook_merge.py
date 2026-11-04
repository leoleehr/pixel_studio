"""講義產生器的共用邏輯：讀投影片原稿、把舊講義裡不由產生器管理的部分帶回新講義。

learning-notes 區塊由 build_learning_handbook_notes.py 寫入（需要本機預覽），
重產講義時不重新截圖，直接依章節沿用舊內容。圖片的 ?v= 是各圖更新時個別調整的，
同一張圖沿用舊版本號；只有舊講義沒有的圖片才保留 enrich_markdown 給的版本。
"""
import re

SLIDE = re.compile(r'<section\b[^>]*\bclass="[^"]*\bslide\b[^"]*"[^>]*>(.*?)</section>', re.S)
SECTION = re.compile(r'(?=^## )', re.M)
HEADING = re.compile(r'## (第(?:十一|十二|十|[一二三四五六七八九])[章堂])?(.*)')
NOTES = re.compile(r'<!-- learning-notes-start -->.*?<!-- learning-notes-end -->', re.S)
IMAGE = re.compile(r'(src="[^"?]+\?v=)([^"]+)(")')


def slide_sections(body):
    """回傳每張投影片的內容；section 可以帶 data-teaching 等任意屬性，編號才會和實際投影片一致。"""
    return SLIDE.findall(body)


def section_key(part):
    """章節以「第三堂」這類編號辨識，標題改字時仍對得上；課程總覽等沒有編號的用整行標題。"""
    m = HEADING.match(part.split('\n', 1)[0])
    return (m.group(1) or m.group(2).strip()) if m else ''


def restore_notes(new_md, old_md):
    notes = {section_key(p): NOTES.findall(p) for p in SECTION.split(old_md)}
    parts = SECTION.split(NOTES.sub('', new_md))
    for i, part in enumerate(parts):
        blocks = notes.get(section_key(part))
        if blocks:
            parts[i] = part.rstrip() + '\n\n' + '\n\n'.join(blocks) + '\n\n'
    return ''.join(parts)


def restore_image_versions(new_md, old_md):
    """同一張圖優先用同一章節的舊版本號，章節裡沒有才用全書第一次出現的版本號。"""
    by_section, whole = {}, {}
    for part in SECTION.split(old_md):
        key = section_key(part)
        for m in IMAGE.finditer(part):
            by_section.setdefault((key, m.group(1)), m.group(2))
            whole.setdefault(m.group(1), m.group(2))
    parts = SECTION.split(new_md)
    for i, part in enumerate(parts):
        key = section_key(part)
        parts[i] = IMAGE.sub(lambda m: m.group(1) + by_section.get((key, m.group(1)), whole.get(m.group(1), m.group(2))) + m.group(3), part)
    return ''.join(parts)


def merge(new_md, old_md):
    return restore_image_versions(restore_notes(new_md, old_md), old_md).rstrip() + '\n'
