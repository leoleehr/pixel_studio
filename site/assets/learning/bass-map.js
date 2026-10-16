PixelLearning.register('bass-map',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root),player=K.player(root);const data={C:[[5,3,48,'C'],[4,2,52,'E']],Am:[[5,0,45,'A'],[4,2,52,'E']],G:[[6,3,43,'G'],[5,2,47,'B']],Em:[[6,0,40,'E'],[5,2,47,'B']],F:[[4,3,53,'F'],[3,2,57,'A']],D:[[4,0,50,'D'],[3,2,57,'A']]};let chord='C',active=0;
 K.select('和弦',Object.keys(data).map(x=>[x,x]),v=>{player.stop();chord=v;active=0;draw();},ctl);
 function draw(){K.svg(plot,205,w=>{const l=58,r=w-15,fw=(r-l)/3,y=n=>30+(6-n)*29,x=n=>n===0?l-20:l+(n-.5)*fw;let s='';for(let f=0;f<=3;f++)s+=K.line(l+f*fw,18,l+f*fw,188);for(let n=6;n>0;n--)s+=K.line(l,y(n),r,y(n))+K.text(25,y(n)+5,n+'弦','middle');data[chord].forEach((d,i)=>s+=K.dot(x(d[1]),y(d[0]),i===0?'根':'替'));return s;},chord+'的根音與交替低音位置');const n=data[chord][active];status.textContent=(active?'交替低音':'根音')+' '+n[3]+'：'+n[0]+'弦'+(n[1]?'第'+n[1]+'格':'空弦');}
 function sound(i){player.stop();active=i;const c=PS.audio.ctx();if(c)player.tone(data[chord][i][2],c.currentTime,.8);draw();}
 K.button('聽根音',()=>sound(0),ctl,true);K.button('聽交替低音',()=>sound(1),ctl);K.button('交替播放',()=>{player.start(70,1,4,(s,t)=>player.tone(data[chord][s%2][2],t,.6),s=>{active=s%2;draw();},()=>{});},ctl);K.button('停止',()=>player.stop(),ctl);K.note(root,'依本頁指法，交替低音是和弦內的另一個音，不一定是五度。下一段可接回既有伴奏播放器。');K.watch(plot,draw);draw();
});
