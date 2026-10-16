"""Create printable key states from the live teaching tools and link their lessons.

Requires a local preview at 127.0.0.1:8780. The original teaching tables remain intact.
"""
from pathlib import Path
import html
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENTRIES = [
 ('breathing','vocal','slides/lesson-02/',2,'呼吸拍點','4拍吸氣、8拍吐氣。快吸慢吐的暫停與吐氣長度，可由老師調整。'),
 ('chord-path','guitar','ch03/',3,'換和弦路徑','C→Am：食指與中指留在原位，無名指由5弦3格移到3弦2格。實際移動時先離弦。'),
 ('voice-leading','piano','p04/',4,'最近音連接','C→F→G→C可比較原位與就近連接。C→F保留C4，E4到F4、G4到A4。'),
 ('tone-melody','songwriting','s03/',3,'字調與旋律','字調與旋律的方向可疊圖比較；方向不同時需回到字義及整句試唱，不能只憑曲線判定。'),
 ('word-ending','vocal','slides/lesson-04/',4,'長音收尾','母音先延續，再清楚收尾；愛由a轉i、心以舌尖收n、星以舌根收ng。收音時點可依示範調整。'),
 ('bass-map','guitar','ch05/',5,'根音與交替低音','依和弦找出根音與另一個和弦音。C/E等交替方式不一律是五度，仍以教材指法為準。'),
 ('dual-hands','piano','p03/',3,'雙手同步指法','C大調上行，右手在F穿指，左手在A跨指；兩個動作並不同時發生。'),
 ('arrangement','songwriting','s07/',7,'段落配器','以段落對照主律動、副律動、主旋律、過門與襯底；可以讀取自己的曲式積木，按曲式分別儲存配置，再試聽聲部差別。'),
 ('accompaniment','guitar','ch05/',5,'按拍號選伴奏','先選拍號，再以相同和弦比較速度與伴奏型；推薦不是唯一正解。'),
 ('accompaniment','piano','p06/',6,'按拍號選伴奏','同一組C和弦可依拍號比較本課既有的伴奏型，避免只憑BPM決定風格。'),
 ('rhetoric','songwriting','s04/',4,'句內修辭標記','類疊看重複詞，頂真看前尾接後頭，映襯看對照片語。網站以原創短句提供選擇與標記。'),
]

