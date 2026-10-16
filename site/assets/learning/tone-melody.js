PixelLearning.register('tone-melody',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);let tone=3,melody=1;const shapes=[[.8,.8,.8,.8,.8],[.2,.35,.5,.65,.8],[.6,.3,.15,.4,.7],[.85,.67,.5,.3,.15]];
 const opts=['一聲：天','二聲：來','三聲：你','四聲：淚'];const t=K.select('例字',opts.map((n,i)=>[i,n]),v=>{player.stop();tone=+v;draw();},ctl);t.value=tone;const m=K.select('旋律方向',['持平','上行','先降後升','下行'].map((n,i)=>[i,n]),v=>{player.stop();melody=+v;draw();},ctl);m.value=melody;
 function draw(){K.svg(plot,170,w=>{const path=a=>a.map((v,i)=>(i?'L':'M')+(20+i*(w-40)/4)+' '+(30+(1-v)*100)).join(' ');return K.text(20,17,'實線：字調　虛線：旋律')+'<path d="'+path(shapes[tone])+'" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="'+path(shapes[melody])+'" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6 4"/>'+K.text(20,162,'起音')+K.text(w-20,162,'收音','end');},'字調與旋律方向示意');status.textContent=tone===melody?'方向一致，再放回整句試唱。':'方向不同，試唱確認是否影響字義；不能只憑曲線判定。';}
 function play(which){player.stop();player.start(100,2,5,(s,time)=>player.tone(60+Math.round(shapes[which][s]*9),time,.25),null,()=>{});}
 K.button('聽字調方向',()=>play(tone),ctl);K.button('聽旋律方向',()=>play(melody),ctl,true);K.button('停止',()=>player.stop(),ctl);K.note(root,'合成音只示意高低方向，不是國語發音或實測音高。');K.watch(plot,draw);draw();
});
