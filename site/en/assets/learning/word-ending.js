PixelLearning.register('word-ending',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root);let type='ai',p=0,finish=80;const types={ai:['愛','a','i'],n:['心','Hold the vowel','Close on n with the tongue tip'],ng:['星','Hold the vowel','Close on ng with the back of the tongue']};
 K.select('Example',[['ai','愛 (ài): diphthong'],['n','心 (xīn): front nasal'],['ng','星 (xīng): back nasal']],v=>{type=v;draw();},ctl);
 const start=K.range('How far along',100,v=>{p=v;draw();},ctl);K.number('Closing starts at %',80,50,95,v=>{finish=v;draw();},ctl);
 function draw(){const t=types[type];K.svg(plot,120,w=>{const l=15,width=w-30,cut=width*finish/100;return K.text(l,20,t[0]+': hold → close')+'<rect x="'+l+'" y="42" width="'+cut+'" height="24" fill="var(--lt-fill)"/><rect x="'+(l+cut)+'" y="42" width="'+(width-cut)+'" height="24" class="lt-mark"/>'+K.text(l,96,t[1])+K.text(w-15,96,t[2],'end')+'<circle class="lt-mark" cx="'+(l+width*p/100)+'" cy="54" r="6"/>';},t[0]+' closing window');status.textContent=p<finish?'Holding '+t[1]+'. Don\'t rush to close yet.':'Moving into '+t[2]+'. Finish the word clearly.';}
 const label=K.el('label','','Teacher\'s demo audio (this device only) '),file=document.createElement('input'),audio=document.createElement('audio');file.type='file';file.accept='audio/*';audio.controls=true;audio.hidden=true;let url;
 file.onchange=()=>{audio.pause();if(url)URL.revokeObjectURL(url);const f=file.files[0];if(f){url=URL.createObjectURL(f);audio.src=url;audio.hidden=false;}};label.append(file);root.append(label,audio);K.onStop(root,()=>audio.pause());
 K.note(root,'The closing ratio is a guide and can be adjusted to the teacher\'s demo. The audio only plays on this device.');K.watch(plot,draw);draw();
});
