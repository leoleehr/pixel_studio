"""Build every two-stage guitar fingerboard diagram in the shared line-and-dot style."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'site/assets/teaching'
INK='#f4f4f0';GREEN='#6cbb4b'
SPECS={
 'hammer-sequence':('搥弦｜較高格手指落下','1　食指按住低格，另一指在高格上方準備','2　另一指落弦，食指保持原位','hammer'),
 'pull-sequence':('勾弦｜較高格手指輕勾離弦','1　低格與高格手指先按住同一條弦','2　高格手指輕勾離弦，低格手指保留','pull'),
 'slide-sequence':('滑弦｜沿同一條弦移動','1　按弦後撥出聲音','2　保持接觸，沿同一條弦滑至較高格','slide'),
 'bend-motion':('推弦與鬆弦｜食指側向改變琴弦張力','1　食指按住琴弦，琴頸保持平直','2　食指小幅側推琴弦，再沿原路鬆回','bend'),
 'vibrato-motion':('揉音｜食指小幅往返','1　食指按住琴弦，其他手指放鬆','2　食指小幅推揉後返回，琴頸保持平直','vibrato')}
def finger(x,y,n,ghost=False):
 return f'<circle cx="{x}" cy="{y}" r="16" fill="{GREEN if not ghost else "#151916"}" stroke="{GREEN}" stroke-width="2"{chr(32)+"stroke-dasharray=\"4 3\"" if ghost else ""}/><text x="{x}" y="{y+6}" text-anchor="middle" font-size="18" font-weight="700" fill="{INK if ghost else "#10200b"}">{n}</text>'
def arrow(x1,y1,x2,y2):return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{GREEN}" stroke-width="4" marker-end="url(#arrow)"/>'
def build():
 for name,(title,one,two,kind) in SPECS.items():
  s=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="670" viewBox="0 0 1000 670"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L7 3L0 6Z" fill="#6cbb4b"/></marker></defs><rect width="1000" height="670" fill="#151916"/><g font-family="Microsoft JhengHei,Arial,sans-serif" fill="#f4f4f0">',f'<text x="40" y="48" font-size="29" font-weight="700">{title}</text>','<text x="40" y="80" font-size="19" fill="#c7d0c1">上方為 6 弦，下方為 1 弦；圓點內為手指編號</text>']
  for step,label in enumerate([one,two]):
   top=155+step*245;y=top+60;d=0
   if step and kind=='bend':d=-12
   if step and kind=='vibrato':d=-6
   s.append(f'<text x="40" y="{top-40}" font-size="22">{label}</text>')
   for f in range(6):
    x=150+f*156;s.append(f'<path d="M{x} {top}V{top+100}" stroke="#c7d0c1" stroke-width="{5 if f==0 else 2}"/>')
    if f:s.append(f'<text x="{x-78}" y="{top+128}" text-anchor="middle" font-size="18">{f}</text>')
   for string in range(6,0,-1):
    yy=top+(6-string)*20
    path=f'M150 {yy}H930'
    if string==3 and d:path=f'M150 {yy}L410 {yy}Q571 {yy+d*2} 730 {yy}L930 {yy}'
    s.append(f'<path d="{path}" fill="none" stroke="#d7ddd5" stroke-width="2"/><text x="82" y="{yy+6}" font-size="18">{string} 弦</text>')
   x1=259.2;x3=571.2
   if kind in ('hammer','pull'):
    s.append(finger(x1,y,1));raised=(step==0 if kind=='hammer' else step==1);s.append(finger(x3,y-26 if raised else y,3,raised));s.append(arrow(x3+35,y-35 if kind=='hammer' else y+4,x3+35,y-4 if kind=='hammer' else y-35))
   elif kind=='slide':
    s.append(finger(x1 if not step else x3,y,1));s.append(arrow(400,top-18,560,top-18))
   else:
    s.append(finger(x3,y+d,1))
    if step:
     s.append(arrow(x3+38,y+8,x3+38,y-26))
     if kind=='vibrato':s.append(arrow(x3+65,y-26,x3+65,y+8))
  s.append('<text x="40" y="620" font-size="19" fill="#c7d0c1">指位與動作方向示意；琴頸與琴衍保持原形，只有琴弦受手指帶動。</text></g></svg>')
  (ROOT/(name+'.svg')).write_text(''.join(s)+'\n',encoding='utf-8',newline='\n')
if __name__=='__main__':build()
