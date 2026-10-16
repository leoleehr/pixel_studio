PixelLearning.register('breathing',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);
 const modes=[['natural','自然呼吸 4吸・4吐'],['slow','慢吸慢吐 4吸・8吐'],['quick','快吸快吐'],['long','快吸慢吐（自訂）']];let mode='natural',bpm=60,exhale=8,pause=1,step=0;
 const sel=K.select('方式',modes,v=>{stop();mode=v;step=0;draw();},ctl);
 const speed=K.number('速度 BPM',60,30,120,v=>{stop();bpm=v;},ctl);
 const out=K.number('吐氣拍數',8,2,32,v=>{stop();exhale=v;step=0;draw();},ctl);
 const rest=K.number('暫停拍數',1,0,8,v=>{stop();pause=v;step=0;draw();},ctl);
 function phases(){return mode==='natural'?[['吸氣 /o/',4],['吐氣 /u/',4]]:mode==='slow'?[['慢吸 /o/',4],['慢吐 /s/',8]]:mode==='quick'?[['快吸 /o/',.5],['快吐 /s/',.5]]:[['吸氣 /o/',1],['暫停',pause],['慢吐 /s/',exhale]];}
 function total(){return phases().reduce((n,p)=>n+p[1],0);}
 function draw(){out.parentElement.hidden=rest.parentElement.hidden=mode!=='long';let acc=0,current;const ps=phases();for(const p of ps){if(step>=acc&&step<acc+p[1])current=[p[0],step-acc,p[1]];acc+=p[1];}current=current||[ps[0][0],0,ps[0][1]];K.svg(plot,145,w=>{let x=10,s=K.text(w/2,28,current[0],'middle'),available=w-20;for(const p of ps){const width=p[1]/total()*available;if(p[1])s+='<rect x="'+x+'" y="55" width="'+Math.max(0,width-3)+'" height="24" fill="var(--lt-fill)"/>'+K.text(x+width/2,108,p[0].split(' ')[0]+' '+p[1]+'拍','middle');x+=width;}s+='<circle class="lt-mark" cx="'+(10+(step+.25)/total()*available)+'" cy="67" r="6"/>';return s;},current[0]);status.textContent=current[0]+'：'+(current[1]+.5)+' / '+current[2]+'拍（'+bpm+' BPM）';}
 const play=K.button('開始一輪',()=>{if(player.running){stop();return;}step=0;draw();if(player.start(bpm,2,total()*2,(_s,t)=>PS.audio.click(t,1),s=>{step=s/2;draw();},()=>{play.textContent='開始一輪';step=0;draw();}))play.textContent='停止';else status.textContent='此裝置無法播放音訊，可用逐拍查看。';},ctl,true);
 function stop(){player.stop();play.textContent='開始一輪';}
 K.button('下一個半拍',()=>{stop();step=(step+.5)%total();draw();},ctl);K.onStop(root,stop);
 const old=root.closest('.slide').querySelector('.metro');if(old)old.hidden=true;
 K.note(root,'依拍點輕鬆跟練；快吸慢吐可調整暫停與吐氣拍數。');K.watch(plot,draw);draw();
});
