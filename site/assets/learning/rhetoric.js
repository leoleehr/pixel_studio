PixelLearning.register('rhetoric',(root,K)=>{
 const ctl=K.shell(root),sentence=K.el('p','lt-status'),answers=K.el('div','lt-controls'),status=K.status(root);root.insertBefore(sentence,status);root.insertBefore(answers,status);let item=0,revealed=false;
 const examples=[{name:'類疊',parts:['我','等著','風，','等著','雨，','等著','你。'],marks:[1,3,5],why:'「等著」接連反覆，形成節奏與累積感。'},{name:'頂真',parts:['夜裡留下','回聲','，','回聲','帶我回家。'],marks:[1,3],why:'前句以「回聲」收尾，後句用「回聲」開始。'},{name:'映襯',parts:['門外是','喧鬧','，心裡是','寂靜','。'],marks:[1,3],why:'「喧鬧」與「寂靜」並列，形成內外對照。'}];
 K.select('練習句',examples.map((e,i)=>[i,'句子 '+(i+1)]),v=>{item=+v;revealed=false;draw();},ctl);
 function draw(){const e=examples[item];sentence.replaceChildren();e.parts.forEach((t,i)=>sentence.append(K.el('span',revealed&&e.marks.includes(i)?'lt-highlight':'',t)));answers.replaceChildren();['類疊','頂真','映襯'].forEach(name=>K.button(name,()=>{revealed=true;draw();status.textContent=(name===e.name?'判斷正確。':'再比對標記位置：這句主要是'+e.name+'。')+e.why;},answers));status.textContent=revealed?e.why:'先判斷修辭，再查看字句內的標記。';}
 K.note(root,'以上為原創練習句；只解釋這組例句，不自動替整篇歌詞評分。');draw();
});
