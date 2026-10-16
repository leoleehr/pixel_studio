/* Twelve progressive enhancements, loaded per lesson. No original content removed. */
(function(){
 'use strict';
 const script=document.currentScript,base=new URL('learning/',script.src),version=new URL(script.src).search;
 const path=location.pathname,course=(path.match(/\/(vocal|guitar|piano|songwriting)(?:\/|$)/)||[])[1];
 if(!course)return;
 const definitions=[
 ['breathing',/vocal\/slides\/lesson-02/,'四種呼吸，對應四種歌曲'],
 ['chord-path',/guitar\/ch03/,'提早準備，換和弦才會快'],
 ['voice-leading',/piano\/p04/,'轉位讓右手少移動'],
 ['tone-melody',/songwriting\/s03/,'國語有四個聲調'],
 ['word-ending',/vocal\/slides\/lesson-04/,'長音的最後一刻'],
 ['bass-map',/guitar\/ch05/,'「蹦」：彈奏和弦名稱'],
 ['dual-hands',/piano\/p03/,'雙手同時彈奏'],
 ['arrangement',/songwriting\/s07/,'樂器配置由少漸多'],
 ['accompaniment',/guitar\/ch05|piano\/p06/,'先聆聽'],
 ['rhetoric',/songwriting\/s04/,'類疊、層遞']
 ];
 const pending={},stops=[];
 const K={course,base,stopAll(){stops.forEach(x=>x.fn());},el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;},
  button(text,fn,parent,primary){const b=K.el('button','btn'+(primary?' primary':''),text);b.type='button';b.onclick=fn;if(parent)parent.append(b);return b;},
  select(label,options,fn,parent){const l=K.el('label','',label+' '),s=document.createElement('select');options.forEach(([v,t])=>s.add(new Option(t,v)));s.onchange=()=>fn(s.value);l.append(s);parent.append(l);return s;},
  number(label,value,min,max,fn,parent){const l=K.el('label','',label+' '),e=document.createElement('input');e.type='number';e.min=min;e.max=max;e.value=value;e.onchange=()=>{const n=Number(e.value);if(!Number.isFinite(n)){e.value=value;return;}e.value=Math.min(max,Math.max(min,n));fn(Number(e.value));};l.append(e);parent.append(l);return e;},
  range(label,max,fn,parent){const l=K.el('label','',label+' '),r=document.createElement('input');r.type='range';r.min=0;r.max=max;r.value=0;r.oninput=()=>fn(Number(r.value));l.append(r);parent.append(l);return r;},
  status(root){const e=K.el('p','lt-status');e.setAttribute('role','status');e.setAttribute('aria-live','polite');root.append(e);return e;},
  note(root,s){root.append(K.el('p','lt-note',s));},
  chart(root){const d=K.el('div','lt-chart');root.append(d);return d;},
  svg(d,h,body,label){const w=Math.max(260,Math.round(d.clientWidth||500));d.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+label.replace(/"/g,'&quot;')+'">'+body(w)+'</svg>';},
  text(x,y,s,anchor){return '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||'start')+'">'+s+'</text>';},
  line(x,y,a,b){return '<line class="lt-grid" x1="'+x+'" y1="'+y+'" x2="'+a+'" y2="'+b+'"/>';},
  dot(x,y,n){return '<circle class="lt-mark" cx="'+x+'" cy="'+y+'" r="13"/>'+K.text(x,y+5,n,'middle').replace('<text ','<text class="lt-dot-label" ');},
  watch(d,fn){new ResizeObserver(fn).observe(d);},
  get(key,fallback){try{const s=localStorage.getItem(key);return s==null?fallback:JSON.parse(s);}catch(e){return fallback;}},
  set(key,v){try{localStorage.setItem(key,JSON.stringify(v));}catch(e){}},
  onStop(root,fn){stops.push({root,fn});},
  player(root){let clock=null,nodes=[];const stop=()=>{if(clock)clock.stop();clock=null;nodes.forEach(n=>{try{n.stop();}catch(e){}});nodes=[];};K.onStop(root,stop);return {stop,get running(){return !!clock;},start(bpm,steps,count,tick,visual,done){K.stopAll();stop();if(!window.PS||!PS.audio)return false;const M=PS.audio.Metronome;clock=new M({bpm,steps,beats:4,onStep(s,t){if(s<count)tick(s,t);}});clock.muted=true;clock.onVisual=s=>{if(s>=count){stop();if(done)done();return;}if(visual)visual(s);};return clock.start();},tone(midi,time,duration=.4,volume=.1){if(!window.PS||!PS.audio)return;const c=PS.audio.ctx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=440*Math.pow(2,(midi-69)/12);g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(volume,time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g).connect(c.destination);o.start(time);o.stop(time+duration+.02);nodes.push(o);},chord(notes,t,d=.7){notes.forEach(m=>this.tone(m,t,d,.07));}};},
  shell(root){const controls=K.el('div','lt-controls');root.append(controls);return controls;}
 };
 function mount(id,host){if(!pending[id])pending[id]=[];const root=K.el('div','learning-tool');root.dataset.learning=id;host.append(root);pending[id].push(root);return root;}
 function addAt(id,section){const h=section.querySelector('.teaching-heading')||section.querySelector('h2');const host=document.createElement('div');h.after(host);const root=mount(id,host);const details=K.el('details','lt-reference');details.append(K.el('summary','',id==='practice-trends'?'填寫／查閱原有練習紀錄':'查閱原教材與文字對照'));while(host.nextSibling)details.append(host.nextSibling);host.after(details);return root;}
 definitions.forEach(([id,route,heading])=>{if(!route.test(path))return;const s=Array.from(document.querySelectorAll('section.slide')).find(s=>{const h=s.querySelector('h2');return h&&h.textContent.includes(heading);});if(s)addAt(id,s);});
 const home=/\/(vocal|guitar|piano|songwriting)\/(?:index\.html)?$/.test(path);
 if(/\/handbook\.html$/.test(path)){const target=document.querySelector('#overview')?.closest('.hb-sec');if(target)mount('course-map',target);}
 if(home){const target=document.querySelector('#lessons .wrap')||document.querySelector('#lessons')||document.querySelector('main');if(target){mount('course-map',target);mount('practice-trends',target);}}
 if(document.querySelector('.log7,.checks[data-id]')&&!home){const group=document.querySelector('.log7')||document.querySelector('.checks[data-id]');const section=group.closest('.slide');if(section)addAt('practice-trends',section);}
 window.PixelLearning={kit:K,register(id,fn){(pending[id]||[]).forEach(root=>{try{fn(root,K);root.dataset.ready='1';}catch(e){root.textContent='互動載入未完成，請使用原教材。';console.error(id,e);}});}};
 Object.keys(pending).forEach(id=>{const s=document.createElement('script');s.src=new URL(id+'.js'+version,base).href;s.onerror=()=>{(pending[id]||[]).forEach(r=>r.textContent='互動暫時無法載入，原教材仍可查閱。');};document.head.append(s);});
 function stopAll(){stops.forEach(x=>x.fn());}
 document.addEventListener('slide:change',e=>{if(e.detail&&e.detail.mobile)return;stopAll();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
 addEventListener('pagehide',stopAll);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')stopAll();});
})();
