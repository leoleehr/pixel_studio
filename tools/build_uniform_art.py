"""Build native SVG shirt applications from edited photos and the exact CI logo.
Image edits are made with imagegen; this builder keeps photo pixels intact.
"""
import base64,io,json,pathlib,re
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent
RAW=ROOT/'.qa/uniform/raw'
LOGO=ROOT/'site/assets/brand/horizontal-transparent.svg'
MANIFEST=ROOT/'tools/uniform_art_manifest.json'
def main():
 logo=base64.b64encode(LOGO.read_bytes()).decode()
 for r in json.loads(MANIFEST.read_text(encoding='utf8')):
  target=ROOT/r['src'];name=target.stem.removesuffix('-uniform');raw=RAW/(name+'.webp')
  if raw.exists():photo=raw.read_bytes()
  else:photo=base64.b64decode(re.search(r'data:image/webp;base64,([^\"]+)',target.read_text(encoding='utf8'))[1])
  w,h=Image.open(io.BytesIO(photo)).size;ow,oh=r['photo_size']
  parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>Pixel Studio 教學示範</title>',f'<image width="{w}" height="{h}" href="data:image/webp;base64,{base64.b64encode(photo).decode()}"/>']
  if name=='voice-chest':parts.append(f'<defs><mask id="shirt-mask"><rect width="100%" height="100%" fill="white"/><path transform="scale({w/451},{h/394})" d="M0 0H330V300L280 333L230 351L185 373L158 394H0Z" fill="black"/></mask></defs><g mask="url(#shirt-mask)">')
  for aa,bb,cc,dd in r['shirt_print_bounds']:
   a,b,c,d=aa*w/ow,bb*h/oh,cc*w/ow,dd*h/oh
   bw,bh=c-a,d-b;lw=min(bw,bh/0.3)*r.get("logo_scale",1);lh=lw*.3
   if name in ["vowel-e","vowel-o"]:lw=140*w/ow;lh=lw*.3
   parts.append(f'<image x="{a+(bw-lw)/2:.2f}" y="{b+(bh-lh)/2:.2f}" width="{lw:.2f}" height="{lh:.2f}" href="data:image/svg+xml;base64,{logo}"/>')
  if name=='voice-chest':parts.append('</g>')
  parts.append('</svg>');target.write_text(''.join(parts)+'\n',encoding='utf8',newline='\n');print(name,w,h)
if __name__=='__main__':main()
