PixelLearning.register('chord-path',(root,K)=>{
 const ctl=K.shell(root),plot=K.chart(root),status=K.status(root);let p=0;const slider=K.range('C → Am',100,v=>{p=v/100;draw();},ctl);
 K.button('C',()=>{p=0;slider.value=0;draw();},ctl);K.button('Am',()=>{p=1;slider.value=100;draw();},ctl,true);
 function draw(){K.svg(plot,225,w=>{const l=44,r=w-18,fw=(r-l)/3,y=s=>40+(6-s)*29,x=f=>l+(f-.5)*fw;let s=K.text(l,18,'第1、2指不動；第3指換弦');for(let f=0;f<4;f++)s+=K.line(l+f*fw,28,l+f*fw,196);for(let n=6;n>0;n--)s+=K.line(l,y(n),r,y(n))+K.text(30,y(n)+5,n+'弦','end');for(let f=1;f<=3;f++)s+=K.text(x(f),218,f+'格','middle');s+='<path d="M'+x(3)+' '+y(5)+' Q'+x(3)+' '+y(3)+' '+x(2)+' '+y(3)+'" fill="none" stroke="var(--muted)" stroke-dasharray="4 4"/>';return s+K.dot(x(1),y(2),'1')+K.dot(x(2),y(4),'2')+K.dot(x(3)+(x(2)-x(3))*p,y(5)+(y(3)-y(5))*p,'3');},'C與Am的指法變化');status.textContent=p===0?'C：第3指在5弦3格。':p===1?'Am：第3指移到3弦2格，第1、2指不動。':'移動第3指，其餘手指留在原位。';}
 K.note(root,'路徑連接起點與終點；實際換弦時先離弦。完成後接著做下一張的一分鐘挑戰。');K.watch(plot,draw);draw();
});
