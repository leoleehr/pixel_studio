PixelLearning.register('word-ending',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root);let type='ai',p=0,finish=80;const types={ai:['愛','a','i'],n:['心','母音延續','舌尖收 n'],ng:['星','母音延續','舌根收 ng']};
 K.select('例字',[['ai','愛：複母音'],['n','心：前鼻音'],['ng','星：後鼻音']],v=>{type=v;draw();},ctl);
 const start=K.range('唱到哪裡',100,v=>{p=v;draw();},ctl);K.number('收音起點 %',80,50,95,v=>{finish=v;draw();},ctl);
 function draw(){const t=types[type];K.svg(plot,120,w=>{const l=15,width=w-30,cut=width*finish/100;return K.text(l,20,t[0]+'：延續 → 收尾')+'<rect x="'+l+'" y="42" width="'+cut+'" height="24" fill="var(--lt-fill)"/><rect x="'+(l+cut)+'" y="42" width="'+(width-cut)+'" height="24" class="lt-mark"/>'+K.text(l,96,t[1])+K.text(w-15,96,t[2],'end')+'<circle class="lt-mark" cx="'+(l+width*p/100)+'" cy="54" r="6"/>';},t[0]+'的收音時間帶');status.textContent=p<finish?'延續'+t[1]+'，先不要急著收尾。':'轉入'+t[2]+'，清楚完成這個字。';}
 const label=K.el('label','','老師示範音檔（僅本機） '),file=document.createElement('input'),audio=document.createElement('audio');file.type='file';file.accept='audio/*';audio.controls=true;audio.hidden=true;let url;
 file.onchange=()=>{audio.pause();if(url)URL.revokeObjectURL(url);const f=file.files[0];if(f){url=URL.createObjectURL(f);audio.src=url;audio.hidden=false;}};label.append(file);root.append(label,audio);K.onStop(root,()=>audio.pause());
 K.note(root,'收音比例是示意，可依老師示範調整；音檔只在此裝置播放。');K.watch(plot,draw);draw();
});
