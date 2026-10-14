/* ===================== CHẤM NHÓM BẰNG THẺ QR ===================== */
const qrNewRound=()=>({id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,4),key:'',pts:1,ans:{},locked:false});
S.qr=Object.assign({n:24,cur:0,rounds:[]},lsGet('omr.qr',null)||{});
if(!Array.isArray(S.qr.rounds)||!S.qr.rounds.length)S.qr.rounds=[qrNewRound()];
S.qr.n=Math.min(24,Math.max(1,S.qr.n|0||24));S.qr.cur=Math.min(Math.max(0,S.qr.cur|0),S.qr.rounds.length-1);
save.qr=()=>lsSet('omr.qr',S.qr);
const qrR=()=>S.qr.rounds[S.qr.cur];
const QL='ABCD';
const QC={on:false,stream:null,raf:0,last:0,trk:[],obs:{},seen:{},lastL:{},hi:!!lsGet('omr.qrhi',false),wc:null,wx:null,ww:0,wh:0,tab:lsGet('omr.qrtab','play'),liveT:0,saveT:0,per:lsGet('omr.qrper',2),from:1,to:0};

function qrTotals(){const n=S.qr.n,t=Array(n+1).fill(0),ok=Array(n+1).fill(0);
  S.qr.rounds.forEach(r=>{if(!r.key)return;for(let g=1;g<=n;g++)if(r.ans[g]===r.key){t[g]+=num(r.pts);ok[g]++}});return{t,ok}}
function qrSaveSoon(){clearTimeout(QC.saveT);QC.saveT=setTimeout(save.qr,400)}

