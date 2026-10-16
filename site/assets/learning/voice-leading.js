PixelLearning.register('voice-leading',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);const names=['C','F','G','C'],a=[[60,64,67],[65,69,72],[67,71,74],[60,64,67]],b=[[60,64,67],[60,65,69],[59,62,67],[60,64,67]];let pos=0,bpm=72;
 const select=K.select('和弦',names.map((n,i)=>[i,(i+1)+' '+n]),v=>{stop();pos=+v;draw();},ctl);K.number('速度 BPM',72,40,140,v=>{stop();bpm=v;},ctl);
 function note(m){return ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][m%12]+(Math.floor(m/12)-1);}
 function cost(seq){return seq.slice(1).reduce((t,c,i)=>t+c.reduce((s,n,j)=>s+Math.abs(n-seq[i][j]),0),0);}
 function draw(){select.value=pos;K.svg(plot,260,w=>{const x=i=>24+i*(w-48)/3;let s='';[[a,'全部原位',0],[b,'最近音連接',132]].forEach(([seq,title,top])=>{const y=m=>top+99-(m-59)/15*66;s+=K.text(4,top+15,title)+K.text(w-4,top+15,'整組 '+cost(seq)+' 半音','end');s+='<rect x="'+(x(pos)-13)+'" y="'+(top+23)+'" width="26" height="100" fill="var(--lt-fill)"/>';
  [0,1,2].forEach(v=>{s+='<path d="'+seq.map((ch,i)=>(i?'L':'M')+x(i)+' '+y(ch[v])).join(' ')+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="'+['none','5 3','1 3'][v]+'"/>';seq.forEach((ch,i)=>{s+='<circle cx="'+x(i)+'" cy="'+y(ch[v])+'" r="4" fill="var(--accent)"/>';if(i===pos)s+=K.text(x(i)+(i===3?-8:8),y(ch[v])+4,note(ch[v]),i===3?'end':'start');});});
  names.forEach((n,i)=>{s+=K.text(x(i),top+121,n,'middle');});});return s;},'C到F到G到C，三個聲部完整路徑。原位共42半音，就近連接共12半音。');status.textContent='第'+(pos+1)+'步 '+names[pos]+'｜原位 '+a[pos].map(note).join(' ')+'；就近連接 '+b[pos].map(note).join(' ');}
 function start(seq,label){stop();pos=0;draw();if(player.start(bpm,1,16,(s,t)=>{if(s%4===0)player.chord(seq[Math.floor(s/4)],t,60/bpm*3.5);},s=>{pos=Math.floor(s/4);draw();},stop))status.textContent='正在試聽：'+label;}
 K.button('聽全部原位',()=>start(a,'全部原位'),ctl);K.button('聽最近音連接',()=>start(b,'最近音連接'),ctl,true);K.button('停止',stop,ctl);
 function stop(){player.stop();}K.onStop(root,stop);K.note(root,'四步連線呈現三個聲部。切換和弦可查看各步音名；半音總量計算整組音高變化，不代表實際手部距離。');K.watch(plot,draw);draw();
});
