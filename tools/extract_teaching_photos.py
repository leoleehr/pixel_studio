"""Extract individually named teaching assets from a generated contact sheet."""
import argparse
from pathlib import Path
from PIL import Image
p=argparse.ArgumentParser(); p.add_argument('source'); p.add_argument('--cols',type=int,required=True); p.add_argument('--rows',type=int,required=True); p.add_argument('--names',required=True); p.add_argument('--quality',type=int,default=87); p.add_argument('--output'); p.add_argument('--x-cuts'); p.add_argument('--y-cuts'); a=p.parse_args()
names=a.names.split(','); assert len(names)==a.cols*a.rows
im=Image.open(a.source).convert('RGB'); out=Path(a.output) if a.output else Path(__file__).resolve().parent.parent/'site/assets/teaching'; out.mkdir(parents=True,exist_ok=True)
def boundaries(length, count, horizontal):
 result=[0]
 for n in range(1,count):
  center=round(n*length/count); scores=[]
  for pos in range(max(0,center-64),min(length,center+65)):
   pixels=[im.getpixel((x,pos) if horizontal else (pos,x)) for x in range(0,im.width if horizontal else im.height,4)]
   scores.append((sum(min(v)>225 for v in pixels)/len(pixels),pos))
  best=max(scores)
  near=[pos for score,pos in scores if score>=best[0]-.02]
  result.append(round(sum(near)/len(near)) if best[0]>.8 else center)
 return result+[length]
xs=list(map(int,a.x_cuts.split(','))) if a.x_cuts else boundaries(im.width,a.cols,False); ys=list(map(int,a.y_cuts.split(','))) if a.y_cuts else boundaries(im.height,a.rows,True)
assert len(xs)==a.cols+1 and len(ys)==a.rows+1
for i,name in enumerate(names):
 if name=='-': continue
 c=i%a.cols; r=i//a.cols
 tile=im.crop((xs[c]+4,ys[r]+4,xs[c+1]-4,ys[r+1]-4))
 tile.thumbnail((1100,1100),Image.Resampling.LANCZOS)
 tile.save(out/(name+'.webp'),quality=a.quality,method=6)
 print(name,tile.size)
