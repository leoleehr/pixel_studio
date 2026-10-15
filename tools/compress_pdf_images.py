"""縮小講義 PDF 內的點陣圖，不改動頁面內容、漸層與 Pattern。

Chrome 列印的 PDF 會把網頁圖片原尺寸嵌入（單份可達 30MB 以上）。這裡只替換圖片物件的資料流：
長邊超過 MAX 像素就等比例縮小，不透明的彩色圖改存 JPEG；帶透明遮罩（SMask）的圖片連遮罩一起縮放、
保持無損壓縮。頁面內容與其他資源原封不動。

用法：python -X utf8 tools/compress_pdf_images.py 輸入.pdf 輸出.pdf
"""
import io, sys, zlib
import pikepdf
from PIL import Image
from pikepdf import Name, PdfImage

MAX = 1600       # A4 寬 21cm、150dpi 約 1240px，留一點裁切與放大空間
QUALITY = 82


def shrink(pil, size):
    return pil.resize(size, Image.LANCZOS) if pil.size != size else pil


def flate(obj, pil, mode):
    pil = pil.convert(mode)
    obj.write(zlib.compress(pil.tobytes(), 9), filter=Name.FlateDecode)
    obj.Width, obj.Height = pil.size
    obj.ColorSpace = Name.DeviceGray if mode == 'L' else Name.DeviceRGB
    obj.BitsPerComponent = 8
    if Name.DecodeParms in obj:
        del obj[Name.DecodeParms]


def compress(src, dst):
    pdf = pikepdf.open(src)
    done = set()
    for page in pdf.pages:
        for _, raw in page.images.items():
            if raw.objgen in done:
                continue
            done.add(raw.objgen)
            try:
                img = PdfImage(raw)
                pil = img.as_pil_image()
            except Exception:
                continue
            w, h = pil.size
            scale = min(1.0, MAX / max(w, h))
            size = (max(1, round(w * scale)), max(1, round(h * scale)))
            smask = raw.get(Name.SMask)
            if smask is not None:
                try:
                    mask = PdfImage(smask).as_pil_image().convert('L')
                except Exception:
                    continue
                if scale < 1:
                    flate(smask, shrink(mask, size), 'L')
                    flate(raw, shrink(pil.convert('RGB'), size), 'RGB')
                continue
            if pil.mode not in ('RGB', 'L', 'CMYK'):
                continue
            out = io.BytesIO()
            rgb = shrink(pil.convert('RGB') if pil.mode == 'CMYK' else pil, size)
            rgb.save(out, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
            if scale == 1 and len(out.getvalue()) >= len(raw.read_raw_bytes()):
                continue
            raw.write(out.getvalue(), filter=Name.DCTDecode)
            raw.Width, raw.Height = rgb.size
            raw.ColorSpace = Name.DeviceGray if rgb.mode == 'L' else Name.DeviceRGB
            raw.BitsPerComponent = 8
            for k in (Name.DecodeParms, Name.Decode):
                if k in raw:
                    del raw[k]
    pdf.save(dst, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)


if __name__ == '__main__':
    compress(sys.argv[1], sys.argv[2])
