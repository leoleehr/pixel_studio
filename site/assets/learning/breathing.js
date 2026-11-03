PixelLearning.register('breathing',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);
 // 呼吸只有「吸氣 → 吐氣」：吸完就吐，畫面不顯示吸幾拍、吐幾拍。內部長度只用來控制跟練速度
 const modes=[['natural','自然呼吸'],['slow','慢吸慢吐'],['quick','快吸快吐'],['long','快吸慢吐']];
 const ROUNDS=10;let mode='natural',bpm=60,exhale=8,pause=1,step=0,round=0,manual=false;
 K.select('方式',modes,v=>{stop();mode=v;draw();},ctl);
 K.number('速度 BPM',60,30,120,v=>{stop();bpm=v;draw();},ctl);
 // 快吸慢吐依原教材「慢吐並讀秒」，以秒數設定（60 BPM 時一拍一秒）
 const out=K.number('慢吐秒數',8,2,32,v=>{stop();exhale=v;draw();},ctl);
 const rest=K.number('暫停秒數',1,0,8,v=>{stop();pause=v;draw();},ctl);
 function phases(){const sec=bpm/60;return (mode==='natural'?[['吸氣 /o/',4,'吸氣'],['吐氣 /u/',4,'吐氣']]:mode==='slow'?[['慢吸 /o/',4,'吸氣'],['慢吐 /s/',8,'吐氣']]:mode==='quick'?[['快吸 /o/',.5,'吸氣'],['快吐 /s/',.5,'吐氣']]:[['快吸 /o/',1,'吸氣'],['暫停',Math.round(pause*sec*2)/2,'暫停'],['慢吐 /s/',Math.max(.5,Math.round(exhale*sec*2)/2),'吐氣']]).filter(p=>p[1]>0);}
 function total(){return phases().reduce((n,p)=>n+p[1],0);}
 function hint(p){return p[2]==='吸氣'?'一口氣吸滿':p[2]==='吐氣'?'一口氣平穩吐完':'停住，不吸也不吐';}
 function current(){let acc=0;const ps=phases();for(let i=0;i<ps.length;i++){if(step<acc+ps[i][1])return {p:ps[i],i,start:acc};acc+=ps[i][1];}return {p:ps[0],i:0,start:0};}
 function draw(){out.parentElement.hidden=rest.parentElement.hidden=mode!=='long';const ps=phases(),c=current(),tot=total(),on=player.running||manual;
  // 進行中的動作以一條連續填滿的長條表示；逐步查看時整段亮起
  const fill=player.running?Math.min(1,(step-c.start+.5)/c.p[1]):1;
  K.svg(plot,145,w=>{const available=w-20;let x=10,s=K.text(w/2,28,ps.map((p,i)=>on&&i===c.i?'【'+p[0]+'】':p[0]).join('　→　'),'middle');
   ps.forEach((p,i)=>{const width=p[1]/tot*available,inner=Math.max(0,width-3);s+='<rect x="'+x+'" y="55" width="'+inner+'" height="24" fill="var(--lt-fill)"/>';
    if(on&&i===c.i)s+='<rect class="lt-mark" x="'+x+'" y="55" width="'+inner*fill+'" height="24"/>';
    s+=K.text(x+width/2,108,p[2],'middle');x+=width;});return s;},ps.map(p=>p[2]).join('，接著'));
  status.textContent=player.running?c.p[0]+'：'+hint(c.p)+'（第 '+(round+1)+' / '+ROUNDS+' 輪）':manual?c.p[0]+'：'+hint(c.p):'吸完就吐，一輪接一輪，連續跟練 '+ROUNDS+' 輪';}
 const play=K.button('開始跟練',()=>{if(player.running){stop();return;}step=0;round=0;manual=false;const tot=total(),starts=[];
  phases().reduce((a,p)=>{starts.push(a*2);return a+p[1];},0);
  // 換動作時給重音提示，其餘拍點輕聲維持速度
  if(player.start(bpm,2,tot*2*ROUNDS,(s,t)=>{const k=s%(tot*2);if(starts.includes(k))PS.audio.click(t,2);else if(k%2===0)PS.audio.click(t,0);},s=>{step=(s%(tot*2))/2;round=Math.floor(s/(tot*2));draw();},()=>{play.textContent='開始跟練';step=0;round=0;draw();})){play.textContent='停止';draw();}
  else status.textContent='此裝置無法播放音訊，可用「下一個動作」逐步查看。';},ctl,true);
 function stop(){player.stop();play.textContent='開始跟練';step=0;round=0;manual=false;draw();}
 K.button('下一個動作',()=>{const was=manual,c=current();player.stop();play.textContent='開始跟練';step=was?(c.start+c.p[1])%total():0;manual=true;draw();},ctl);
 K.onStop(root,()=>{play.textContent='開始跟練';});
 const old=root.closest('.slide').querySelector('.metro');if(old)old.hidden=true;
 K.note(root,'吸氣、吐氣各自一口氣完成，吸完就接著吐；節拍器只負責穩住速度。快吸慢吐可調整暫停與慢吐的秒數。');K.watch(plot,draw);draw();
});
