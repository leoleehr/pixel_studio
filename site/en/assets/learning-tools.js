/* Twelve progressive enhancements, loaded per lesson. No original content removed. */
(function(){
 'use strict';
 const script=document.currentScript,base=new URL('learning/',script.src),version=new URL(script.src).search;
 const path=location.pathname,course=(path.match(/\/(vocal|guitar|piano|songwriting)(?:\/|$)/)||[])[1];
 if(!course)return;
 const definitions=[
 ['breathing',/vocal\/slides\/lesson-02/,'Four ways to breathe, four kinds of songs'],
 ['chord-path',/guitar\/ch03/,'Get ready early and your chord changes get fast'],
 ['voice-leading',/piano\/p04/,'Inversions keep the right hand from moving much'],
 ['tone-melody',/songwriting\/s03/,'Mandarin has four tones'],
 ['word-ending',/vocal\/slides\/lesson-04/,'The last moment of a long note'],
 ['bass-map',/guitar\/ch05/,'"Boom": play the chord\'s root'],
 ['dual-hands',/piano\/p03/,'Both hands together'],
 ['arrangement',/songwriting\/s07/,'Instruments come in from few to many'],
 ['accompaniment',/guitar\/ch05/,'First listen for the song\'s time signature and tempo'],
 ['accompaniment',/piano\/p06/,'First listen for the time signature and tempo'],
 ['rhetoric',/songwriting\/s04/,'Repetition and climax']
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
 function mount(id,host){if(!pending[id])pending[id]=[];const root=K.el('div','learning-tool');root.dataset.learning=id;root.addEventListener('keydown',e=>{if(e.target.closest('audio'))e.stopPropagation();});host.append(root);pending[id].push(root);return root;}
 function addAt(id,section){const h=section.querySelector('.teaching-heading')||section.querySelector('h2');const host=document.createElement('div');h.after(host);const root=mount(id,host);const details=K.el('details','lt-reference');details.append(K.el('summary','',id==='practice-trends'?'Fill in / view the original practice log':id==='voice-leading'?'Open the chord-voicing comparison table':'View the page content and text'));details.addEventListener('keydown',e=>{if(e.target.tagName==='SUMMARY'&&(e.key==='Enter'||e.key===' '))e.stopPropagation();});let node=host.nextSibling;while(node){const next=node.nextSibling;if(!node.matches||!node.matches('.slide-chapter,.slide-brand,.slide-meta'))details.append(node);node=next;}host.after(details);
  if(id==='voice-leading'){const table=Array.from(details.querySelectorAll('table')).find(t=>t.textContent.includes('The same C chord'));if(table){const layout=K.el('div','lt-voice-layout'),basic=K.el('div','lt-voice-basics');host.before(layout);basic.append(table);layout.append(basic,host);}}
  return root;}
 definitions.forEach(([id,route,heading])=>{if(!route.test(path))return;const s=Array.from(document.querySelectorAll('section.slide')).find(s=>{const h=s.querySelector('h2');return h&&h.textContent.includes(heading);});if(s)addAt(id,s);});
 const home=/\/(vocal|guitar|piano|songwriting)\/(?:index\.html)?$/.test(path);
 if(/\/handbook\.html$/.test(path)){const target=document.querySelector('#overview')?.closest('.hb-sec');if(target)mount('course-map',target);}
 if(home){const target=document.querySelector('#lessons .wrap')||document.querySelector('#lessons')||document.querySelector('main');if(target){mount('course-map',target);mount('practice-trends',target);}}
 if(document.querySelector('.log7,.checks[data-id]')&&!home){const log=document.querySelector('.log7'),group=log||document.querySelector('.checks[data-id]');const section=group.closest('.slide');if(section){if(log)addAt('practice-trends',section);else{/* 作業清單留在投影片上，趨勢圖收在清單下方 */const fold=K.el('details','lt-trend-fold'),host=document.createElement('div');fold.append(K.el('summary','','View the seven-day homework trend'),host);group.after(fold);mount('practice-trends',host);}}}
 function fallback(root,message){root.textContent=message;const ref=root.closest('.slide')?.querySelector('.lt-reference')||root.parentElement.nextElementSibling;if(ref&&ref.matches('.lt-reference'))ref.open=true;}
 window.PixelLearning={kit:K,register(id,fn){(pending[id]||[]).forEach(root=>{try{fn(root,K);root.dataset.ready='1';}catch(e){fallback(root,'The interactive part didn\'t finish loading. Please refer to the page content.');console.error(id,e);}});}};
 Object.keys(pending).forEach(id=>{const s=document.createElement('script');s.src=new URL(id+'.js'+version,base).href;s.onerror=()=>{(pending[id]||[]).forEach(r=>fallback(r,'The interactive part can\'t load right now. The page content is still available.'));};document.head.append(s);});
 function stopAll(){stops.forEach(x=>x.fn());}
 document.addEventListener('slide:change',e=>{if(e.detail&&e.detail.mobile)return;stopAll();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
 addEventListener('pagehide',stopAll);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')stopAll();});
 let printClosed=[];
 addEventListener('beforeprint',()=>{stopAll();printClosed=Array.from(document.querySelectorAll('.lt-reference:not([open])'));printClosed.forEach(e=>e.open=true);});
 addEventListener('afterprint',()=>{printClosed.forEach(e=>e.open=false);printClosed=[];});
})();
