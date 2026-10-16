PixelLearning.register('arrangement',(root,K)=>{
 const ctl=K.shell(root),matrix=K.el('div','lt-matrix'),status=K.status(root),saved=K.el('p','lt-note');root.insertBefore(matrix,status);root.append(saved);
 const keys=['mr','sr','lead','fill','pad'],labels=['主律動','副律動','主旋律','過門','襯底'],storageKey='pixel:songwriting:learning-arrangements:v1';
 const demo=[['前奏',['sr']],['主歌',['mr','sr','lead']],['前副歌',['mr','sr','lead','pad']],['副歌',keys.slice()],['尾奏',['sr','pad']]];
 const valid=s=>Array.isArray(s)&&s.length>0&&s.length<=100&&s.every(r=>Array.isArray(r)&&typeof r[0]==='string'&&Array.isArray(r[1])&&r[1].every(k=>keys.includes(k)));
 let profiles=K.get(storageKey,{});if(!profiles||typeof profiles!=='object'||Array.isArray(profiles))profiles={};
 Object.keys(profiles).forEach(k=>{if(!profiles[k]||!valid(profiles[k].sections))delete profiles[k];});
 if(!profiles.demo)profiles.demo={label:'五段示範',sections:demo};
 let active=K.get(storageKey+':active','demo');if(!profiles[active])active='demo';
 let sections=profiles[active].sections,current=0,timer;
 const old=document.querySelector('.arranger'),api=old&&old.pixelArrangement;
 function stop(){clearTimeout(timer);if(api)api.stop();}
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify(profiles));localStorage.setItem(storageKey+':active',JSON.stringify(active));saved.textContent='已儲存在此瀏覽器；重新開啟可繼續編輯。';}catch(e){saved.textContent='此瀏覽器無法儲存，目前修改只保留到離開頁面。';}}
 const profile=K.select('配置',[],v=>{stop();active=v;sections=profiles[v].sections;current=0;options();persist();draw();},ctl);
 const select=K.select('試聽段落',[],v=>{stop();current=+v;draw();},ctl);
 function options(){profile.replaceChildren();Object.keys(profiles).forEach(k=>profile.add(new Option(profiles[k].label,k)));profile.value=active;select.replaceChildren();sections.forEach((s,i)=>select.add(new Option((i+1)+'. '+s[0],i)));}
 function draw(focus){matrix.replaceChildren();const head=K.el('div','lt-matrix-headers');head.append(K.el('span','','段落'));labels.forEach(x=>head.append(K.el('span','',x)));matrix.append(head);
  sections.forEach((s,i)=>{const row=K.el('div','lt-matrix-row'+(i===current?' is-current':''));const pick=K.button((i+1)+'. '+s[0],()=>{stop();current=i;draw('pick-'+i);},row);pick.classList.add('lt-section-label');pick.dataset.cell='pick-'+i;pick.setAttribute('aria-pressed',i===current);
   keys.forEach((k,j)=>{const on=s[1].includes(k),b=K.button('',()=>{stop();current=i;const at=s[1].indexOf(k);if(at<0)s[1].push(k);else s[1].splice(at,1);persist();draw(i+'-'+k);},row);b.append(K.el('span','lt-track-label',labels[j]),K.el('span','',on?'開啟':'關閉'));b.dataset.cell=i+'-'+k;b.setAttribute('aria-label',s[0]+' '+labels[j]);b.setAttribute('aria-pressed',on);});matrix.append(row);});
  select.value=current;status.textContent=(current+1)+'. '+sections[current][0]+'：'+(sections[current][1].map(k=>labels[keys.indexOf(k)]).join('、')||'所有聲部關閉');
  if(focus)matrix.querySelector('[data-cell="'+focus+'"]')?.focus({preventScroll:true});}
 K.button('聽這個段落',()=>{K.stopAll();stop();if(!api){status.textContent='請使用前一張的編曲混音台試聽。';return;}api.select(sections[current][1]);api.play();timer=setTimeout(stop,60/92*16*1000);},ctl,true);K.button('停止',stop,ctl);
 K.button('讀取曲式積木',()=>{stop();const s=K.get('pixel:songwriting:form-mine',null)||K.get('pixel:songwriting:form-main',null);if(!s||!Array.isArray(s.list)||!s.list.length||s.list.length>100){status.textContent='尚無可用曲式，保留目前配置。';return;}
  const names={intro:'前奏',verse:'主歌',pre:'前副歌',chorus:'副歌',inter:'間奏',bridge:'橋段',outro:'尾奏',ending:'結尾',tag:'破格句'};
  const id='form:'+JSON.stringify(s.list.map(p=>[p.k,p.bars||p.b||0]));
  if(!profiles[id])profiles[id]={label:'曲式：'+s.list.map(p=>names[p.k]||p.k).join('→'),sections:s.list.map(p=>[names[p.k]||String(p.k),p.k==='chorus'?keys.slice():p.k==='verse'?['mr','sr','lead']:['sr','lead']])};
  active=id;sections=profiles[id].sections;current=0;options();persist();draw();status.textContent='已切換至曲式配置；先前配置仍保留，可由「配置」切換。';},ctl);
 K.onStop(root,stop);K.note(root,'先選段落，再切換聲部。試聽沿用C→Am→F→G素材；不同曲式的配置分別保存。');options();draw();persist();
});
