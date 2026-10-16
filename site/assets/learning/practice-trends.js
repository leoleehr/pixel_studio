PixelLearning.register('practice-trends',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root);const log=document.querySelector('.log7'),key='pixel:learning:practice:'+K.course;let col=0,day=0;
 root.prepend(K.el('h3','','練習紀錄趨勢'));
 const cols=log?(log.getAttribute('data-cols')||'').split('|'):[],numeric=cols.map((n,i)=>[i,n]).filter(x=>/秒|次|分鐘|時間/.test(x[1]));
 if(numeric.length){K.select('數值欄位',numeric,v=>{col=+v;draw();},ctl);col=+numeric[0][0];}
 function localDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function series(){if(log&&numeric.length)return Array.from({length:7},(_,d)=>{const e=log.querySelector('[data-k="'+d+'-'+col+'"]'),v=e?e.value.trim():'';const m=v.match(/^(\d+(?:\.\d+)?)\s*(?:秒|次|分鐘|分)?$/);return {label:'第'+(d+1)+'天',value:m?+m[1]:null};});const saved=K.get(key,{});return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const date=localDate(d);return {label:date.slice(5),value:saved[date]?Object.values(saved[date]).filter(Boolean).length:null};});}
 const empty=K.el('p','lt-empty','尚無數值紀錄。填寫紀錄後，這裡會顯示七天趨勢。');root.append(empty);
 const ref=root.closest('.slide')?.querySelector('.lt-reference');
 if(ref)K.button('填寫練習紀錄',()=>{ref.open=true;const field=ref.querySelector('input,textarea');(field||ref).scrollIntoView({block:'center',behavior:'auto'});field?.focus({preventScroll:true});},root);
 else{const link=document.querySelector('article.lesson .links a.main');if(link){const a=K.el('a','btn','前往課堂填寫紀錄');a.href=link.href;root.append(a);}}
 const days=K.el('div','lt-controls');root.append(days);
 function draw(){const points=series(),valid=points.filter(p=>p.value!=null),max=Math.max(1,...valid.map(p=>p.value));plot.hidden=!valid.length;empty.hidden=!!valid.length;K.svg(plot,180,w=>{const l=45,r=w-18,y=v=>130-v/max*95,x=i=>l+i*(r-l)/6;let s=K.text(5,18,log&&numeric.length?cols[col]:'每日作業勾選數');[0,max/2,max].forEach(v=>{s+=K.line(l,y(v),r,y(v))+K.text(l-7,y(v)+4,Number(v.toFixed(1)),'end');});for(let i=0;i<7;i++){const p=points[i];s+=K.text(x(i),158,log?i+1:p.label,'middle');if(p.value!=null){s+='<circle class="lt-mark" cx="'+x(i)+'" cy="'+y(p.value)+'" r="6"/>';if(i&&points[i-1].value!=null)s+='<line x1="'+x(i-1)+'" y1="'+y(points[i-1].value)+'" x2="'+x(i)+'" y2="'+y(p.value)+'" stroke="var(--accent)" stroke-width="2"/>';}}return s;},'七天練習紀錄，縱軸為'+(log&&numeric.length?cols[col]:'每日作業勾選數')+'，缺值留空');if(!days.children.length)points.forEach((p,i)=>{const b=K.button(p.label,()=>{day=i;announce();},days);b.setAttribute('aria-pressed',day===i);});announce();}
 function announce(){const p=series()[day];status.textContent=p.label+'：'+(p.value==null?'尚無有效數值紀錄':p.value+(log&&numeric.length?'（'+cols[col]+'）':' 項作業勾選'));Array.from(days.children).forEach((b,i)=>b.setAttribute('aria-pressed',i===day));}
 if(log)log.addEventListener('input',draw);
 function record(box){const ul=box.closest&&box.closest('.checks[data-id]');if(!ul||box.type!=='checkbox')return;const saved=K.get(key,{}),date=localDate(new Date()),id=location.pathname+':'+ul.dataset.id+':'+Array.from(ul.querySelectorAll('input[type=checkbox]')).indexOf(box);saved[date]=saved[date]||{};saved[date][id]=box.checked;const dates=Object.keys(saved).sort();dates.slice(0,-120).forEach(d=>delete saved[d]);K.set(key,saved);draw();}
 document.addEventListener('change',e=>record(e.target),true);
 document.addEventListener('click',e=>{const li=e.target.closest&&e.target.closest('.checks[data-id] li');if(li)queueMicrotask(()=>{const box=li.querySelector('input[type=checkbox]');if(box)record(box);});});
 addEventListener('storage',e=>{if(e.key===key)draw();});K.note(root,log?'展開下方紀錄表填寫數值，圖表會同步更新；空白與文字心得不補零。':'從實際勾選當日開始記錄，沒有紀錄的日期留空；資料只在這台裝置。');K.watch(plot,draw);draw();
});