/* ---------- hiển thị ---------- */
function renderQR(){
  $$('#qrSeg button').forEach(b=>b.classList.toggle('on',b.dataset.qt===QC.tab));
  ['play','board','cards'].forEach(k=>$('#qt-'+k).hidden=k!==QC.tab);
  qrRenderRound();
  if(QC.tab==='board')qrRenderBoard();
  if(QC.tab==='cards')qrRenderCards();
}
function qrRenderRound(){
  const q=S.qr,r=qrR();
  $('#qrRName').textContent='Vòng '+(q.cur+1)+(r.locked?' 🔒':'');
  $('#qrRSub').textContent=(q.cur+1)+'/'+q.rounds.length+' vòng'+(r.locked?' · đã chốt':'');
  $$('#qrKey button').forEach(b=>b.classList.toggle('on',b.dataset.k===r.key));
  const p=$('#qrPts'),nn=$('#qrN');if(document.activeElement!==p)p.value=vnum(r.pts);if(document.activeElement!==nn)nn.value=q.n;
  $('#qrLock').textContent=r.locked?'🔓 Mở khóa để quét lại':'🔒 Khóa vòng';
  $('#qrNext').textContent=q.cur<q.rounds.length-1?'›':'＋';
  qrRenderLive();
}
function qrRenderLive(){
  const q=S.qr,r=qrR(),n=q.n,now=performance.now();let got=0,miss=[];
  const cnt={A:0,B:0,C:0,D:0};
  let h='';
  for(let g=1;g<=n;g++){const a=r.ans[g],seen=QC.seen[g]&&now-QC.seen[g].seen<700;
    let cls='qg';if(a){got++;cnt[a]++;cls+=r.key?(a===r.key?' ok':' bad'):' got'}else miss.push(g);if(seen)cls+=' seen';
    h+=`<button class="${cls}" data-g="${g}" aria-label="Nhóm ${g}${a?' chọn '+a:' chưa có'}"><small>${g}</small><b>${a||'–'}</b></button>`}
  $('#qrGrid').innerHTML=h;
  const right=r.key?QL.split('').reduce((s,k)=>s+(k===r.key?cnt[k]:0),0):0;
  $('#qrStat').innerHTML=`<div class="qstat"><b>${got}/${n}</b> nhóm đã nhận${r.key?` · <span class="okt">${right} nhóm đúng</span>`:''}${miss.length&&miss.length<=12?`<small>Chưa nhận: ${miss.join(', ')}</small>`:''}${r.locked?'<small>🔒 Vòng đã chốt — quét sẽ không đổi kết quả (vẫn bấm vào ô nhóm để sửa tay).</small>':''}</div>`;
  const mx=Math.max(1,got);
  $('#qrDist').innerHTML=got?`<div class="qdist">${QL.split('').map(k=>`<div class="qd${k===r.key?' key':''}"><span class="lb">${k}</span><div class="bar"><i style="width:${cnt[k]/mx*100}%"></i></div><span class="ct">${cnt[k]}</span></div>`).join('')}</div>`:'';
}
function qrRenderBoard(){
  const q=S.qr,n=q.n,rs=q.rounds,{t,ok}=qrTotals(),box=$('#qt-board');
  const order=[...Array(n)].map((_,i)=>i+1).sort((a,b)=>t[b]-t[a]||a-b);
  let rk=0,pv=null;const rank={};order.forEach((g,i)=>{if(t[g]!==pv){rk=i+1;pv=t[g]}rank[g]=rk});
  const hasKey=rs.some(r=>r.key),hasAns=rs.some(r=>Object.keys(r.ans).length);
  if(!hasAns){box.innerHTML='<div class="card"><p class="muted">Chưa có kết quả. Qua tab “Chấm vòng” để quét thẻ của các nhóm, chọn đáp án đúng rồi quay lại đây xem xếp hạng.</p></div>';return}
  const medal=['🥇','🥈','🥉'];
  const top=order.filter(g=>rank[g]<=3&&t[g]>0);
  let h=hasKey?'':'<div class="card warnb">Chưa vòng nào chọn đáp án đúng nên chưa tính điểm. Vào “Chấm vòng” và bấm A/B/C/D ở mục “Đáp án đúng”.</div>';
  if(top.length)h+='<div class="podium">'+top.slice(0,6).map(g=>`<div class="pd r${rank[g]}"><i>${medal[rank[g]-1]}</i><b>Nhóm ${g}</b><span>${vnum(t[g])} điểm</span></div>`).join('')+'</div>';
  h+='<div class="card tblw"><table class="qtb"><thead><tr><th>Hạng</th><th>Nhóm</th>'+rs.map((r,i)=>`<th>V${i+1}</th>`).join('')+'<th>Tổng</th></tr></thead><tbody>';
  order.forEach(g=>{h+=`<tr><td>${rank[g]}</td><td><b>${g}</b></td>`+rs.map(r=>{const a=r.ans[g];
      if(!a)return'<td class="no">–</td>';if(!r.key)return`<td class="no">${a}</td>`;return a===r.key?'<td class="ok">✓</td>':`<td class="bad">${a}</td>`}).join('')+`<td class="tot">${vnum(t[g])}</td></tr>`});
  h+='</tbody></table></div><p class="muted">Ô xanh ✓ là trả lời đúng; ô đỏ ghi chữ cái nhóm đã chọn sai; “–” là chưa nộp thẻ.</p>';
  h+='<div class="row gap"><button class="btn" id="qbCopy">📋 Sao chép bảng</button><button class="btn" id="qbCsv">⬇ Tải CSV (Excel)</button><button class="btn" id="qbReset" style="color:var(--bad)">🗑 Xóa tất cả vòng</button></div>';
  box.innerHTML=h;
  const rows=()=>[['Hạng','Nhóm',...rs.map((_,i)=>'Vòng '+(i+1)),'Tổng điểm'],...order.map(g=>[rank[g],g,...rs.map(r=>{const a=r.ans[g];return !a?'':(r.key?(a===r.key?'Đúng':'Sai '+a):a)}),vnum(t[g])])];
  $('#qbCopy').onclick=async()=>{const txt=rows().map(r=>r.join('\t')).join('\n');try{await navigator.clipboard.writeText(txt);toast('Đã sao chép — dán vào Excel / Google Sheet')}catch(e){toast('Không sao chép được, hãy dùng nút Tải CSV')}};
  $('#qbCsv').onclick=()=>{const csv='﻿'+rows().map(r=>r.map(c=>/[",\n]/.test(String(c))?'"'+String(c).replace(/"/g,'""')+'"':c).join(',')).join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='diem-nhom-QR.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
  $('#qbReset').onclick=()=>{if(!confirm('Xóa kết quả của TẤT CẢ các vòng và bắt đầu lại từ Vòng 1?'))return;S.qr.rounds=[qrNewRound()];S.qr.cur=0;QC.obs={};QC.lastL={};save.qr();renderQR();toast('Đã xóa tất cả vòng')};
}

/* ---------- vòng chơi ---------- */
function qrGoRound(i){QC.obs={};QC.lastL={};S.qr.cur=i;save.qr();renderQR()}
$('#qrPrev').onclick=()=>{if(S.qr.cur>0)qrGoRound(S.qr.cur-1);else toast('Đây là vòng đầu tiên')};
$('#qrNext').onclick=()=>{const q=S.qr;
  if(q.cur<q.rounds.length-1)return qrGoRound(q.cur+1);
  const r=qrR();if(!Object.keys(r.ans).length&&!r.key){toast('Vòng này còn trống — quét thẻ trước rồi mới sang vòng mới');return}
  q.rounds.push(qrNewRound());qrGoRound(q.rounds.length-1)};
$('#qrKey').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const r=qrR();r.key=r.key===b.dataset.k?'':b.dataset.k;save.qr();renderQR()});
$('#qrPts').addEventListener('change',e=>{const v=num(e.target.value);qrR().pts=v>0?v:1;save.qr();renderQR()});
$('#qrN').addEventListener('change',e=>{S.qr.n=Math.min(24,Math.max(1,parseInt(e.target.value,10)||24));QC.to=0;save.qr();renderQR()});
$('#qrLock').onclick=()=>{const r=qrR();r.locked=!r.locked;save.qr();renderQR()};
$('#qrGrid').addEventListener('click',e=>{const b=e.target.closest('.qg');if(!b)return;const g=+b.dataset.g,r=qrR(),i=QL.indexOf(r.ans[g]||'');
  if(i===3)delete r.ans[g];else r.ans[g]=QL[i+1];save.qr();renderQR()});
$('#qrFinish').onclick=()=>{const q=S.qr,r=qrR(),got=Object.keys(r.ans).length;
  if(!got){toast('Chưa nhận được thẻ nào ở vòng này');return}
  if(!r.key&&!confirm('Chưa chọn đáp án đúng cho vòng này. Vẫn chốt và sang vòng mới? (Có thể quay lại chọn đáp án sau, điểm sẽ tự tính.)'))return;
  r.locked=true;const right=r.key?Object.values(r.ans).filter(a=>a===r.key).length:0;
  if(q.cur===q.rounds.length-1)q.rounds.push(qrNewRound());
  const msg='Đã chốt Vòng '+(q.cur+1)+(r.key?': '+right+'/'+got+' nhóm đúng':'');
  qrGoRound(q.cur+1);toast(msg,3200)};
$('#qrClear').onclick=()=>{const r=qrR();if(!Object.keys(r.ans).length&&!r.locked)return;if(!confirm('Xóa kết quả quét của Vòng '+(S.qr.cur+1)+' để quét lại?'))return;r.ans={};r.locked=false;QC.obs={};QC.lastL={};save.qr();renderQR()};
$('#qrDel').onclick=()=>{const q=S.qr;if(q.rounds.length<2){toast('Phải còn ít nhất một vòng');return}if(!confirm('Xóa hẳn Vòng '+(q.cur+1)+'?'))return;q.rounds.splice(q.cur,1);q.cur=Math.min(q.cur,q.rounds.length-1);QC.obs={};QC.lastL={};save.qr();renderQR()};
$('#qrSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;QC.tab=b.dataset.qt;lsSet('omr.qrtab',QC.tab);if(QC.tab!=='play')stopQrCam();renderQR()});

/* ---------- camera ---------- */
const qView=$('#qrView'),qCtx=qView.getContext('2d'),qVideo=$('#qrCam');
function qrHud(m,c){const h=$('#qrHud');h.textContent=m;h.className='qrhud '+(c||'')}
async function startQrCam(){
  if(QC.on)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.isSecureContext){qrHud('Camera cần mở trang bằng https (hoặc cài lên màn hình chính).','bad');return}
  try{
    unlockAudio();
    QC.stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:QC.hi?1920:1280},height:{ideal:QC.hi?1080:720}}});
    qVideo.srcObject=QC.stream;qVideo.setAttribute('playsinline','');qVideo.muted=true;await qVideo.play();
    QC.on=true;QC.trk=[];QC.obs={};QC.seen={};QC.lastL={};
    $('#qrStartBox').hidden=true;$('#qrCamBtns').hidden=false;
    const vw=qVideo.videoWidth,vh=qVideo.videoHeight;if(vw&&vh)$('#qrBox').style.aspectRatio=vw+'/'+vh;
    qrHud('Giơ máy về phía các nhóm — mỗi thẻ cần thấy rõ cả mã QR');
    QC.raf=requestAnimationFrame(qrTick);
  }catch(e){qrHud(e&&e.name==='NotAllowedError'?'Chưa cấp quyền camera. Vào Cài đặt › Safari › Camera, chọn “Hỏi” hoặc “Cho phép”.':'Không mở được camera: '+(e&&e.message||e),'bad')}
}
function stopQrCam(){
  QC.on=false;cancelAnimationFrame(QC.raf);if(QC.stream){QC.stream.getTracks().forEach(t=>t.stop());QC.stream=null}
  qVideo.srcObject=null;$('#qrStartBox').hidden=false;$('#qrCamBtns').hidden=true;$('#qrBox').style.aspectRatio='';qCtx.clearRect(0,0,qView.width,qView.height);qrHud('Bấm “Bắt đầu quét” để mở camera');save.qr()
}
function qrSizeView(){const r=qView.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=Math.round(r.width*d),h=Math.round(r.height*d);if(qView.width!==w||qView.height!==h){qView.width=w;qView.height=h}}
function qrTick(ts){
  if(!QC.on)return;QC.raf=requestAnimationFrame(qrTick);
  const vw=qVideo.videoWidth,vh=qVideo.videoHeight;if(!vw)return;
  qrSizeView();qCtx.drawImage(qVideo,0,0,qView.width,qView.height);
  if(ts-QC.last>130){QC.last=ts;try{qrProcess(qVideo,vw,vh,performance.now())}catch(e){console.error(e)}}
  qrDraw();
}
/* đọc một khung hình (video hoặc canvas) */
function qrProcess(src,vw,vh,now){
  const lim=QC.hi?1920:1280,s=Math.min(1,lim/Math.max(vw,vh)),ww=Math.round(vw*s),wh=Math.round(vh*s);
  if(!QC.wc){QC.wc=document.createElement('canvas');QC.wx=QC.wc.getContext('2d',{willReadFrequently:true})}
  if(QC.wc.width!==ww||QC.wc.height!==wh){QC.wc.width=ww;QC.wc.height=wh}
  QC.wx.drawImage(src,0,0,ww,wh);const id=QC.wx.getImageData(0,0,ww,wh);
  const r=qrScanFrame(id.data,ww,wh,QC.trk,{now,maxDec:6});QC.ww=ww;QC.wh=wh;
  qrIngest(r,now);return r;
}
function qrIngest(r,now){
  const n=S.qr.n,rd=qrR();let changed=false,fresh=0;
  r.codes.forEach(c=>{c.seen=now;QC.seen[c.g]=c;
    if(c.g>n||c.dev>30)return;
    const o=QC.obs[c.g]||(QC.obs[c.g]=[]);o.push({t:now,k:c.k})});
  QC.trk=r.codes.concat(QC.trk.filter(o=>now-o.seen<800&&!r.codes.some(c=>c.g===o.g)));
  for(const g in QC.obs){const o=QC.obs[g];while(o.length&&now-o[0].t>1600)o.shift();
    if(rd.locked||o.length<3)continue;
    const cnt=[0,0,0,0];o.forEach(x=>cnt[x.k]++);let k=0;for(let i=1;i<4;i++)if(cnt[i]>cnt[k])k=i;
    if(cnt[k]<3||cnt[k]/o.length<.6)continue;
    const L=QRX.LET[k];
    if(QC.lastL[g]!==L){QC.lastL[g]=L;if(rd.ans[g]!==L){if(!rd.ans[g])fresh++;rd.ans[g]=L;changed=true}}}
  if(changed){qrSaveSoon();beep(true)}
  if(changed||now-QC.liveT>400){QC.liveT=now;
    const vis=r.codes.length,got=Object.keys(rd.ans).length;
    if(QC.on)qrHud(vis?`Thấy ${vis} thẻ · đã nhận ${got}/${n} nhóm`:`Chưa thấy thẻ nào · đã nhận ${got}/${n} nhóm`,got===n&&n>0?'ok':'');
    if(QC.tab==='play')qrRenderLive()}
}
function qrDraw(){
  const f=qView.width/(QC.ww||qView.width),now=performance.now(),rd=qrR(),n=S.qr.n,fs=Math.max(13,Math.round(qView.width/34));
  qCtx.lineJoin='round';qCtx.textAlign='center';qCtx.textBaseline='middle';
  for(const g in QC.seen){const c=QC.seen[g];if(now-c.seen>550)continue;
    const a=rd.ans[g],out=c.g>n;let col='#38bdf8';
    if(out)col='#9ca3af';else if(c.dev>30)col='#fbbf24';else if(a&&rd.key)col=a===rd.key?'#22c55e':'#ef4444';
    qCtx.lineWidth=Math.max(3,qView.width/220);qCtx.strokeStyle=col;qCtx.beginPath();
    c.quad.forEach((p,i)=>{const x=p.x*f,y=p.y*f;i?qCtx.lineTo(x,y):qCtx.moveTo(x,y)});qCtx.closePath();qCtx.stroke();
    const lab=out?g+' ✕':g+' · '+(c.dev>30?'?':QRX.LET[c.k]);
    const cx=c.cx*f,cy=c.cy*f;qCtx.font='800 '+fs+'px system-ui,sans-serif';
    const tw=qCtx.measureText(lab).width+fs*.8;qCtx.fillStyle='rgba(10,12,20,.78)';qCtx.beginPath();
    if(qCtx.roundRect)qCtx.roundRect(cx-tw/2,cy-fs*.75,tw,fs*1.5,fs*.4);else qCtx.rect(cx-tw/2,cy-fs*.75,tw,fs*1.5);qCtx.fill();
    qCtx.fillStyle=col;qCtx.fillText(lab,cx,cy+1);
  }
}
$('#qrStart').onclick=startQrCam;
$('#qrStop').onclick=stopQrCam;
$('#qrHi').onclick=()=>{QC.hi=!QC.hi;lsSet('omr.qrhi',QC.hi);$('#qrHi').textContent=QC.hi?'Quét xa: BẬT':'Quét xa: TẮT';if(QC.on){stopQrCam();startQrCam()}};
$('#qrHi').textContent=QC.hi?'Quét xa: BẬT':'Quét xa: TẮT';

