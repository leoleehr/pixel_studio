PixelLearning.register('course-map',(root,K)=>{
 const cards=Array.from(document.querySelectorAll('article.lesson')),items=cards.length?cards:Array.from(document.querySelectorAll('.lesson-head[id]')).filter(s=>s.id!=='overview');
 const summary=K.el('details','lt-course-overview'),grid=K.el('div','lt-map');summary.append(K.el('summary','','查看課程路線總覽'));summary.append(grid);root.append(summary);let previous='';
 function homework(n){let done=0,total=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k.startsWith('pixel:'+K.course+':checks-')&&!(K.course==='vocal'&&k.startsWith('pixel:checks-')))continue;const id=k.split('checks-')[1],match=id.match(/(?:ch|p|s|l|lesson-)?0*(\d+)/);if(!match||+match[1]!==n)continue;const a=K.get(k,[]);if(Array.isArray(a)){total+=a.length;done+=a.filter(Boolean).length;}}}catch(e){}return total?'已勾選 '+done+' 項作業（本機）':'尚無此裝置的作業紀錄';}
 const records=[];
 items.forEach((item,i)=>{const h=item.querySelector(item.matches('article')?'h3':'h2'),link=item.querySelector('.links a.main')||item.querySelector('a[href]');if(!h||(!link&&!item.id))return;const clone=h.cloneNode(true);clone.querySelectorAll('small').forEach(e=>e.remove());const title=clone.textContent.trim(),prior=previous?'建議先備：'+previous:'從本課開始建立基礎';
  const a=K.el('a');a.href=item.matches('article')?link.getAttribute('href'):'#'+item.id;a.append(K.el('strong','',(i+1)+'. '+title));grid.append(a);
  const info=K.el('div','lt-course-record'),state=K.el('p','lt-homework',homework(i+1));info.append(K.el('p','',prior),state);
  if(cards.length)(item.querySelector('.body')||item.querySelector('.top')?.lastElementChild||item).append(info);else a.append(info);
  records.push([i+1,state]);previous=title;
 });
 function refresh(){records.forEach(([n,e])=>e.textContent=homework(n));}addEventListener('storage',refresh);addEventListener('pageshow',refresh);
 K.note(root,'先備建議與本機作業紀錄已整合至各堂課；紀錄不代表學習完成率。');
});
