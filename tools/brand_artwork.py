"""Build deterministic SVG artwork with the official corner logo.

Run after regenerating artwork, then prerender_handbooks.py and reprint PDFs.
Original artwork is retained; no generative edits or image recompression.
"""
from pathlib import Path
import base64, io, json, re, shutil, xml.etree.ElementTree as ET
from PIL import Image, ImageStat, ImageFilter
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'site/assets'
BRAND = ASSETS / 'brand'
SOURCE = Path(r'C:/Agent/UIUX/brand/pixel-studio/01-current/Pixel-Studio-CI-v1/01-logos')

def uri(data, mime):
    return 'data:' + mime + ';base64,' + base64.b64encode(data).decode()

def build():
    logos = {}
    for color in ('black','white'):
        name = f'horizontal-mono-{color}-3600.png'
        target = BRAND / name
        if not target.exists(): shutil.copyfile(SOURCE / name, target)
        # A proportional web-sized copy; original official files remain unchanged.
        im = Image.open(target); im.thumbnail((720,216), Image.Resampling.LANCZOS)
        buf = io.BytesIO(); im.save(buf, format='PNG', optimize=True)
        logos[color] = uri(buf.getvalue(), 'image/png')
    mapping = {}; report = []
    for folder in ('guitar','piano','teaching'):
        for p in sorted((ASSETS/folder).iterdir()):
            if p.suffix not in ('.jpg','.webp','.svg') or '.branded.' in p.name: continue
            original = p.read_bytes()
            if p.suffix == '.svg':
                root = ET.fromstring(original)
                vb = root.get('viewBox','').split()
                w,h = map(float,vb[2:]) if vb else (float(root.get('width')),float(root.get('height')))
                # Existing diagram captions stay clear: reserve a footer inside the new SVG.
                extra = w * .095; out_h = h + extra
                content = re.sub(r'<\?xml[^>]*\?>', '', original.decode('utf-8')).strip()
                color='white';side='right';x=w*.70;y=h+extra*.05;lw=w*.28
                plate=f'<rect y="{h}" width="{w}" height="{extra}" fill="#111315"/>'
            else:
                im=Image.open(p).convert('RGB');w,h=im.size;out_h=h
                lw=w*.28; margin=w*.025;lh=lw*.3
                # Compare corner texture so hands, instruments and faces are less likely covered.
                choices=[]
                for side in ('right','left'):
                    x=w-lw-margin if side=='right' else margin;y=h-lh-margin
                    crop=im.crop((int(x),int(y),int(x+lw),int(y+lh))).convert('L')
                    complexity=ImageStat.Stat(crop.filter(ImageFilter.FIND_EDGES)).mean[0]
                    brightness=ImageStat.Stat(crop).mean[0]
                    choices.append((complexity,side,x,y,brightness))
                complexity,side,x,y,brightness=min(choices,key=lambda c:c[0])
                color='black' if brightness>160 else 'white'
                plate=''
                if complexity>8:
                    pad=w*.009;fill='#ffffff' if color=='black' else '#111315'
                    plate=f'<rect x="{x-pad}" y="{y-pad}" width="{lw+pad*2}" height="{lh+pad*2}" rx="{pad*.5}" fill="{fill}"/>'
                content=f'<image width="{w}" height="{h}" href="{uri(original,"image/jpeg" if p.suffix==".jpg" else "image/webp")}"/>'
            logo=f'<image x="{x}" y="{y}" width="{lw}" height="{lw*.3}" href="{logos[color]}"/>'
            out=p.with_name(p.stem+'.branded.svg')
            out.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{out_h}" viewBox="0 0 {w} {out_h}">{content}{plate}{logo}</svg>\n',encoding='utf-8',newline='\n')
            mapping[p.name]=out.name
            report.append({'source':p.relative_to(ROOT).as_posix(),'output':out.relative_to(ROOT).as_posix(),'corner':side,'logo':color})
    # Only references change, never the original artwork generators.
    files=list((ROOT/'site').rglob('*'))+list((ROOT/'tools/decks').rglob('*.html'))+list((ROOT/'tools/piano').rglob('*.html'))+list((ROOT/'tools/songwriting').rglob('*.html'))+[ROOT/'tools/teaching_visuals_manifest.json']
    for p in files:
        if p.suffix not in ('.html','.js','.css','.json','.md'): continue
        text=p.read_text(encoding='utf-8');updated=text
        for old,new in mapping.items():
            updated=re.sub(r'(?<![\w.-])'+re.escape(old)+r'(?![\w.-])',lambda m:new,updated)
        if p.name == 'guitar.js':
            updated = updated.replace("names[b.id] + '.webp", "names[b.id] + '.branded.svg")
            updated = updated.replace("file + '-photo.jpg", "file + '-photo.branded.svg")
            updated = updated.replace("it[0] + '-photo.jpg", "it[0] + '-photo.branded.svg")
        if updated!=text:p.write_text(updated,encoding='utf-8',newline='\n')
    (ROOT/'tools/artwork_branding_manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('Branded',len(report),'artworks')
if __name__=='__main__':build()