def static_svg(root, title, text):
    svg = root.locator('.lt-chart svg')
    if svg.count():
        markup = svg.first.evaluate('(e)=>e.outerHTML')
        style = '<style>text{fill:#111315;font:14px Arial,"Microsoft JhengHei",sans-serif}.lt-grid{stroke:#8b9097;stroke-width:1}.lt-mark{fill:#6cbb4b}.lt-dot-label{fill:#111315;font-weight:bold}</style>'
        markup = re.sub(r'<svg\b', '<svg xmlns="http://www.w3.org/2000/svg" style="--ink:#111315;--accent:#6cbb4b;--muted:#8b9097;--lt-fill:#e2efdc"', markup, count=1)
        markup = markup.replace('>', '>'+style, 1)
        return markup
    # Non-chart tools: preserve their actual selected cells/phrases as an accessible diagram.
    if root.locator('.lt-matrix').count():
        rows=[['段落','主律動','副律動','主旋律','過門','襯底'],['前奏','—','有','—','—','—'],['主歌','有','有','有','—','—'],['前副歌','有','有','有','—','有'],['副歌','有','有','有','有','有'],['尾奏','—','有','—','—','有']]
        body=''.join(f'<text x="{15+c*94}" y="{35+r*34}">{html.escape(v)}</text>' for r,row in enumerate(rows) for c,v in enumerate(row))
        return '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="215" viewBox="0 0 600 215"><style>text{font:15px Arial,"Microsoft JhengHei",sans-serif;fill:#111315}</style>'+body+'</svg>'
    spans = root.locator('.lt-steps .lt-step')
    words = spans.all_text_contents() if spans.count() else [root.locator('.lt-status').first.inner_text()]
    lines=[];line=''
    for word in words:
        if len(line)+len(word)>25:lines.append(line);line=''
        line+=('　' if line else '')+word
    if line:lines.append(line)
    body=''.join(f'<text x="16" y="{32+i*30}">{html.escape(s)}</text>' for i,s in enumerate(lines))
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="{max(70,len(lines)*30+25)}" viewBox="0 0 600 {max(70,len(lines)*30+25)}"><style>text{{font:17px Arial,"Microsoft JhengHei",sans-serif;fill:#111315}}</style>{body}</svg>'

def build():
    asset=ROOT/'site/assets/learning/print';asset.mkdir(exist_ok=True)
    notes={}
    with sync_playwright() as pw:
        browser=pw.chromium.launch(channel='chrome',headless=True)
        page=browser.new_page(viewport={'width':1200,'height':900})
        for feature,course,route,chapter,title,description in ENTRIES:
            page.goto(f'http://127.0.0.1:8780/{course}/{route}',wait_until='domcontentloaded')
            page.wait_for_selector(f'[data-learning="{feature}"][data-ready="1"]')
            root=page.locator(f'[data-learning="{feature}"]')
            n=root.evaluate('(e)=>[...document.querySelectorAll(".slide")].indexOf(e.closest(".slide"))+1')
            page.evaluate('(n)=>location.hash="#"+n',n);page.wait_for_timeout(150)
            if feature=='chord-path':root.get_by_role('button',name='Am',exact=True).click()
            if feature=='voice-leading':root.locator('select').select_option('1')
            if feature=='dual-hands':root.locator('input[type=range]').fill('3')
            if feature=='breathing':root.locator('select').select_option('slow')
            if feature=='word-ending':root.locator('input[type=range]').fill('100')
            if feature=='rhetoric':root.get_by_role('button',name='類疊',exact=True).click()
            if root.locator('.lt-chart').count():
                root.locator('.lt-chart').evaluate('(e)=>e.style.width="460px"')
                page.wait_for_timeout(80)
            filename=f'{course}-{feature}.svg';(asset/filename).write_text(static_svg(root,title,description),encoding='utf-8')
            block=f'<div class="learning-book-block"><h4>{title}</h4><p>{description}</p><figure class="learning-print"><img src="../assets/learning/print/{filename}" alt="{title}的關鍵狀態圖" loading="eager"><figcaption>{title}｜關鍵狀態</figcaption></figure><p><a href="{route}#{n}">開啟互動練習</a></p></div>\n'
            notes.setdefault((course,chapter),[]).append(block)
        browser.close()
    for course in ['vocal','guitar','piano','songwriting']:
        path=ROOT/'site'/course/('course-handbook.md' if course=='vocal' else 'handbook.md')
        md=path.read_text(encoding='utf-8')
        md=re.sub(r'\n?<!-- learning-notes-start -->.*?<!-- learning-notes-end -->\n?', '\n',md,flags=re.S)
        parts=re.split(r'(?=^## )',md,flags=re.M)
        nums={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'十一':11,'十二':12}
        for i,part in enumerate(parts):
            m=re.match(r'## 第(十一|十二|十|[一二三四五六七八九])(?:章|堂)',part)
            if m:
                blocks=notes.get((course,nums[m[1]]),[])
                if blocks:
                    blocks=blocks.copy();blocks[0]=blocks[0].replace('<h4>','<h3>互動練習與圖解</h3><h4>',1)
                    parts[i]=part.rstrip()+'\n\n<!-- learning-notes-start -->\n'+''.join(blocks)+'\n<!-- learning-notes-end -->\n\n'
            elif re.match(r'## 課程總覽',part):
                parts[i]=part.rstrip()+'\n\n<!-- learning-notes-start -->\n### 能力路線與練習紀錄\n\n[開啟課程能力路線](index.html#lessons)：各堂課卡片整合建議先備與本機作業勾選，另可展開課程路線總覽。網站練習紀錄圖沿用原七天表格，缺值保留空白，秒數、次數與分鐘分開檢視。PDF保留本表作書面紀錄，不填入示範成績。\n\n<!-- learning-notes-end -->\n\n'
        path.write_text(''.join(parts),encoding='utf-8',newline='\n')
    print('Updated four handbooks and',len(ENTRIES),'key-state diagrams')

if __name__=='__main__':build()
