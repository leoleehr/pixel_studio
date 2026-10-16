PixelLearning.register('practice-trends',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root);const log=document.querySelector('.log7'),key='pixel:learning:practice:'+K.course;let col=0,day=0;
 root.prepend(K.el('h3','','練習紀錄趨勢'));
 const cols=log?(log.getAttribute('data-cols')||'').split('|'):[],numeric=cols.map((n,i)=>[i,n]).filter(x=>/秒|次|分鐘|時間/.test(x[1]));
 if(numeric.length){K.select('數值欄位',numeric,v=>{col=+v;draw();},ctl);col=+numeric[0][0];}
 function localDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function series(){if(log&&numeric.length)return Array.from({length:7},(_,d)=>{const e=log.querySelector('[data-k="'+d+'-'+col+'"]'),v=e?e.value.trim():'';const m=v.match(/^(\d+(?:\.\d+)?)\s*(?:秒|次|分鐘|分)?$/);return {label:'第'+(d+1)+'天',value:m?+m[1]:null};});const saved=K.get(key,{});return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const date=localDate(d);return {label:date.slice(5),value:saved[date]?Object.values(saved[date]).filter(Boolean).length:null};});}
 const days=K.el('div','lt-controls');root.append(days);
 function draw(){const points=series(),valid=points.filter(p=>p.value!=null),max=Math.max(1,...valid.map(p=>p.value));K.svg(plot,170,w=>{const l=40,r=w-15,y=v=>125-v/max*95,x=i=>l+i*(r-l)/6;let s=K.text(5,20,log&&numeric.length?cols[col]:'每日作業勾選數')+K.line(l,125,r,125);for(let i=0;i<7;i++){const p=points[i];s+=K.text(x(i),150,log?i+1:p.label,'middle');if(p.value!=null){s+='<circle class="lt-mark" cx="'+x(i)+'" cy="'+y(p.value)+'" r="6"/>';if(i&&points[i-1].value!=null)s+='<line x1="'+x(i-1)+'" y1="'+y(points[i-1].value)+'" x2="'+x(i)+'" y2="'+y(p.value)+'" stroke="var(--accent)" stroke-width="2"/>';}}return s;},'七天練習紀錄，缺值留空');days.replaceChildren();points.forEach((p,i)=>{const b=K.button(p.label,()=>{day=i;announce();},days);b.setAttribute('aria-pressed',day===i);});announce();}
 function announce(){const p=series()[day];status.textContent=p.label+'：'+(p.value==null?'尚無有效數值紀錄':p.value+(log&&numeric.length?'（'+cols[col]+'）':' 項作業勾選'));Array.from(days.children).forEach((b,i)=>b.setAttribute('aria-pressed',i===day));}
 if(log)log.addEventListener('input',draw);
 function record(box){const ul=box.closest&&box.closest('.checks[data-id]');if(!ul||box.type!=='checkbox')return;const saved=K.get(key,{}),date=localDate(new Date()),id=location.pathname+':'+ul.dataset.id+':'+Array.from(ul.querySelectorAll('input[type=checkbox]')).indexOf(box);saved[date]=saved[date]||{};saved[date][id]=box.checked;const dates=Object.keys(saved).sort();dates.slice(0,-120).forEach(d=>delete saved[d]);K.set(key,saved);draw();}
 document.addEventListener('change',e=>record(e.target),true);
 document.addEventListener('click',e=>{const li=e.target.closest&&e.target.closest('.checks[data-id] li');if(li)queueMicrotask(()=>{const box=li.querySelector('input[type=checkbox]');if(box)record(box);});});
 addEventListener('storage',e=>{if(e.key===key)draw();});K.note(root,log?'沿用上方紀錄表；只繪製有效數字，空白與文字心得不補零。':'從實際勾選當日開始記錄，沒有紀錄的日期留空；資料只在這台裝置。');K.watch(plot,draw);draw();
});