/* ---------- thẻ in ---------- */
function qrCardG(g,x,y,sz){
  const q=qrcode(0,'H');q.addData(qrText(g));q.make();
  const n=q.getModuleCount(),b=sz*.15,mod=(sz-2*b)/(n+8),e=.03;let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${((4+c)*mod+b).toFixed(3)} ${((4+r)*mod+b).toFixed(3)}h${(mod+e).toFixed(3)}v${(mod+e).toFixed(3)}h-${(mod+e).toFixed(3)}z`;
  const fs=b*.74,half=sz/2,tf=(cx,cy,rot,t,size)=>`<text transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${rot})" y="${(size*.36).toFixed(2)}" text-anchor="middle" font-size="${size.toFixed(2)}" font-weight="800" font-family="Arial,Helvetica,sans-serif" fill="#111">${t}</text>`;
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><rect x=".2" y=".2" width="${(sz-.4).toFixed(2)}" height="${(sz-.4).toFixed(2)}" rx="3" fill="#fff" stroke="#8a8f9c" stroke-width=".35" stroke-dasharray="2 1.5"/>`+
    `<path d="${d}" fill="#000" shape-rendering="crispEdges"/>`+
    tf(half,b/2,0,'A',fs)+tf(sz-b/2,half,90,'B',fs)+tf(half,sz-b/2,180,'C',fs)+tf(b/2,half,-90,'D',fs)+
    tf(b/2,b/2,0,g,fs*1.05)+tf(sz-b/2,sz-b/2,180,g,fs*1.05)+'</g>';
}
function qrPages(from,to,per){
  const P={1:{s:190,c:1,r:1},2:{s:140,c:1,r:2},6:{s:90,c:2,r:3}}[per]||{s:140,c:1,r:2},cw=210/P.c,ch=297/P.r,pn=P.c*P.r,out=[];
  for(let i=from;i<=to;i+=pn){let body='';
    for(let k=0;k<pn&&i+k<=to;k++){const col=k%P.c,row=Math.floor(k/P.c);body+=qrCardG(i+k,col*cw+(cw-P.s)/2,row*ch+(ch-P.s)/2,P.s)}
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm"><rect width="210" height="297" fill="#fff"/>${body}</svg>`)}
  return out;
}
function qrRange(){const n=S.qr.n;let a=parseInt($('#qcFrom').value,10)||1,b=parseInt($('#qcTo').value,10)||n;a=Math.min(Math.max(1,a),n);b=Math.min(Math.max(a,b),n);return[a,b]}
function qrRenderCards(){
  const n=S.qr.n,a=QC.from||1,b=QC.to||n;
  $('#qcFrom').value=a;$('#qcTo').value=Math.min(b,n);$('#qcPer').value=String(QC.per);
  $('#qcPrev').innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 102 102" class="qcsvg">'+qrCardG(a,0,0,100)+'</svg>';
  const [x,y]=[a,Math.min(b,n)],per=QC.per,pg=Math.ceil((y-x+1)/({1:1,2:2,6:6}[per]||2));
  $('#qcInfo').textContent=`Sẽ in thẻ nhóm ${x} → ${y} (${y-x+1} thẻ, ${pg} trang A4).`;
}
function qrPrintPages(pages){const r=$('#printRoot');r.innerHTML=pages.join('');document.body.classList.add('printing');setTimeout(()=>{window.print();setTimeout(()=>{document.body.classList.remove('printing');r.innerHTML=''},400)},150)}
['qcFrom','qcTo','qcPer'].forEach(id=>$('#'+id).addEventListener('change',()=>{const [a,b]=qrRange();QC.from=a;QC.to=b;QC.per=+$('#qcPer').value;lsSet('omr.qrper',QC.per);qrRenderCards()}));
$('#qcPrint').onclick=()=>{const [a,b]=qrRange();qrPrintPages(qrPages(a,b,+$('#qcPer').value))};
$('#qcDl').onclick=()=>{const [a,b]=qrRange(),pg=qrPages(a,b,+$('#qcPer').value);
  const html='<!doctype html><html lang="vi"><meta charset="utf-8"><title>Thẻ QR nhóm '+a+'-'+b+'</title><style>@page{size:A4;margin:0}body{margin:0;background:#fff}svg{display:block;width:210mm;height:297mm;break-after:page}svg:last-child{break-after:auto}@media screen{svg{margin:8px auto;box-shadow:0 0 6px #aaa}body{background:#ddd}}</style><body>'+pg.join('')+'</body></html>';
  const el=document.createElement('a');el.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));el.download='the-QR-nhom-'+a+'-'+b+'.html';document.body.appendChild(el);el.click();setTimeout(()=>{URL.revokeObjectURL(el.href);el.remove()},1500)};

/* ---------- khởi động (chạy sau cùng) ---------- */
document.addEventListener('visibilitychange',()=>{if(document.hidden&&QC.on)stopQrCam()});
Object.assign(window.OMR,{QC,qrProcess,qrIngest,qrScanFrame,qrR,qrTotals,qrCardG,qrPages,renderQR,startQrCam,stopQrCam,qrNewRound});
