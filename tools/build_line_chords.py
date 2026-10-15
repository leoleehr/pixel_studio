"""Build simple editable chord diagrams; no photographic fingerboard or finger cutouts."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'site/assets/teaching'
SHAPES={
 'c':('C',{6:'x',5:3,4:2,3:0,2:1,1:0},[(5,3,3),(4,2,2),(2,1,1)]),
 'am':('Am',{6:'x',5:0,4:2,3:2,2:1,1:0},[(4,2,2),(3,2,3),(2,1,1)]),
 'd':('D',{6:'x',5:'x',4:0,3:2,2:3,1:2},[(3,2,1),(2,3,3),(1,2,2)]),
 'g':('G',{6:3,5:2,4:0,3:0,2:0,1:3},[(6,3,2),(5,2,1),(1,3,3)]),
 'small-f':('小 F',{6:'x',5:'x',4:3,3:2,2:1,1:1},[(4,3,3),(3,2,2)])}
def build():
 for key,(name,strings,fingers) in SHAPES.items():
  out=['<svg xmlns="http://www.w3.org/2000/svg" width="800" height="640" viewBox="0 0 800 640">', '<rect width="800" height="640" fill="#151916"/>','<g font-family="Microsoft JhengHei,Arial,sans-serif" fill="#f4f4f0">',f'<text x="42" y="54" font-size="29" font-weight="700">{name}｜指板與指位</text>','<text x="42" y="94" font-size="19" fill="#c7d0c1">上方為 6 弦，下方為 1 弦；手指靠近右側琴衍</text>']
  for fret in range(6):
   x=160+fret*112;out.append(f'<path d="M{x} 145V475" stroke="#d7ddd5" stroke-width="{7 if fret==0 else 2}"/>')
   if fret:out.append(f'<text x="{x-56}" y="520" text-anchor="middle" font-size="22">{fret}</text>')
  for string in range(6,0,-1):
   y=150+(6-string)*64;out.append(f'<path d="M160 {y}H720" stroke="#d7ddd5" stroke-width="2"/><text x="42" y="{y+8}" font-size="23">{string} 弦</text>')
   if strings[string] in ['x',0]:out.append(f'<text x="123" y="{y+8}" text-anchor="middle" font-size="25">{"×" if strings[string]=="x" else "○"}</text>')
  for string,fret,finger in fingers:
   x=160+(fret-.27)*112;y=150+(6-string)*64
   out.append(f'<circle cx="{x}" cy="{y}" r="23" fill="#6cbb4b"/><text x="{x}" y="{y+8}" text-anchor="middle" font-size="23" font-weight="700" fill="#10200b">{finger}</text>')
  if key=='small-f':out.append('<path d="M241.76 406V470" stroke="#6cbb4b" stroke-width="38" stroke-linecap="round"/><text x="241.76" y="446" text-anchor="middle" fill="#10200b" font-size="23" font-weight="700">1</text>')
  out.append('<text x="42" y="586" font-size="19" fill="#c7d0c1">指法：1 食指　2 中指　3 無名指　4 小指</text></g></svg>')
  (ROOT/f'chord-{key}.svg').write_text(''.join(out)+'\n',encoding='utf-8',newline='\n')
if __name__=='__main__':build()
