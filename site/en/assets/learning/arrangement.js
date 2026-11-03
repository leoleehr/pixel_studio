PixelLearning.register('arrangement',(root,K)=>{
 const ctl=K.shell(root),matrix=K.el('div','lt-matrix'),status=K.status(root),saved=K.el('p','lt-note');root.insertBefore(matrix,status);root.append(saved);
 const keys=['mr','sr','lead','fill','pad'],labels=['Main groove','Secondary groove','Melody','Fill','Pad'],storageKey='pixel:songwriting:learning-arrangements:v1';
 const demo=[['Intro',['sr']],['Verse',['mr','sr','lead']],['Pre-chorus',['mr','sr','lead','pad']],['Chorus',keys.slice()],['Outro',['sr','pad']]];
 const valid=s=>Array.isArray(s)&&s.length>0&&s.length<=100&&s.every(r=>Array.isArray(r)&&typeof r[0]==='string'&&Array.isArray(r[1])&&r[1].every(k=>keys.includes(k)));
 let profiles=K.get(storageKey,{});if(!profiles||typeof profiles!=='object'||Array.isArray(profiles))profiles={};
 Object.keys(profiles).forEach(k=>{if(!profiles[k]||!valid(profiles[k].sections))delete profiles[k];});
 if(!profiles.demo)profiles.demo={label:'Five-section demo',sections:demo};
 let active=K.get(storageKey+':active','demo');if(!profiles[active])active='demo';
 let sections=profiles[active].sections,current=0,timer;
 const old=document.querySelector('.arranger'),api=old&&old.pixelArrangement;
 function stop(){clearTimeout(timer);if(api)api.stop();}
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify(profiles));localStorage.setItem(storageKey+':active',JSON.stringify(active));saved.textContent='Saved in this browser. Reopen the page to keep editing.';}catch(e){saved.textContent='This browser can\'t save, so changes only last until you leave the page.';}}
 const profile=K.select('Layout',[],v=>{stop();active=v;sections=profiles[v].sections;current=0;options();persist();draw();},ctl);
 const select=K.select('Preview section',[],v=>{stop();current=+v;draw();},ctl);
 function options(){profile.replaceChildren();Object.keys(profiles).forEach(k=>profile.add(new Option(profiles[k].label,k)));profile.value=active;select.replaceChildren();sections.forEach((s,i)=>select.add(new Option((i+1)+'. '+s[0],i)));}
 function draw(focus){matrix.replaceChildren();const head=K.el('div','lt-matrix-headers');head.append(K.el('span','','Section'));labels.forEach(x=>head.append(K.el('span','',x)));matrix.append(head);
  sections.forEach((s,i)=>{const row=K.el('div','lt-matrix-row'+(i===current?' is-current':''));const pick=K.button((i+1)+'. '+s[0],()=>{stop();current=i;draw('pick-'+i);},row);pick.classList.add('lt-section-label');pick.dataset.cell='pick-'+i;pick.setAttribute('aria-pressed',i===current);
   keys.forEach((k,j)=>{const on=s[1].includes(k),b=K.button('',()=>{stop();current=i;const at=s[1].indexOf(k);if(at<0)s[1].push(k);else s[1].splice(at,1);persist();draw(i+'-'+k);},row);b.append(K.el('span','lt-track-label',labels[j]),K.el('span','',on?'On':'Off'));b.dataset.cell=i+'-'+k;b.setAttribute('aria-label',s[0]+' '+labels[j]);b.setAttribute('aria-pressed',on);});matrix.append(row);});
  select.value=current;status.textContent=(current+1)+'. '+sections[current][0]+': '+(sections[current][1].map(k=>labels[keys.indexOf(k)]).join(', ')||'All parts off');
  if(focus)matrix.querySelector('[data-cell="'+focus+'"]')?.focus({preventScroll:true});}
 K.button('Hear this section',()=>{K.stopAll();stop();if(!api){status.textContent='Please preview with the arrangement mixer on the previous slide.';return;}api.select(sections[current][1]);api.play();timer=setTimeout(stop,60/92*16*1000);},ctl,true);K.button('Stop',stop,ctl);
 K.button('Load form blocks',()=>{stop();const s=K.get('pixel:songwriting:form-mine',null)||K.get('pixel:songwriting:form-main',null);if(!s||!Array.isArray(s.list)||!s.list.length||s.list.length>100){status.textContent='No form available yet. Keeping the current layout.';return;}
  const names={intro:'Intro',verse:'Verse',pre:'Pre-chorus',chorus:'Chorus',inter:'Interlude',bridge:'Bridge',outro:'Outro',ending:'Ending',tag:'Break line'};
  const id='form:'+JSON.stringify(s.list.map(p=>[p.k,p.bars||p.b||0]));
  if(!profiles[id])profiles[id]={label:'Form: '+s.list.map(p=>names[p.k]||p.k).join('→'),sections:s.list.map(p=>[names[p.k]||String(p.k),p.k==='chorus'?keys.slice():p.k==='verse'?['mr','sr','lead']:['sr','lead']])};
  active=id;sections=profiles[id].sections;current=0;options();persist();draw();status.textContent='Switched to the form layout. Your previous layout is kept and you can switch back under "Layout".';},ctl);
 K.onStop(root,stop);K.note(root,'Pick a section first, then toggle parts. Previews use the C→Am→F→G material; each form\'s layout is saved separately.');options();draw();persist();
});
