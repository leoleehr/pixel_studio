PixelLearning.register('breathing',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);
 // 每一拍都是一次「吸吐」：拍子前段吸、後段吐。方式只改變吸吐的音與一拍之內吸、吐的比例（四等分）
 const modes=[['natural','Natural breathing'],['slow','Slow in, slow out'],['quick','Quick in, quick out'],['long','Quick in, slow out']];
 // bpm：每種方式的建議速度，也是 10／40／80 快捷鍵對應的方式
 const SPEC={natural:{inn:'/o/',out:'/u/',q:2,bpm:10,tip:'Breathe in through nose and mouth together, breathe out naturally'},slow:{inn:'/o/',out:'/s/',q:2,bpm:10,tip:'Slow down both in and out; breathe out fully before the next breath'},quick:{inn:'/o/',out:'/s/',q:2,bpm:80,tip:'Short and quick, in and out'},long:{inn:'/o/',out:'/s/',q:1,bpm:40,tip:'Fill up in one breath, stretch out the exhale'}};
 const BEATS=4,BARS=16;let mode='natural',bpm=10,pos=-1;
 const sel=K.select('Style',modes,v=>{stop();mode=v;speed.value=bpm=SPEC[v].bpm;draw();},ctl);
 const speed=K.number('Tempo BPM',10,10,90,v=>{stop();bpm=v;draw();},ctl);
 // 快捷鍵：10 自然呼吸、慢吸慢吐（目前已是其中一種就保留），40 快吸慢吐，80 快吸快吐
 const keys=K.el('div','lt-row');keys.setAttribute('aria-label','Tempo shortcuts');ctl.append(keys);
 [[10,'Natural breathing, slow in slow out'],[40,'Quick in, slow out'],[80,'Quick in, quick out']].forEach(([v,name])=>{const b=K.button(String(v),()=>{stop();if(SPEC[mode].bpm!==v)mode=modes.find(m=>SPEC[m[0]].bpm===v)[0];sel.value=mode;speed.value=bpm=v;draw();},keys);b.title=b.ariaLabel=v+' BPM：'+name;});
 function draw(){const sp=SPEC[mode],beat=pos<0?-1:Math.floor(pos/4)%BEATS,part=pos<0?'':(pos%4<sp.q?'In':'Out');
  K.svg(plot,150,w=>{const gap=10,cell=(w-20-gap*(BEATS-1))/BEATS;let s='';
   for(let i=0;i<BEATS;i++){const x=10+i*(cell+gap),wi=cell*sp.q/4,on=i===beat;
    s+=K.text(x+cell/2,24,'Beat '+(i+1),'middle');
    // 每一拍分成吸、吐兩段，進行中的那一段亮起
    s+='<rect '+(on&&part==='In'?'class="lt-mark" ':'fill="var(--lt-fill)" ')+'x="'+x+'" y="38" width="'+(wi-2)+'" height="40"/>';
    s+='<rect '+(on&&part==='Out'?'class="lt-mark" ':'fill="var(--lt-fill)" ')+'x="'+(x+wi)+'" y="38" width="'+(cell-wi)+'" height="40"/>';
    s+=K.text(x+wi/2,64,'In','middle')+K.text(x+wi+(cell-wi)/2,64,'Out','middle');
    s+=K.text(x+cell/2,108,'In-out','middle');}
   return s;},'One in-out breath per beat, '+BEATS+' beats');
  status.textContent=pos<0?'One in-out breath per beat: in on '+sp.inn+', out on '+sp.out+', '+sp.tip+' ('+bpm+' BPM）':'Beat '+(beat+1)+': '+(part==='In'?'In '+sp.inn:'Out '+sp.out)+' (bar '+(Math.floor(pos/4/BEATS)+1)+' / '+BARS+')';}
 const play=K.button('Start practice',()=>{if(player.running){stop();return;}
  if(player.start(bpm,4,BEATS*4*BARS,(s,t)=>{if(s%4===0)PS.audio.click(t,s%(4*BEATS)===0?2:1);},s=>{pos=s;draw();},()=>{play.textContent='Start practice';pos=-1;draw();})){play.textContent='Stop';}
  else status.textContent='This device can\'t play audio. Use a metronome and take one in-out breath per beat.';},ctl,true);
 function stop(){player.stop();play.textContent='Start practice';pos=-1;draw();}
 K.onStop(root,()=>{play.textContent='Start practice';pos=-1;draw();});
 const old=root.closest('.slide').querySelector('.metro');if(old)old.hidden=true;
 K.note(root,'Follow the metronome and take one full breath, in and out, on every beat: breathe in as the beat lands, then out, then in and out again on the next beat. Shortcuts 10: natural breathing, slow in slow out | 40: quick in slow out | 80: quick in quick out.');K.watch(plot,draw);draw();
});
