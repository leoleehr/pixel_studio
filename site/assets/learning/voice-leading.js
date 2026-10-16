PixelLearning.register('voice-leading',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);const names=['C','F','G','C'],a=[[60,64,67],[65,69,72],[67,71,74],[60,64,67]],b=[[60,64,67],[60,65,69],[59,62,67],[60,64,67]];let pos=0,bpm=72;
 const select=K.select('和弦',names.map((n,i)=>[i,(i+1)+' '+n]),v=>{stop();pos=+v;draw();},ctl);K.number('速度 BPM',72,40,140,v=>{stop();bpm=v;},ctl);
 function note(m){return ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][m%12]+(Math.floor(m/12)-1);}
 function cost(seq){return seq.slice(1).reduce((t,c,i)=>t+c.reduce((s,n,j)=>s+Math.abs(n-seq[i][j]),0),0);}
 function draw(){select.value=pos;K.svg(plot,190,w=>{const x=m=>32+(m-59)/15*(w-64);let s='';[[a,'全部原位',50],[b,'最近音連接',140]].forEach(([seq,title,y])=>{s+=K.text(8,y-27,title)+K.text(w-8,y-27,'整組 '+cost(seq)+'半音','end');s+=K.line(25,y,w-25,y);if(pos>0)seq[pos].forEach((m,i)=>s+=K.line(x(seq[pos-1][i]),y-12,x(m),y));seq[pos].forEach(m=>{s+='<circle class="lt-mark" cx="'+x(m)+'" cy="'+y+'" r="7"/>'+K.text(x(m),y+25,note(m),'middle');});});return s;},names[pos]+'和弦原位與最近音比較');status.textContent=names[pos]+'｜原位 '+a[pos].map(note).join(' ')+'；就近連接 '+b[pos].map(note).join(' ');}
 function start(seq,label){stop();pos=0;draw();if(player.start(bpm,1,16,(s,t)=>{if(s%4===0)player.chord(seq[Math.floor(s/4)],t,60/bpm*3.5);},s=>{pos=Math.floor(s/4);draw();},stop))status.textContent='正在試聽：'+label;}
 K.button('聽全部原位',()=>start(a,'全部原位'),ctl);K.button('聽最近音連接',()=>start(b,'最近音連接'),ctl,true);K.button('停止',stop,ctl);
 function stop(){player.stop();}K.onStop(root,stop);K.note(root,'半音總量計算三個聲部的音高變化，不代表實際手部距離。');K.watch(plot,draw);draw();
});
