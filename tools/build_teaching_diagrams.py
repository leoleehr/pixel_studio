from pathlib import Path
import base64
root=Path('site/assets/teaching')
head=base64.b64encode((root/'voice-anatomy.jpg').read_bytes()).decode()
photo=base64.b64encode(Path('site/assets/guitar/acoustic-front.jpg').read_bytes()).decode()
style='<style>text{font-family:"Microsoft JhengHei",sans-serif;fill:#f4f4f0} .label{font-size:23px;font-weight:bold}.small{font-size:18px}.muted{fill:#c7d0c1}</style>'
def svg(name,body,w=1000,h=700):
 (root/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{style}<rect width="100%" height="100%" fill="#151916"/>{body}</svg>',encoding='utf-8')
# Clinically sourced head anatomy with separate conceptual labels.
svg('resonance.svg',f'<image href="data:image/jpeg;base64,{head}" x="30" y="30" width="455" height="610" preserveAspectRatio="xMidYMid meet"/><text class="label" x="535" y="85">聲道中的實際構造</text><text class="small" x="535" y="140">鼻腔 Nasal cavity</text><text class="small" x="535" y="184">口腔 Oral cavity</text><text class="small" x="535" y="228">咽腔 Pharyngeal cavity</text><text class="small" x="535" y="272">喉部與聲帶 Larynx / vocal folds</text><path d="M535 310H950" stroke="#6cbb4b" stroke-width="2"/><text class="label" x="535" y="363">歌唱時的振動感受</text><text class="small muted" x="535" y="411">頭部、鼻樑、胸口可能有振動感。</text><text class="small muted" x="535" y="455">感受位置與聲道構造分開理解。</text><text class="small muted" x="535" y="499">胸口不是圖中的另一個聲道腔室。</text><text class="small muted" x="535" y="615">構造圖來源：NIH / NIDCD</text>')
# Air pathway: lungs -> trachea -> vocal folds -> vocal tract.
svg('airflow.svg','''<defs><linearGradient id="lung" x2="1" y2="1"><stop stop-color="#df9b91"/><stop offset="1" stop-color="#994b46"/></linearGradient><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0L8 3L0 6Z" fill="#45b3e6"/></marker></defs>
<path d="M270 530Q220 595 122 566Q84 500 111 376Q143 289 248 263L270 530Z" fill="url(#lung)" stroke="#e9bbb4" stroke-width="3"/><path d="M310 530Q360 595 458 566Q496 500 469 376Q437 289 332 263L310 530Z" fill="url(#lung)" stroke="#e9bbb4" stroke-width="3"/>
<path d="M285 195V320L210 384M295 320L370 384" fill="none" stroke="#bdb8ac" stroke-width="24" stroke-linecap="round"/><path d="M285 199V313L210 379M295 313L370 379" fill="none" stroke="#5f6a63" stroke-width="9"/><g stroke="#75776d" stroke-width="3"><path d="M270 220H303M270 238H303M270 256H303M270 274H303M270 292H303"/></g>
<path d="M114 609Q286 548 464 609" fill="none" stroke="#f4a62a" stroke-width="12"/><path d="M240 425Q280 350 285 170" fill="none" stroke="#45b3e6" stroke-width="5" marker-end="url(#arrow)"/>
<ellipse cx="287" cy="158" rx="39" ry="30" fill="#e0b59d" stroke="#f4f4f0" stroke-width="2"/><path d="M271 153L287 166L303 153" fill="none" stroke="#933f3f" stroke-width="6"/>
<path d="M287 125V80Q300 57 354 69" fill="none" stroke="#45b3e6" stroke-width="5" marker-end="url(#arrow)"/>
<text class="label" x="520" y="120">1 肺部供應氣流</text><text class="label" x="520" y="210">2 氣流經過氣管</text><text class="label" x="520" y="300">3 喉部聲帶振動</text><text class="label" x="520" y="390">4 聲音進入聲道</text><text class="small muted" x="520" y="450">咽腔、口腔與鼻腔改變聲音。</text><text class="small muted" x="520" y="495">橫膈膜與呼吸肌協助肺部通氣。</text><text class="small muted" x="520" y="540">空氣不會先流進腹部或橫膈膜。</text><text class="small" x="120" y="659">橫膈膜（肺部下方）</text><text class="small muted" x="520" y="635">簡化構造示意；依 NIDCD 核對</text>''')
# Sagittal oral construction and controlled tongue gestures.
body=''
for dx,label,path in [(0,'舌尖在前方','M95 352Q134 290 212 318Q276 342 358 334L350 380H100Z'),(500,'舌尖稍向後','M95 352Q125 270 173 258Q194 270 181 297Q234 329 358 334L350 380H100Z')]:
 body+=f'<g transform="translate({dx} 0)"><text class="label" x="70" y="84">{label}</text><path d="M80 190Q193 107 338 183Q399 240 394 338Q355 435 196 440Q103 426 73 370L59 342L77 320L59 295L77 271L69 246Z" fill="#dfb59b" stroke="#f3d6c1" stroke-width="3"/><path d="M94 247Q199 171 344 221L365 342Q244 375 101 351Z" fill="#4d302d"/><path d="M91 244Q222 180 344 221" fill="none" stroke="#f4cabe" stroke-width="17"/><rect x="90" y="249" width="23" height="32" rx="4" fill="#fff4df"/><rect x="92" y="325" width="23" height="24" rx="4" fill="#fff4df"/><path d="{path}" fill="#bf626d" stroke="#f1adb7" stroke-width="3"/><text class="small" x="105" y="483">牙齒、硬顎與舌位的相對關係</text></g>'
body+='<text class="small muted" x="80" y="590">平舌／較後方構形的示意；舌尖輕移，不需用力過度捲曲。</text><text class="small muted" x="80" y="639">外部口型與舌位需配合聆聽、模仿與老師示範。</text>'
svg('tongue.svg',body)
body='<text class="label" x="40" y="45">相對尺寸比較</text>'
for i,(name,scale) in enumerate([('1/4',.55),('1/2',.68),('3/4',.82),('Full',1)]):
 h=510*scale; w=h*.47; x=130+i*230-w/2; y=590-h
 body+=f'<image href="data:image/jpeg;base64,{photo}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"/><text class="label" x="{100+i*230}" y="635">{name}</text>'
body+='<text class="small muted" x="40" y="684">同一外形以相對比例示意；實際琴長依品牌與型號確認。</text>'
svg('sizes.svg',body)
