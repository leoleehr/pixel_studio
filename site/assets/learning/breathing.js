PixelLearning.register('breathing',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);
 // 每一拍都是一次「吸吐」：拍子前段吸、後段吐。方式只改變吸吐的音與一拍之內吸、吐的比例（四等分）
 const modes=[['natural','自然呼吸'],['slow','慢吸慢吐'],['quick','快吸快吐'],['long','快吸慢吐']];
 const SPEC={natural:{inn:'/o/',out:'/u/',q:2,tip:'口鼻同吸，自然吐出'},slow:{inn:'/o/',out:'/s/',q:2,tip:'吸、吐都放慢，吐盡再吸'},quick:{inn:'/o/',out:'/s/',q:2,tip:'吸、吐都短而快'},long:{inn:'/o/',out:'/s/',q:1,tip:'一口吸足，吐氣拉長'}};
 const BEATS=4,BARS=16;let mode='natural',bpm=60,pos=-1;
 K.select('方式',modes,v=>{stop();mode=v;draw();},ctl);
 K.number('速度 BPM',60,30,120,v=>{stop();bpm=v;draw();},ctl);
 function draw(){const sp=SPEC[mode],beat=pos<0?-1:Math.floor(pos/4)%BEATS,part=pos<0?'':(pos%4<sp.q?'吸':'吐');
  K.svg(plot,150,w=>{const gap=10,cell=(w-20-gap*(BEATS-1))/BEATS;let s='';
   for(let i=0;i<BEATS;i++){const x=10+i*(cell+gap),wi=cell*sp.q/4,on=i===beat;
    s+=K.text(x+cell/2,24,'第 '+(i+1)+' 拍','middle');
    // 每一拍分成吸、吐兩段，進行中的那一段亮起
    s+='<rect '+(on&&part==='吸'?'class="lt-mark" ':'fill="var(--lt-fill)" ')+'x="'+x+'" y="38" width="'+(wi-2)+'" height="40"/>';
    s+='<rect '+(on&&part==='吐'?'class="lt-mark" ':'fill="var(--lt-fill)" ')+'x="'+(x+wi)+'" y="38" width="'+(cell-wi)+'" height="40"/>';
    s+=K.text(x+wi/2,64,'吸','middle')+K.text(x+wi+(cell-wi)/2,64,'吐','middle');
    s+=K.text(x+cell/2,108,'吸吐','middle');}
   return s;},'每一拍吸吐一次，共 '+BEATS+' 拍');
  status.textContent=pos<0?'每一拍吸吐一次：吸 '+sp.inn+'、吐 '+sp.out+'，'+sp.tip+'（'+bpm+' BPM）':'第 '+(beat+1)+' 拍：'+(part==='吸'?'吸 '+sp.inn:'吐 '+sp.out)+'（第 '+(Math.floor(pos/4/BEATS)+1)+' / '+BARS+' 小節）';}
 const play=K.button('開始跟練',()=>{if(player.running){stop();return;}
  if(player.start(bpm,4,BEATS*4*BARS,(s,t)=>{if(s%4===0)PS.audio.click(t,s%(4*BEATS)===0?2:1);},s=>{pos=s;draw();},()=>{play.textContent='開始跟練';pos=-1;draw();})){play.textContent='停止';}
  else status.textContent='此裝置無法播放音訊，請搭配節拍器，每一拍吸吐一次。';},ctl,true);
 function stop(){player.stop();play.textContent='開始跟練';pos=-1;draw();}
 K.onStop(root,()=>{play.textContent='開始跟練';pos=-1;draw();});
 const old=root.closest('.slide').querySelector('.metro');if(old)old.hidden=true;
 K.note(root,'跟著節拍器，每一拍都完整吸吐一次：拍點一到先吸，接著吐，下一拍再吸吐。');K.watch(plot,draw);draw();
});
