/* ===================== TRẠNG THÁI ===================== */
const DEF={layout:'half',school:'',exam:'',date:'',thr:0.2,sound:true,auto:true,ptsTn:'',ptsTln:'',ptsDs:'',gsUrl:'',gsSheet:'',gsToken:'',gsAuto:true,msgStyle:'am',msgThr:5,msgAll:false};
const S={cfg:Object.assign({},DEF,lsGet('omr.cfg',{})),keys:lsGet('omr.keys',{}),scans:lsGet('omr.scans',[]),roster:{},classes:lsGet('omr.classes',null),exams:lsGet('omr.exams',null),cur:lsGet('omr.cur',null)};
const save={cfg:()=>lsSet('omr.cfg',S.cfg),keys:()=>lsSet('omr.keys',S.keys),scans:()=>{lsSet('omr.scans',S.scans);queueSync()},classes:()=>{lsSet('omr.classes',S.classes);rebuildRoster();queueSync()},exams:()=>{lsSet('omr.exams',S.exams);queueSync()},cur:()=>lsSet('omr.cur',S.cur)};
/* ----- Bài kiểm tra: mỗi bài có lớp, số câu, thang điểm và đáp án riêng ----- */
const num=x=>{const v=parseFloat(String(x==null?'':x).replace(',','.'));return isNaN(v)?0:v};
const vnum=x=>String(Math.round(num(x)*1000)/1000).replace('.',',');
const todayISO=()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())};
const vnDate=iso=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(iso||'');return m?m[3]+'/'+m[2]+'/'+m[1]:(iso||'')};
function defExamFor(layout){const L=getLayout(layout),p=defaultPts(L);return{layout,nTN:L.nTN,pTn:p.tn,nDS:L.nDS,pDs:p.ds.slice(1),nTLN:L.nTLN,pTln:p.tln}}
function newExam(o){return Object.assign({id:'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:'',date:todayISO(),lop:'',keys:{},t:Date.now()},defExamFor(S.cfg.layout),o)}
function migrate(){
  if(Array.isArray(S.exams)&&S.exams.length){if(!S.exams.some(e=>e.id===S.cur))S.cur=S.exams[0].id;return}
  S.exams=[];const lays=[...new Set([...Object.keys(S.keys||{}),...S.scans.map(x=>x.layout||'thpt2025')])].filter(k=>LAYOUT_NAMES[k]);
  if(!lays.length)lays.push(S.cfg.layout);
  lays.forEach((id,i)=>{const o=Object.assign(defExamFor(id),{name:lays.length>1||S.scans.length?'Bài đã quét '+(lays.length>1?(i+1):''):'Bài 1',keys:(S.keys||{})[id]||{}});o.name=o.name.trim();
    if(id===S.cfg.layout){const L=getLayout(id);if(String(S.cfg.ptsTn).trim())o.pTn=num(S.cfg.ptsTn);if(L.nDS&&String(S.cfg.ptsTln).trim())o.pTln=num(S.cfg.ptsTln);
      const ds=String(S.cfg.ptsDs||'').split(';');if(L.nDS&&ds.length===5&&ds.every(x=>x.trim()!==''))o.pDs=ds.slice(1).map(num)}
    const ex=newExam(o);S.scans.forEach(x=>{if(!x.examId&&(x.layout||'thpt2025')===id)x.examId=ex.id});S.exams.push(ex)});
  S.cur=(S.exams.find(e=>e.layout===S.cfg.layout)||S.exams[0]).id;S.keys={};
  save.exams();save.cur();save.scans();save.keys();
}
/* ----- Lớp: danh sách STT, Họ tên, SBD ----- */
const lc=x=>String(x||'').trim().toLowerCase();
function rebuildRoster(){S.rIdx={};S.roster={};(S.classes||[]).forEach(c=>c.students.forEach((st,i)=>{const k=String(parseInt(st.sbd,10));if(!st.sbd||k==='NaN')return;const e={name:st.name,lop:c.name,stt:i+1};(S.rIdx[k]||(S.rIdx[k]=[])).push(e);if(!S.roster[k])S.roster[k]=e}))}
const sid=()=>'s'+Math.random().toString(36).slice(2,8);
function ensureStudentIds(){let ch=false;(S.classes||[]).forEach(c=>c.students.forEach(x=>{if(!x.id){x.id=sid();ch=true}}));return ch}
function migrateClasses(){
  if(Array.isArray(S.classes)){rebuildRoster();if(ensureStudentIds())lsSet('omr.classes',S.classes);return}
  S.classes=[];const old=lsGet('omr.roster',{}),by={};
  Object.entries(old).sort((a,b)=>(+a[0])-(+b[0])).forEach(([id,r])=>{const n=String(r.lop||'').trim()||'Chưa rõ lớp';(by[n]||(by[n]=[])).push({name:r.name,sbd:id})});
  Object.keys(by).forEach(n=>S.classes.push({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:n,students:by[n]}));
  ensureStudentIds();lsSet('omr.classes',S.classes);rebuildRoster();
}
migrateClasses();
migrate();
const exById=id=>(S.exams||[]).find(e=>e.id===id)||null;
const curEx=()=>exById(S.cur)||S.exams[0];
const LY=()=>getLayout(curEx().layout);
const myScans=()=>S.scans.filter(s=>s.examId===curEx().id);
const exOf=s=>exById(s.examId)||curEx();
const keyOf=md=>((curEx().keys)||{})[md]||null;
const ptsOf=ex=>({tn:num(ex.pTn),tln:num(ex.pTln),ds:[0,num(ex.pDs[0]),num(ex.pDs[1]),num(ex.pDs[2]),num(ex.pDs[3])],nTN:ex.nTN,nDS:ex.nDS,nTLN:ex.nTLN});
const ptsNow=()=>ptsOf(curEx());
const totalOf=ex=>ex.nTN*num(ex.pTn)+ex.nDS*Math.max(0,...[0,1,2,3].map(i=>num(ex.pDs[i])))+ex.nTLN*num(ex.pTln);
const scoreOf=s=>{const ex=exOf(s);return scoreScan(s,(ex.keys||{})[s.md]||null,getLayout(s.layout||ex.layout),ptsOf(ex))};
const exSub=ex=>[ex.lop||'',vnDate(ex.date)].filter(Boolean).join(' · ');
const exCnt=ex=>S.scans.filter(s=>s.examId===ex.id).length;
const exDesc=ex=>`TN ${ex.nTN}×${vnum(ex.pTn)}`+(ex.nDS?` · ĐS ${ex.nDS}`:'')+(ex.nTLN?` · TLN ${ex.nTLN}×${vnum(ex.pTln)}`:'')+` · Σ ${vnum(totalOf(ex))} điểm`;
function selectEx(id){const ex=exById(id);if(!ex)return;S.cur=id;save.cur();S.cfg.layout=ex.layout;S.cfg.exam=ex.name;S.cfg.date=vnDate(ex.date);save.cfg();cam.locked=false;updCount();updExLbl()}
function updExLbl(){const ex=curEx(),t='📝 '+ex.name+(ex.lop?' · '+ex.lop:'')+'  ▸';$$('.exlbl').forEach(e=>e.textContent=t)}
const rosterOf=(sbd,ex)=>{const a=S.rIdx[String(parseInt(sbd,10))];if(!a)return null;const l=lc((ex||curEx()).lop);return a.find(x=>lc(x.lop)===l)||a[0]};
const clsOf=ex=>(S.classes||[]).find(c=>lc(c.name)===lc(ex.lop)&&lc(ex.lop)!=='')||null;
let toastT;function toast(m,ms){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms||2600)}

/* ===================== ĐỒNG BỘ GOOGLE SHEET ===================== */
const GS_CODE=/*GSCODE*/;
function gsOn(){return /^https:\/\/script\.google\.com\//.test(String(S.cfg.gsUrl||'').trim())}
const gsSheetId=()=>{const v=String(S.cfg.gsSheet||'').trim(),m=/\/spreadsheets\/d\/([\w-]+)/.exec(v);return m?m[1]:(/^[\w-]{25,}$/.test(v)?v:'')};
function gsRows(ex){
  const L=getLayout(ex.layout),out=[];
  S.scans.filter(x=>x.examId===ex.id&&!/\?/.test(x.sbd)).forEach(x=>{const sc=scoreOf(x),nm=rosterOf(x.sbd,ex),r4=n=>sc?Math.round(n*10000)/10000:null;
    out.push({sbd:x.sbd,name:nm?nm.name:'',lop:(nm&&nm.lop)||ex.lop||'',md:x.md,score:sc?Math.round(sc.total*10000)/10000:null,sTN:sc?r4(sc.sTN):null,sDS:sc?r4(sc.sDS):null,sTL:sc?r4(sc.sTL):null,flags:(x.flags||[]).length})});
  const c=clsOf(ex);if(c){const seen=new Set(out.map(r=>String(parseInt(r.sbd,10))));c.students.forEach(st=>{const k=String(parseInt(st.sbd,10));if(!st.sbd||seen.has(k))return;out.push({sbd:String(st.sbd),name:st.name,lop:c.name,md:'',score:null,sTN:null,sDS:null,sTL:null,flags:0,absent:true})})}
  out.sort((a,b)=>a.sbd.localeCompare(b.sbd,undefined,{numeric:true}));return out;
}
const gsBody=(ex,rows)=>({exam:{id:ex.id,name:ex.name,date:vnDate(ex.date),lop:ex.lop||'',total:Math.round(totalOf(ex)*1000)/1000},rows});
async function gsPost(body){
  const payload=JSON.stringify(Object.assign({token:S.cfg.gsToken||'',sheetId:gsSheetId()},body));
  try{const r=await fetch(S.cfg.gsUrl.trim(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:payload,redirect:'follow'});
    const t=await r.text();try{return JSON.parse(t)}catch(_){return{ok:false,error:/<title>([^<]*)/i.exec(t)?'Google trả về: '+/<title>([^<]*)/i.exec(t)[1]:'Phản hồi không hợp lệ (kiểm tra quyền truy cập “Bất kỳ ai” khi triển khai)'}}}
  catch(e){try{await fetch(S.cfg.gsUrl.trim(),{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:payload});return{ok:true,unconfirmed:true}}catch(e2){return{ok:false,error:'Không có kết nối mạng'}}}
}
let gsTimer=0,gsBusy=false,gsAgain=false;const gsSt={msg:'',ok:null};
function gsStatus(msg,ok){gsSt.msg=msg;gsSt.ok=ok;const el=$('#gsState');if(el){el.textContent=msg;el.className='gsstate '+(ok===true?'ok':ok===false?'bad':'')}const rl=$('#gsRes');if(rl)rl.textContent=msg}
function queueSync(){if(!gsOn()||!S.cfg.gsAuto)return;clearTimeout(gsTimer);gsTimer=setTimeout(()=>syncAll(false),2500)}
async function syncExam(ex,force){
  const rows=gsRows(ex),body=gsBody(ex,rows),sig=JSON.stringify(body);
  if(!force&&sig===ex.gsSig)return'same';if(!force&&!rows.length&&!ex.gsSig)return'skip';
  const r=await gsPost(body);if(r&&r.ok){ex.gsSig=sig;ex.gsT=Date.now();lsSet('omr.exams',S.exams);return r.unconfirmed?'sent':'ok'}throw new Error((r&&r.error)||'Lỗi không rõ');
}
async function syncAll(force,only){
  if(!gsOn())return gsStatus('Chưa nối Google Sheet — vào Cài đặt',null);
  if(gsBusy){gsAgain=true;return}gsBusy=true;let n=0,err=null;gsStatus('Đang lưu lên Google Sheet…',null);
  try{for(const ex of(only?[only]:S.exams)){const r=await syncExam(ex,force);if(r==='ok'||r==='sent')n++}}catch(e){err=e}
  gsBusy=false;
  if(err){gsStatus('⚠ Chưa lưu được: '+(err.message||err)+' (sẽ thử lại)',false);if(S.cfg.gsAuto)setTimeout(queueSync,60000);return}
  const hh=new Date(),z=x=>String(x).padStart(2,'0');gsStatus((n?'☁ Đã lưu lên Google Sheet lúc ':'☁ Google Sheet đã cập nhật (')+z(hh.getHours())+':'+z(hh.getMinutes())+(n?'':')'),true);
  if(gsAgain){gsAgain=false;queueSync()}
}
window.addEventListener('online',()=>queueSync());

/* ===================== LƯU ẢNH MINH CHỨNG (IndexedDB) ===================== */
const idb=(()=>{let db=null;const open=()=>new Promise((res,rej)=>{if(db)return res(db);try{const r=indexedDB.open('omr',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
  const run=(mode,fn)=>open().then(d=>new Promise((res,rej)=>{const t=d.transaction('img',mode),st=t.objectStore('img'),q=fn(st);t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})).catch(()=>null);
  return{put:(k,v)=>run('readwrite',s=>s.put(v,k)),get:k=>run('readonly',s=>s.get(k)),del:k=>run('readwrite',s=>s.delete(k)),clear:()=>run('readwrite',s=>s.clear())}})();

/* ===================== ÂM THANH ===================== */
let AC=null;function unlockAudio(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function beep(ok){if(!S.cfg.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
  const t=AC.currentTime,tone=(f,s,d)=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.0001,t+s);g.gain.exponentialRampToValueAtTime(0.35,t+s+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+s+d);o.connect(g);g.connect(AC.destination);o.start(t+s);o.stop(t+s+d+0.02)};
  if(ok){tone(880,0,0.09);tone(1320,0.1,0.12)}else tone(220,0,0.25)}catch(e){}}

/* ===================== LƯU MỘT PHIẾU ĐÃ ĐỌC ===================== */
function flagIds(fl){return fl.map(f=>f.id)}
async function commitScan(A,L,src){
  const r=A.res,complete=!/\?/.test(r.sbd);
  let rec=null;
  if(complete)rec=S.scans.find(s=>s.sbd===r.sbd&&s.md===r.md&&s.examId===curEx().id);
  const o={id:rec?rec.id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:Date.now(),layout:L.id,examId:curEx().id,sbd:r.sbd,md:r.md,tn:r.tn,ds:r.ds,tln:r.tln,flags:flagIds(A.flags),src:src||'cam'};
  if(rec){S.scans[S.scans.indexOf(rec)]=o}else S.scans.push(o);
  save.scans();
  try{const url=rectified(A.G,A.W,A.Hh,A.H,L,420);idb.put(o.id,url)}catch(e){}
  return{o,dup:!!rec};
}
function chipText(o){const sc=scoreOf(o),nm=rosterOf(o.sbd);
  return `SBD ${o.sbd}${nm?' · '+nm.name:''} · mã ${o.md}`+(sc?` → ${fmt(sc.total)} điểm`:' (chưa có đáp án)')}

/* ===================== CAMERA / QUÉT ===================== */
const cam={on:false,stream:null,raf:0,last:0,A:null,prevSig:null,stable:0,lost:0,locked:false,prevQuad:null,acc:0};
const view=$('#view'),vctx=view.getContext('2d'),video=$('#cam');
let vmap={s:1,ox:0,oy:0};
function sizeView(){const r=view.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=Math.round(r.width*d),h=Math.round(r.height*d);if(view.width!==w||view.height!==h){view.width=w;view.height=h}return d}
function hud(msg,cls){const h=$('#hud');h.textContent=msg;h.className='hud '+(cls||'')}
async function startCam(){
  if(cam.on)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.isSecureContext){hud('Camera cần mở trang bằng https (hoặc cài lên màn hình chính). Có thể bấm “Chụp ảnh phiếu” bên dưới.','bad');return}
  try{
    unlockAudio();
    cam.stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
    video.srcObject=cam.stream;video.setAttribute('playsinline','');video.muted=true;await video.play();
    cam.on=true;cam.locked=false;cam.stable=0;cam.prevSig=null;$('#startBox').hidden=true;$('#camBtns').hidden=false;hud('Đưa 4 ô vuông đen ở góc phiếu vào khung hình');
    cam.raf=requestAnimationFrame(tick);
  }catch(e){hud(e&&e.name==='NotAllowedError'?'Chưa cấp quyền camera. Vào Cài đặt › Safari › Camera, chọn “Hỏi” hoặc “Cho phép”.':'Không mở được camera: '+(e&&e.message||e),'bad')}
}
function stopCam(){cam.on=false;cancelAnimationFrame(cam.raf);if(cam.stream){cam.stream.getTracks().forEach(t=>t.stop());cam.stream=null}video.srcObject=null;$('#startBox').hidden=false;$('#camBtns').hidden=true;vctx.clearRect(0,0,view.width,view.height);cam.A=null}
function tick(ts){
  if(!cam.on)return;cam.raf=requestAnimationFrame(tick);
  const vw=video.videoWidth,vh=video.videoHeight;if(!vw)return;
  sizeView();const cw=view.width,ch=view.height,s=Math.min(cw/vw,ch/vh);vmap={s,ox:(cw-vw*s)/2,oy:(ch-vh*s)/2};
  vctx.fillStyle='#000';vctx.fillRect(0,0,cw,ch);vctx.drawImage(video,vmap.ox,vmap.oy,vw*s,vh*s);
  if(ts-cam.last>110){cam.last=ts;try{step(analyze(video,vw,vh,LY(),+S.cfg.thr||0.2,{workLong:1280}),vw)}catch(e){console.error(e)}}
  drawOverlay();
}
function sigOf(r){return JSON.stringify([r.sbd,r.md,r.tn,r.ds,r.tln])}
function step(A,vw){
  cam.A=A;
  if(!A.ok){cam.lost++;cam.stable=0;cam.prevSig=null;cam.prevQuad=null;if(cam.lost>6)cam.locked=false;
    if(!cam.locked)hud(A.why,'');return}
  cam.lost=0;
  const q=A.quad.map(p=>[p[0]/A.W,p[1]/A.Hh]);let mv=1;
  if(cam.prevQuad)mv=q.reduce((s,p,i)=>s+Math.hypot(p[0]-cam.prevQuad[i][0],p[1]-cam.prevQuad[i][1]),0)/4;cam.prevQuad=q;
  if(cam.locked){hud('✓ Đã lưu — đưa phiếu tiếp theo','ok');return}
  const sig=sigOf(A.res);
  if(sig===cam.prevSig&&mv<0.02)cam.stable++;else cam.stable=1;cam.prevSig=sig;
  const nf=A.flags.length;
  hud(cam.stable>=3?'Đang chốt…':'Giữ yên máy… ('+cam.stable+'/3)'+(nf?'  ⚠ '+nf+' ô chưa rõ':''),'');
  if(S.cfg.auto&&cam.stable>=3&&A.noise<0.3)accept(A);
}
async function accept(A){
  cam.locked=true;const L=LY();
  const {o,dup}=await commitScan(A,L,'cam');
  beep(true);const f=$('#flash');f.classList.add('on');setTimeout(()=>f.classList.remove('on'),160);
  const sc=scoreOf(o);
  showChip(o,dup);hud('✓ '+chipText(o)+(o.flags.length?'  ⚠ '+o.flags.length+' ô cần xem':''),'ok');
  updCount();
}
function showChip(o,dup){
  const c=$('#chip'),sc=scoreOf(o),nm=rosterOf(o.sbd);
  c.innerHTML=`<div><b>${esc(o.sbd)}</b>${nm?' · '+esc(nm.name):''}<small> · mã ${esc(o.md)}${dup?' · cập nhật':''}</small></div><div class="big">${sc?fmt(sc.total):'?'}</div><button class="btn sm" id="chipOpen">Xem</button><button class="btn sm ghost" id="chipUndo">Hoàn tác</button>`;
  c.hidden=false;clearTimeout(c._t);c._t=setTimeout(()=>c.hidden=true,6000);
  $('#chipOpen').onclick=()=>openDetail(o.id);$('#chipUndo').onclick=async()=>{S.scans=S.scans.filter(s=>s.id!==o.id);save.scans();idb.del(o.id);c.hidden=true;cam.locked=false;updCount();toast('Đã hoàn tác')};
}
function updCount(){const n=myScans().length;$('#cnt').textContent=n;$('#tabCnt').textContent=n?n:''}
function vp(A,x,y){const p=mapH(A.H,x,y),k=1/A.scale;return[vmap.ox+p[0]*k*vmap.s,vmap.oy+p[1]*k*vmap.s]}
function drawOverlay(){
  const A=cam.A;if(!A||!A.ok)return;const L=LY(),res=A.res,key=keyOf(res.md),sc=key?scoreScan(res,key,L,ptsNow()):null;
  vctx.lineWidth=3;vctx.strokeStyle='rgba(52,211,153,.95)';vctx.beginPath();
  A.quad.forEach((p,i)=>{const k=1/A.scale,x=vmap.ox+p[0]*k*vmap.s,y=vmap.oy+p[1]*k*vmap.s;i?vctx.lineTo(x,y):vctx.moveTo(x,y)});vctx.closePath();vctx.stroke();
  const col={ok:'rgba(34,197,94,.85)',bad:'rgba(239,68,68,.9)',un:'rgba(250,204,21,.95)',pick:'rgba(59,130,246,.85)'};
  const dot=(g,k,c,ring)=>{const p=g.pts[k],a=vp(A,p[0],p[1]),b=vp(A,p[0]+(g.r||L.r),p[1]),r=Math.max(3,Math.hypot(a[0]-b[0],a[1]-b[1]));
    vctx.beginPath();vctx.arc(a[0],a[1],r*(ring?1.25:0.95),0,7);if(ring){vctx.strokeStyle=c;vctx.lineWidth=2.5;vctx.stroke()}else{vctx.fillStyle=c;vctx.fill()}};
  L.groups.forEach(g=>{const d=A.pk[g.id];if(!d)return;const flagged=A.flags.some(f=>f.id===g.id);
    if(d.i===-2){g.pts.forEach((_,k)=>{if(d.fs[k]>0.15)dot(g,k,col.un,true)});return}
    if(d.i>=0){let c=col.pick;
      if(sc){const q=g.q,kind=g.kind;let ok=null;
        if(kind==='tn')ok=sc.d.tn[q-1];else if(kind==='ds')ok=sc.d.ds[q-1][g.i];else if(kind==='tln')ok=sc.d.tln[q-1];
        if(ok!==null&&ok!==undefined)c=ok?col.ok:col.bad}
      dot(g,d.i,flagged?col.un:c,false)}
    else if(flagged&&d.i===-1)dot(g,d.fs.indexOf(Math.max(...d.fs)),col.un,true);
    if(sc&&d.i!==-2&&g.kind==='tn'&&sc.d.tn[g.q-1]===false&&key.tn[g.q-1])dot(g,'ABCD'.indexOf(key.tn[g.q-1]),col.ok,true);
  });
}
/* ảnh từ thư viện / chụp bằng ứng dụng Camera */
async function handleFiles(files){
  files=[...files];if(!files.length)return;let ok=0,last=null;hud('Đang đọc '+files.length+' ảnh…');
  for(const f of files){
    try{
      let bmp;try{bmp=await createImageBitmap(f,{imageOrientation:'from-image'})}catch(e){bmp=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=URL.createObjectURL(f)})}
      const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,A=analyze(bmp,w,h,LY(),+S.cfg.thr||0.2,{workLong:1800});
      window.__lastA=A;
      if(A.ok){const r=await commitScan(A,LY(),'img');last=r.o;ok++}else toast(f.name+': '+A.why,4200);
    }catch(e){toast('Không đọc được ảnh: '+(e&&e.message||e),4200)}
  }
  updCount();if(ok){beep(true);if(files.length===1&&last){openDetail(last.id)}else toast('Đã đọc '+ok+'/'+files.length+' ảnh')}else beep(false);
  hud(ok?'Đã đọc '+ok+' ảnh':'Không đọc được ảnh nào','');
}

/* ===================== ĐIỀU HƯỚNG ===================== */
function go(tab){
  $$('.screen').forEach(s=>s.hidden=s.id!=='s-'+tab);const hl=['settings','help','qr','gb','prog','rep'].includes(tab)?'home':tab;$$('.tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.tab===hl));
  if(tab!=='scan')stopCam();if(tab!=='qr')stopQrCam();
  if(tab==='home')renderHome();if(tab==='results')renderResults();if(tab==='keys')renderKeys();if(tab==='class')renderClass();if(tab==='sheet')renderSheet();if(tab==='settings')renderSettings();if(tab==='qr')renderQR();if(tab==='gb')renderGB();if(tab==='prog')renderProg();if(tab==='rep')renderRep();if(tab==='settings')bkRender();
  lsSet('omr.tab',tab);window.scrollTo(0,0);
}
$$('.tabbar button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cam.on)stopCam()});
$('#startCam').addEventListener('click',startCam);
$('#stopCam').addEventListener('click',stopCam);
$('#snapNow').addEventListener('click',()=>{const A=cam.A;if(A&&A.ok)accept(A);else toast('Chưa thấy đủ 4 góc phiếu')});
$('#autoTg').addEventListener('click',()=>{S.cfg.auto=!S.cfg.auto;save.cfg();$('#autoTg').textContent=S.cfg.auto?'Tự chốt: BẬT':'Tự chốt: TẮT'});
$('#fileCap').addEventListener('change',e=>{handleFiles(e.target.files);e.target.value=''});
$('#fileMulti').addEventListener('change',e=>{handleFiles(e.target.files);e.target.value=''});

/* ===================== TRANG CHỦ ===================== */
function qsSteps(){
  const ex=curEx(),hasCls=S.classes.some(c=>c.students.length),hasExam=S.exams.some(e=>String(e.lop||'').trim()),hasKey=Object.keys(ex.keys||{}).length>0,hasScan=S.scans.some(x=>x.examId===ex.id);
  return[{ok:hasCls,t:'Tạo lớp và danh sách học sinh',d:'Số thứ tự, họ tên, số báo danh',go:'class',b:'Tạo lớp'},
   {ok:hasExam,t:'Tạo bài kiểm tra',d:'Tên bài, lớp, số câu, điểm từng phần',go:'keys',b:'Tạo bài'},
   {ok:hasKey,t:'Nhập đáp án',d:'Gõ, dán hoặc nhập từ Excel / Google Sheet',go:'keys',b:'Nhập đáp án'},
   {ok:!!S.cfg.printed,t:'In phiếu trả lời cho học sinh',d:'Nửa tờ A4: cắt đôi được 2 phiếu',go:'sheet',b:'In phiếu'},
   {ok:hasScan,t:'Quét phiếu và xem điểm',d:'Đưa camera vào phiếu, nghe “bíp” là xong',go:'scan',b:'Quét ngay'}];
}
function renderHome(){
  const ex=curEx(),n=myScans().length,st=qsSteps(),done=st.filter(x=>x.ok).length,next=st.findIndex(x=>!x.ok);
  let h=`<div class="hero"><div class="hlogo">📷</div><h1>Chấm phiếu VTL</h1><p>Chấm trắc nghiệm bằng camera điện thoại — nhanh, chính xác, không cần máy chấm.</p><div class="by">Thầy Vũ Tiến Lực<span>Trường THPT Nguyễn Hữu Cảnh · TP Hồ Chí Minh</span></div></div>`;
  h+=bkCard();
  h+=`<div class="card cur"><div class="curh"><small>Bài đang chấm</small><b>${esc(ex.name)}</b><span>${esc(exSub(ex)||'Chưa ghi lớp')} · ${n} phiếu đã quét</span></div><button class="btn primary big" id="hmScan">📷 Quét phiếu ngay</button><div class="row gap" style="margin:8px 0 0"><button class="btn sm" data-go="results">📊 Xem kết quả</button><button class="btn sm" data-go="keys">🔄 Đổi / tạo bài</button></div></div>`;
  h+=`<div class="card"><div class="qh"><h3>Bắt đầu nhanh</h3><span class="pill${done===5?' okp':''}">${done}/5 bước</span></div><div class="prog"><i style="width:${done*20}%"></i></div>`;
  h+=done===5?`<p class="muted">🎉 Thầy đã hoàn thành đủ các bước. Từ giờ chỉ cần chọn bài rồi quét phiếu.</p>`:'';
  h+='<ol class="qs">'+st.map((x,i)=>`<li class="${x.ok?'ok':i===next?'next':''}"><span class="dot">${x.ok?'✓':i+1}</span><div class="l"><b>${x.t}</b><small>${x.d}</small></div>${x.ok?'':`<button class="btn sm${i===next?' primary':''}" data-go="${x.go}">${x.b}</button>`}</li>`).join('')+'</ol></div>';
  h+=`<div class="tiles"><button class="tile wide" data-go="qr"><i>👥</i><span><b>Chấm nhóm bằng thẻ QR</b><small>Hoạt động nhóm: mỗi nhóm giơ thẻ xoay 4 hướng A-B-C-D, quét một lần cả lớp</small></span></button><button class="tile" data-go="gb"><i>📒</i><b>Sổ điểm</b><small>TX, giữa kỳ, cuối kỳ, ĐTB theo hệ số</small></button><button class="tile" data-go="prog"><i>📈</i><b>Tiến bộ &amp; so sánh lớp</b><small>Biểu đồ từng em, xếp hạng lớp</small></button><button class="tile wide" data-go="rep"><i>📄</i><span><b>Phiếu điểm &amp; tra cứu điểm</b><small>PDF gửi phụ huynh kèm ảnh bài làm; mã tra cứu cho học sinh</small></span></button><button class="tile" data-go="help"><i>📖</i><b>Hướng dẫn sử dụng</b><small>Từng bước cho người mới</small></button><button class="tile" data-go="settings"><i>⚙️</i><b>Cài đặt</b><small>Google Sheet, sao lưu, độ nhạy</small></button></div>`;
  h+=`<div class="authorbox"><b>Tác giả: Thầy Vũ Tiến Lực</b><span>Trường THPT Nguyễn Hữu Cảnh · TP Hồ Chí Minh</span></div>`;
  $('#homeBody').innerHTML=h;
  $('#hmScan').onclick=()=>{go('scan');startCam()};
}

/* ===================== KẾT QUẢ ===================== */
let sortBy='t';
function stats(list){const v=list.map(s=>scoreOf(s)).filter(Boolean).map(x=>x.total);if(!v.length)return null;const sum=v.reduce((a,b)=>a+b,0);return{n:v.length,mean:sum/v.length,max:Math.max(...v),min:Math.min(...v),v}}
function renderResults(){
  const L=LY(),ex=curEx(),list=myScans().slice();
  list.sort((a,b)=>sortBy==='t'?b.t-a.t:sortBy==='sbd'?a.sbd.localeCompare(b.sbd):((scoreOf(b)||{total:-1}).total-(scoreOf(a)||{total:-1}).total));
  const st=stats(list);
  let h=`<button class="expill" data-go="keys"><span><b>${esc(ex.name)}</b><small>${esc(exSub(ex)||'Chưa ghi lớp')} · ${esc(exDesc(ex))}</small></span><i>Đổi bài ▸</i></button>`;
  h+=`<div class="card sum"><div><b>${list.length}</b><small>bài</small></div><div><b>${st?fmt(st.mean):'–'}</b><small>điểm TB</small></div><div><b>${st?fmt(st.max):'–'}</b><small>cao nhất</small></div><div><b>${st?fmt(st.min):'–'}</b><small>thấp nhất</small></div></div>`;
  if(st){const tot=totalOf(ex)||10,bins=[0,0,0,0,0,0,0,0,0,0];st.v.forEach(x=>bins[Math.max(0,Math.min(9,Math.floor(x/tot*10+1e-9)))]++);const mx=Math.max(...bins,1);
    h+=`<div class="card"><div class="hist">${bins.map((b,i)=>`<div><i style="height:${Math.round(b/mx*100)}%"></i><span>${tot===10?i+'–'+(i+1):fmt(i*tot/10)}</span><em>${b||''}</em></div>`).join('')}</div></div>`}
  h+=`<div class="row bar"><div class="seg">${[['t','Mới nhất'],['sbd','Theo SBD'],['sc','Điểm cao']].map(x=>`<button class="${sortBy===x[0]?'on':''}" data-sort="${x[0]}">${x[1]}</button>`).join('')}</div></div>`;
  h+=list.length?'<div class="list">'+list.map(s=>{const sc=scoreOf(s),nm=rosterOf(s.sbd);return `<button class="item" data-id="${s.id}"><div class="l"><b>${esc(s.sbd)}${nm?' · '+esc(nm.name):''}</b><small>Mã ${esc(s.md)}${nm&&nm.lop?' · '+esc(nm.lop):''}${s.edited?' · đã sửa':''}</small></div>${s.flags&&s.flags.length?`<span class="pill warn">⚠ ${s.flags.length}</span>`:''}<div class="sc ${sc?'':'none'}">${sc?fmt(sc.total):'?'}</div></button>`}).join('')+'</div>':'<div class="empty">Chưa có bài nào. Sang tab “Quét” để bắt đầu.</div>';
  // phân tích câu
  const withKey=list.map(s=>({s,sc:scoreOf(s)})).filter(x=>x.sc);
  if(withKey.length>=2){
    const parts=[];const pct=a=>Math.round(a.filter(Boolean).length/a.length*100);
    for(let i=0;i<Math.min(L.nTN,ex.nTN);i++)parts.push({n:'Câu '+(i+1),p:pct(withKey.map(x=>x.sc.d.tn[i]))});
    for(let q=0;q<Math.min(L.nDS,ex.nDS);q++)parts.push({n:'ĐS '+(q+1),p:Math.round(withKey.reduce((a,x)=>a+x.sc.d.ds[q].filter(Boolean).length,0)/(withKey.length*4)*100)});
    for(let q=0;q<Math.min(L.nTLN,ex.nTLN);q++)parts.push({n:'TLN '+(q+1),p:pct(withKey.map(x=>x.sc.d.tln[q]))});
    h+=`<div class="card"><h3>Tỉ lệ làm đúng từng câu</h3><div class="ia">${parts.map(x=>`<div><span>${x.n}</span><i><b style="width:${x.p}%;background:${x.p<40?'var(--bad)':x.p<70?'var(--warn)':'var(--ok)'}"></b></i><em>${x.p}%</em></div>`).join('')}</div></div>`}
  const cls=clsOf(ex);
  if(cls){const seen=new Set(list.map(x=>String(parseInt(x.sbd,10)))),miss=cls.students.map((st,i)=>({st,i})).filter(({st})=>!seen.has(String(parseInt(st.sbd,10))));
    if(miss.length)h+=`<details class="card"><summary>Lớp ${esc(ex.lop)} · chưa có bài của ${miss.length}/${cls.students.length} học sinh</summary><div class="muted">${miss.map(({st,i})=>esc((i+1)+'. '+st.name+(st.sbd?' · '+st.sbd:''))).join('<br>')}</div></details>`}
  h+=`<div class="card gsrow"><div class="l"><b>☁ Google Sheet</b><div id="gsRes" class="muted">${esc(gsOn()?(gsSt.msg||'Tự lưu mỗi khi có thay đổi'):'Chưa nối — vào Cài đặt › Google Sheet')}</div></div><button class="btn primary sm" id="gsNow">Lưu ngay</button></div>`;
  h+=`<button class="btn primary wide" id="sumBtn">🌟 Tổng kết & lời động viên</button>`;
  h+=`<div class="row gap"><button class="btn" id="exCsv">⬇ Xuất CSV (Excel)</button><button class="btn" id="exCsv2">⬇ CSV chi tiết từng câu</button><button class="btn ghost" id="exCopy">Sao chép bảng</button></div><div class="row gap"><button class="btn primary" id="exPdf">📄 Xuất PDF: thống kê + ảnh bài làm</button><button class="btn" id="exPdf2">📄 PDF chỉ thống kê</button></div><p class="muted">Mở hộp thoại in: chọn “Lưu thành PDF” (iPhone: bấm Chia sẻ › Lưu vào Tệp).</p>`;
  $('#resBody').innerHTML=h;
  $$('#resBody [data-sort]').forEach(b=>b.onclick=()=>{sortBy=b.dataset.sort;renderResults()});
  $$('#resBody .item').forEach(b=>b.onclick=()=>openDetail(b.dataset.id));
  $$('#resBody [data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  $('#gsNow').onclick=()=>{if(!gsOn()){toast('Chưa nối Google Sheet — mở Cài đặt');return go('settings')}syncAll(true,curEx())};$('#sumBtn').onclick=openSummary;$('#exCsv').onclick=()=>exportCsv(false);$('#exCsv2').onclick=()=>exportCsv(true);$('#exCopy').onclick=copyTable;$('#exPdf').onclick=()=>exportPdf(true);$('#exPdf2').onclick=()=>exportPdf(false);
}
function tableRows(detail){
  const L=LY(),ex=curEx(),list=myScans().slice().sort((a,b)=>a.sbd.localeCompare(b.sbd)),hd=['STT','SBD','Họ tên','Lớp','Mã đề','Tổng điểm','Điểm TN','Điểm ĐS','Điểm TLN','Ô cần xem'];
  if(detail){for(let i=1;i<=Math.min(L.nTN,ex.nTN);i++)hd.push('C'+i);for(let q=1;q<=Math.min(L.nDS,ex.nDS);q++)for(const c of 'abcd')hd.push('DS'+q+c);for(let q=1;q<=Math.min(L.nTLN,ex.nTLN);q++)hd.push('TLN'+q)}
  const rows=[hd];
  list.forEach((s,i)=>{const sc=scoreOf(s),nm=rosterOf(s.sbd)||{},r=[i+1,s.sbd,nm.name||'',nm.lop||'',s.md,sc?fmt(sc.total):'',sc?fmt(sc.sTN):'',sc?fmt(sc.sDS):'',sc?fmt(sc.sTL):'',(s.flags||[]).length];
    if(detail){s.tn.slice(0,ex.nTN).forEach((a,k)=>r.push(sc?(sc.d.tn[k]?1:0):(a||'')));s.ds.slice(0,ex.nDS).forEach((row,q)=>row.forEach((a,k)=>r.push(sc?(sc.d.ds[q][k]?1:0):(a||''))));s.tln.slice(0,ex.nTLN).forEach((a,k)=>r.push(sc?(sc.d.tln[k]?1:0):a))}
    rows.push(r)});
  return rows;
}

/* ----- Xuất PDF: thống kê + ảnh bài làm (in ra PDF bằng hộp thoại in) ----- */
async function exportPdf(withImgs){
  const L=LY(),ex=curEx(),list=myScans().slice().sort((a,b)=>a.sbd.localeCompare(b.sbd));
  if(!list.length)return toast('Chưa có bài nào để xuất');
  toast('Đang tạo PDF…',6000);
  const st=stats(list),tot=totalOf(ex)||10,wk=list.map(s=>({s,sc:scoreOf(s)})).filter(x=>x.sc);
  const bins=[0,0,0,0,0,0,0,0,0,0];if(st)st.v.forEach(x=>bins[Math.max(0,Math.min(9,Math.floor(x/tot*10+1e-9)))]++);const mx=Math.max(...bins,1);
  const pass=st?st.v.filter(x=>x>=tot/2).length:0;
  let h=`<div class="pdf"><div class="pg"><div class="ph"><b>${esc(S.cfg.school||'Thống kê điểm')}</b><span>Thầy Vũ Tiến Lực · Chấm phiếu VTL</span></div><h1>${esc(ex.name||'Bài kiểm tra')}</h1><p class="pm">${esc(exSub(ex)||'')}${ex.lop?'':''} · ${esc(exDesc(ex))}</p>`;
  h+=`<div class="tl"><div><b>${list.length}</b><small>bài</small></div><div><b>${st?fmt(st.mean):'–'}</b><small>điểm TB</small></div><div><b>${st?fmt(st.max):'–'}</b><small>cao nhất</small></div><div><b>${st?fmt(st.min):'–'}</b><small>thấp nhất</small></div><div><b>${st?Math.round(pass/st.n*100):0}%</b><small>từ ${fmt(tot/2)} điểm trở lên</small></div></div>`;
  if(st)h+=`<h2>Phổ điểm</h2><div class="hs">${bins.map((b,i)=>`<div><em>${b||''}</em><i style="height:${Math.round(b/mx*100)}%"></i><span>${tot===10?i+'–'+(i+1):fmt(i*tot/10)}</span></div>`).join('')}</div>`;
  if(wk.length>=2){const parts=[],pct=a=>Math.round(a.filter(Boolean).length/a.length*100);
    for(let i=0;i<Math.min(L.nTN,ex.nTN);i++)parts.push({n:'Câu '+(i+1),p:pct(wk.map(x=>x.sc.d.tn[i]))});
    for(let q=0;q<Math.min(L.nDS,ex.nDS);q++)parts.push({n:'ĐS '+(q+1),p:Math.round(wk.reduce((a,x)=>a+x.sc.d.ds[q].filter(Boolean).length,0)/(wk.length*4)*100)});
    for(let q=0;q<Math.min(L.nTLN,ex.nTLN);q++)parts.push({n:'TLN '+(q+1),p:pct(wk.map(x=>x.sc.d.tln[q]))});
    h+=`<h2>Tỉ lệ làm đúng từng câu</h2><div class="qs2">${parts.map(x=>`<div><span>${x.n}</span><i><b style="width:${x.p}%;background:${x.p<40?'#dc2626':x.p<70?'#d97706':'#16a34a'}"></b></i><em>${x.p}%</em></div>`).join('')}</div>`}
  h+=`<h2>Bảng điểm</h2><table class="pt"><thead><tr><th>STT</th><th>SBD</th><th>Họ tên</th><th>Lớp</th><th>Mã đề</th><th>TN</th><th>ĐS</th><th>TLN</th><th>Tổng</th></tr></thead><tbody>`+
    list.map((s,i)=>{const sc=scoreOf(s),nm=rosterOf(s.sbd,exOf(s))||{};return`<tr><td>${i+1}</td><td>${esc(s.sbd)}</td><td class="l">${esc(nm.name||'')}</td><td>${esc(nm.lop||'')}</td><td>${esc(s.md)}</td><td>${sc?fmt(sc.sTN):''}</td><td>${sc?fmt(sc.sDS):''}</td><td>${sc?fmt(sc.sTL):''}</td><td><b>${sc?fmt(sc.total):'–'}</b></td></tr>`}).join('')+'</tbody></table></div>';
  if(withImgs){
    const items=[];for(const s of list){const img=await idb.get(s.id);if(img){const sc=scoreOf(s),nm=rosterOf(s.sbd,exOf(s))||{};items.push(`<figure><figcaption><b>${esc(s.sbd)}${nm.name?' · '+esc(nm.name):''}</b><span>Mã ${esc(s.md)}${nm.lop?' · '+esc(nm.lop):''} → <b>${sc?fmt(sc.total):'–'} điểm</b></span></figcaption><img src="${img}"></figure>`)}}
    if(items.length){for(let i=0;i<items.length;i+=4)h+=`<div class="pg ig"><div class="ph"><b>${esc(ex.name||'Bài kiểm tra')}</b><span>Ảnh bài làm</span></div><div class="grid4">${items.slice(i,i+4).join('')}</div></div>`}
    else h+='<div class="pg"><p>Không có ảnh bài làm đã lưu (ảnh chỉ lưu khi quét bằng ứng dụng này).</p></div>';
  }
  h+='</div>';
  const r=$('#printRoot');r.innerHTML=h;
  await Promise.all([...r.querySelectorAll('img')].map(i=>i.decode?i.decode().catch(()=>{}):0));
  document.body.classList.add('printing');
  setTimeout(()=>{window.print();setTimeout(()=>{document.body.classList.remove('printing');r.innerHTML=''},600)},150);
}
function exportCsv(detail){
  const rows=tableRows(detail);if(rows.length<2)return toast('Chưa có dữ liệu để xuất');
  const csv='﻿'+rows.map(r=>r.map(c=>{c=String(c);return /[",;\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='ket-qua-'+(curEx().name+(curEx().lop?'-'+curEx().lop:'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase()+(detail?'-chi-tiet':'')+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
async function copyTable(){const t=tableRows(false).map(r=>r.join('\t')).join('\n');try{await navigator.clipboard.writeText(t);toast('Đã sao chép — dán vào Google Sheets / Excel')}catch(e){toast('Không sao chép được')}}

/* ===================== CHI TIẾT / SỬA ===================== */
let curId=null;
async function openDetail(id){
  const s=S.scans.find(x=>x.id===id);if(!s)return;curId=id;const L=getLayout(s.layout||'thpt2025');
  const img=await idb.get(id);
  $('#dBody').innerHTML=`<div class="row"><label class="f">SBD<input id="dSbd" inputmode="numeric" maxlength="6" value="${esc(s.sbd)}"></label><label class="f">Mã đề<input id="dMd" inputmode="numeric" maxlength="3" value="${esc(s.md)}"></label><div class="f"><span>Điểm</span><b id="dScore" class="big"></b></div></div><div id="dName" class="muted"></div><div id="dKeyWarn"></div><div id="dAns"></div>${img?`<details><summary>Ảnh phiếu đã nắn thẳng</summary><img class="rect" src="${img}" alt="phiếu"></details>`:''}<div class="row gap"><button class="btn danger" id="dDel">Xóa bài này</button><button class="btn" id="dClose">Xong</button></div>`;
  $('#dlg').hidden=false;
  const redraw=()=>{
    const key=(exOf(s).keys||{})[s.md]||null,sc=key?scoreScan(s,key,L,ptsOf(exOf(s))):null,nm=rosterOf(s.sbd,exOf(s));
    $('#dScore').textContent=sc?fmt(sc.total):'?';$('#dName').textContent=(nm?nm.name+(nm.lop?' · '+nm.lop:'')+' — ':'')+exOf(s).name;
    $('#dKeyWarn').innerHTML=key?'':`<div class="note">Chưa có đáp án cho mã đề ${esc(s.md)} — vào tab “Bài” để thêm đáp án, điểm sẽ tự tính lại.</div>`;
    const fl=new Set(s.flags||[]),FR=(key&&key.free)||{},fTN=new Set(FR.tn||[]),fDS=new Set(FR.ds||[]),fTL=new Set(FR.tln||[]);let h='';
    h+=`<h4>Phần I</h4><div class="cells">${s.tn.map((a,i)=>{const ok=sc?sc.d.tn[i]:null,cl=ok==null?'':ok?'ok':'bad';return `<button class="cell ${cl}${fl.has('tn'+(i+1))?' fl':''}${fTN.has(i)?' fr':''}" data-k="tn${i}"><small>${i+1}</small>${a==='*'?'⨯':a||'–'}</button>`}).join('')}</div>`;
    if(L.nDS){h+='<h4>Phần II</h4><div class="dsw">'+s.ds.map((r,q)=>`<div class="dsq"><small>Câu ${q+1}</small>${r.map((a,i)=>{const ok=sc?sc.d.ds[q][i]:null,cl=ok==null?'':ok?'ok':'bad';return `<button class="cell ${cl}${fl.has('ds'+(q+1)+'_'+i)?' fl':''}${fDS.has(q+'_'+i)?' fr':''}" data-k="ds${q}_${i}"><small>${'abcd'[i]}</small>${a==='*'?'⨯':a||'–'}</button>`}).join('')}</div>`).join('')+'</div>'}
    if(L.nTLN){h+='<h4>Phần III</h4><div class="tl">'+s.tln.map((a,q)=>{const ok=sc?sc.d.tln[q]:null,cl=ok==null?'':ok?'ok':'bad',anyFl=[0,1,2,3].some(c=>fl.has('tl'+(q+1)+'_'+c));return `<label class="tli ${cl}${anyFl?' fl':''}${fTL.has(q)?' fr':''}"><small>${q+1}</small><input data-k="tl${q}" value="${esc(a==='*'?'':a)}" maxlength="6"></label>`}).join('')+'</div>'}
    $('#dAns').innerHTML=h;
    $$('#dAns .cell').forEach(b=>b.onclick=()=>{const k=b.dataset.k;
      if(k.startsWith('tn')){const i=+k.slice(2),seq=[null,'A','B','C','D'],c=seq.indexOf(s.tn[i]);s.tn[i]=seq[(c+1)%5];fl.delete('tn'+(i+1))}
      else{const[q,i]=k.slice(2).split('_').map(Number),seq=[null,'Đ','S'],c=seq.indexOf(s.ds[q][i]);s.ds[q][i]=seq[(c+1)%3];fl.delete('ds'+(q+1)+'_'+i)}
      s.flags=[...fl];s.edited=true;save.scans();redraw()});
    $$('#dAns input').forEach(inp=>inp.oninput=()=>{const q=+inp.dataset.k.slice(2);s.tln[q]=inp.value;[0,1,2,3].forEach(c=>fl.delete('tl'+(q+1)+'_'+c));s.flags=[...fl];s.edited=true;save.scans();
      const key2=(exOf(s).keys||{})[s.md]||null,sc2=key2?scoreScan(s,key2,L,ptsOf(exOf(s))):null;$('#dScore').textContent=sc2?fmt(sc2.total):'?';inp.parentNode.className='tli '+(sc2?(sc2.d.tln[q]?'ok':'bad'):'')});
  };
  redraw();
  $('#dSbd').oninput=e=>{s.sbd=e.target.value.replace(/\D/g,'');e.target.value=s.sbd;s.edited=true;save.scans();redraw()};
  $('#dMd').oninput=e=>{s.md=e.target.value.replace(/\D/g,'');e.target.value=s.md;s.edited=true;save.scans();redraw()};
  $('#dDel').onclick=()=>{if(!confirm('Xóa bài này?'))return;S.scans=S.scans.filter(x=>x.id!==id);save.scans();idb.del(id);closeDetail();updCount();if(!$('#s-results').hidden)renderResults()};
  $('#dClose').onclick=closeDetail;
}
function closeDetail(){$('#dlg').hidden=true;curId=null;updCount();if(!$('#s-results').hidden)renderResults()}
$('#dlgX').onclick=closeDetail;
$('#sdlgX').onclick=()=>$('#sdlg').hidden=true;

/* ===================== ĐÁP ÁN ===================== */
let keyEdit=null,exFilter='';
const freeCount=k=>{const f=k&&k.free;return f?(f.tn||[]).length+(f.ds||[]).length+(f.tln||[]).length:0};
function renderKeys(){
  const L=LY(),ex=curEx(),ks=ex.keys||{},mds=Object.keys(ks).sort();
  const lops=[...new Set(S.exams.map(e=>e.lop||'').filter(Boolean))].sort();if(exFilter&&!lops.includes(exFilter))exFilter='';
  const exs=S.exams.filter(e=>!exFilter||e.lop===exFilter||e.id===ex.id).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.t-a.t);
  let h='';
  if(lops.length)h+=`<div class="row bar"><div class="seg chips">${[['','Tất cả lớp'],...lops.map(x=>[x,x])].map(x=>`<button class="${exFilter===x[0]?'on':''}" data-lop="${esc(x[0])}">${esc(x[1])}</button>`).join('')}</div></div>`;
  h+='<div class="list">'+exs.map(e=>`<div class="item ex${e.id===ex.id?' cur':''}" data-ex="${e.id}"><i class="rd"></i><div class="l"><b>${esc(e.name)}</b><small>${esc(exSub(e)||'Chưa ghi lớp')} · ${exCnt(e)} bài đã quét</small><small>${esc(exDesc(e))}</small></div><button class="btn sm ghost" data-edit="${e.id}">Sửa</button></div>`).join('')+'</div>';
  h+=`<div class="row gap"><button class="btn primary" id="exNew">＋ Tạo bài kiểm tra</button></div>`;
  h+=`<h3 style="margin-top:18px">Đáp án — ${esc(ex.name)}${ex.lop?' · '+esc(ex.lop):''}</h3><div class="card"><p class="muted">Mẫu phiếu <b>${esc(LAYOUT_NAMES[L.id])}</b>. Khi quét, app tự chọn đáp án theo mã đề học sinh tô trên phiếu.</p></div>`;
  h+=mds.length?mds.map(m=>{const k=ks[m];return `<button class="item" data-md="${esc(m)}"><div class="l"><b>Mã đề ${esc(m)}</b><small>TN ${k.tn.length}${ex.nDS?` · ĐS ${k.ds.length}`:''}${ex.nTLN?` · TLN ${k.tln.length}`:''}</small>${freeCount(k)?`<small class="fw">★ ${freeCount(k)} câu/ý tính đúng mọi đáp án</small>`:''}</div><span class="pill">Sửa</span></button>`}).join(''):'<div class="empty">Chưa có đáp án nào.</div>';
  h+=`<div class="row gap"><button class="btn primary" id="kNew">＋ Thêm mã đề</button><button class="btn ghost" id="kDemo">Nạp đáp án mẫu (mã 101)</button></div>
  <div class="row gap"><button class="btn" id="kImp">⬆ Nhập từ Excel / Google Sheet</button></div>`;
  $('#keyBody').innerHTML=h;
  $$('#keyBody [data-lop]').forEach(b=>b.onclick=()=>{exFilter=b.dataset.lop;renderKeys()});
  $$('#keyBody .item.ex').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-edit]'))return;selectEx(b.dataset.ex);renderKeys()});
  $$('#keyBody [data-edit]').forEach(b=>b.onclick=()=>openExam(b.dataset.edit));
  $('#exNew').onclick=()=>openExam(null);
  $$('#keyBody [data-md]').forEach(b=>b.onclick=()=>editKey(b.dataset.md));
  $('#kNew').onclick=()=>editKey('');
  $('#kImp').onclick=openImport;
  $('#kDemo').onclick=()=>{const d=demoData(L),k=d.key;(ex.keys||(ex.keys={}))['101']={tn:k.tn.slice(0,ex.nTN),ds:k.ds.slice(0,ex.nDS),tln:k.tln.slice(0,ex.nTLN)};save.exams();toast('Đã nạp đáp án mã 101 khớp với phiếu mẫu');renderKeys()};
}
function editKey(md){
  const L=LY(),ex=curEx(),k=md?ex.keys[md]:null;
  $('#kBody').innerHTML=`<label class="f">Mã đề (3 chữ số)<input id="kMd" inputmode="numeric" maxlength="3" value="${esc(md)}" placeholder="101"></label>
  <label class="f">Dán đáp án<textarea id="kTx" rows="9" placeholder="Dán Markdown xuất từ app trình chiếu (PHẦN I/II/III … Đáp án: …) hoặc gõ:&#10;I: ABCDABCDABCD&#10;II: ĐSĐS SSĐĐ ĐĐĐĐ SĐSĐ&#10;III: 5; -2,5; 12; 0,75; 3; 8">${esc(k?keyToText(k):'')}</textarea></label>
  <div id="kPrev" class="note"></div>
  <h4>Câu sai đề — tính đúng cho mọi phương án</h4><div class="muted">Bấm vào câu (hoặc ý) bị sai đề: <b>mọi học sinh</b>, kể cả bỏ trống, đều được điểm câu đó. Bấm lần nữa để bỏ.</div><div id="kFree"></div>
  <div class="row gap"><button class="btn primary" id="kSave">Lưu</button>${md?'<button class="btn danger" id="kDel">Xóa</button>':''}<button class="btn ghost" id="kCancel">Đóng</button></div>`;
  $('#kdlg').hidden=false;
  const ok3=p=>p.tn.length===ex.nTN&&p.ds.length===ex.nDS&&p.tln.length===ex.nTLN;
  const need=()=>ex.nTN+' TN'+(ex.nDS?', '+ex.nDS+' ĐS':'')+(ex.nTLN?', '+ex.nTLN+' TLN':'');
  const prev=()=>{const p=parseKeyText($('#kTx').value,L);$('#kPrev').textContent=`Đọc được: TN ${p.tn.length}/${ex.nTN}`+(ex.nDS?` · ĐS ${p.ds.length}/${ex.nDS}`:'')+(ex.nTLN?` · TLN ${p.tln.length}/${ex.nTLN}`:'');$('#kPrev').className='note '+(ok3(p)?'okn':'');return p};
  const fr0=(k&&k.free)||{},free={tn:[...(fr0.tn||[])],ds:[...(fr0.ds||[])],tln:[...(fr0.tln||[])]};
  const tg=(arr,v)=>{const i=arr.indexOf(v);i>=0?arr.splice(i,1):arr.push(v)};
  const drawFree=()=>{let h='';
    if(ex.nTN)h+=`<h4>Phần I</h4><div class="cells">${Array.from({length:ex.nTN},(_,i)=>`<button class="cell fb${free.tn.includes(i)?' fr':''}" data-f="tn${i}"><small>${i+1}</small>${free.tn.includes(i)?'★':'·'}</button>`).join('')}</div>`;
    if(ex.nDS)h+='<h4>Phần II</h4><div class="dsw">'+Array.from({length:ex.nDS},(_,q)=>{const all=[0,1,2,3].every(i=>free.ds.includes(q+'_'+i));return `<div class="dsq"><small>Câu ${q+1}</small>${[0,1,2,3].map(i=>`<button class="cell fb${free.ds.includes(q+'_'+i)?' fr':''}" data-f="ds${q}_${i}"><small>${'abcd'[i]}</small>${free.ds.includes(q+'_'+i)?'★':'·'}</button>`).join('')}<button class="btn sm ghost allq" data-f="dsall${q}">${all?'Bỏ cả câu':'Cả câu'}</button></div>`}).join('')+'</div>';
    if(ex.nTLN)h+=`<h4>Phần III</h4><div class="cells">${Array.from({length:ex.nTLN},(_,i)=>`<button class="cell fb${free.tln.includes(i)?' fr':''}" data-f="tl${i}"><small>${i+1}</small>${free.tln.includes(i)?'★':'·'}</button>`).join('')}</div>`;
    $('#kFree').innerHTML=h;
    $$('#kFree [data-f]').forEach(b=>b.onclick=()=>{const f=b.dataset.f;
      if(f.startsWith('dsall')){const q=+f.slice(5),ks=[0,1,2,3].map(i=>q+'_'+i),all=ks.every(x=>free.ds.includes(x));ks.forEach(x=>{const i=free.ds.indexOf(x);if(all){if(i>=0)free.ds.splice(i,1)}else if(i<0)free.ds.push(x)})}
      else if(f.startsWith('tn'))tg(free.tn,+f.slice(2));else if(f.startsWith('ds'))tg(free.ds,f.slice(2));else tg(free.tln,+f.slice(2));
      drawFree()})};
  drawFree();
  $('#kTx').oninput=prev;prev();
  $('#kMd').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'');
  $('#kSave').onclick=()=>{const m=$('#kMd').value.trim(),p=prev();if(!/^\d{1,3}$/.test(m))return toast('Nhập mã đề (tối đa 3 chữ số)');
    const mm=m.padStart(3,'0');if(!ok3(p))return toast('Số câu chưa đủ: bài này cần '+need());
    if(free.tn.length||free.ds.length||free.tln.length)p.free={tn:free.tn.slice().sort((a,b)=>a-b),ds:free.ds.slice(),tln:free.tln.slice().sort((a,b)=>a-b)};
    const ks=ex.keys||(ex.keys={});if(md&&md!==mm)delete ks[md];ks[mm]=p;save.exams();$('#kdlg').hidden=true;renderKeys();toast('Đã lưu đáp án mã '+mm)};
  if(md)$('#kDel').onclick=()=>{if(!confirm('Xóa đáp án mã '+md+'?'))return;delete ex.keys[md];save.exams();$('#kdlg').hidden=true;renderKeys()};
  $('#kCancel').onclick=()=>$('#kdlg').hidden=true;
}
/* ----- Nhập đáp án từ Excel (.xlsx/.csv), link Google Sheet hoặc dán bảng ----- */
const u8s=u=>new TextDecoder('utf-8').decode(u);
async function readXlsx(buf){
  const u=new Uint8Array(buf),dv=new DataView(buf);let e=u.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;
  if(e<0)throw new Error('Không phải file .xlsx');
  const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const F={};
  for(let i=0;i<n;i++){const nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true);F[u8s(u.subarray(p+46,p+46+nl))]={m:dv.getUint16(p+10,true),cs:dv.getUint32(p+20,true),lh:dv.getUint32(p+42,true)};p+=46+nl+el+cl}
  const get=async nm=>{const f=F[nm];if(!f)return null;const nl=dv.getUint16(f.lh+26,true),el=dv.getUint16(f.lh+28,true),d=u.subarray(f.lh+30+nl+el,f.lh+30+nl+el+f.cs);
    if(f.m===0)return u8s(d);const o=await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();return u8s(new Uint8Array(o))};
  const X=t=>new DOMParser().parseFromString(t,'application/xml');
  const ss=[];const sst=await get('xl/sharedStrings.xml');if(sst)[...X(sst).getElementsByTagName('si')].forEach(si=>ss.push([...si.getElementsByTagName('t')].map(t=>t.textContent).join('')));
  let path='xl/worksheets/sheet1.xml';
  try{const wb=X(await get('xl/workbook.xml')),rel=X(await get('xl/_rels/workbook.xml.rels')),sh=wb.getElementsByTagName('sheet')[0],rid=sh.getAttribute('r:id')||sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
    const r=[...rel.getElementsByTagName('Relationship')].find(x=>x.getAttribute('Id')===rid);if(r){let t=r.getAttribute('Target');path=t.startsWith('/')?t.slice(1):'xl/'+t.replace(/^\.\//,'')}}catch(_){}
  let tx=await get(path);if(!tx){const k=Object.keys(F).find(k=>/^xl\/worksheets\/[^/]+\.xml$/.test(k));tx=k&&await get(k)}
  if(!tx)throw new Error('Không đọc được bảng tính');
  const rows=[];
  for(const c of X(tx).getElementsByTagName('c')){const ref=c.getAttribute('r')||'',m=/^([A-Z]+)(\d+)$/.exec(ref);if(!m)continue;
    let ci=0;for(const ch of m[1])ci=ci*26+ch.charCodeAt(0)-64;ci--;const ri=+m[2]-1,t=c.getAttribute('t'),v=c.getElementsByTagName('v')[0];let val='';
    if(t==='s')val=v?ss[+v.textContent]||'':'';else if(t==='inlineStr')val=[...c.getElementsByTagName('t')].map(x=>x.textContent).join('');else if(v)val=v.textContent;
    (rows[ri]||(rows[ri]=[]))[ci]=val}
  return Array.from(rows,r=>Array.from(r||[],x=>x==null?'':x));
}
function parseCSV(text){
  text=String(text).replace(/^﻿/,'');const del=(text.split(/\r?\n/)[0]||'').includes('\t')?'\t':(()=>{const l=(text.split(/\r?\n/)[0]||'');return (l.match(/;/g)||[]).length>(l.match(/,/g)||[]).length?';':','})();
  const rows=[];let r=[],c='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
    else if(ch==='"')q=true;else if(ch===del){r.push(c);c=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;r.push(c);rows.push(r);r=[];c=''}else c+=ch}
  if(c!==''||r.length){r.push(c);rows.push(r)}return rows;
}
function classifyAns(v){
  v=String(v==null?'':v).normalize('NFC').trim();if(!v)return null;
  if(/^[A-Da-d]$/.test(v))return['tn',v.toUpperCase()];
  const t=v.replace(/[\s,;\-\/|.]/g,'').toUpperCase();
  if(t.length===4&&/^[ĐDS]{4}$/.test(t)&&/[ĐS]/.test(t))return['ds',[...t].map(c=>c==='S'?'S':'Đ')];
  return['tln',v.replace(/\.(?=\d)/g,',')];
}
function parseKeyGrid(rows){
  rows=rows.filter(r=>r&&r.some(x=>String(x).trim()!==''));if(rows.length<2)throw new Error('Bảng trống hoặc thiếu dòng đáp án');
  const hd=rows[0].map(x=>String(x==null?'':x).trim()),cols=[];
  hd.forEach((h,j)=>{if(j>0&&/^\d{1,3}(\.0+)?$/.test(h))cols.push({j,md:String(parseInt(h,10)).padStart(3,'0')})});
  if(!cols.length)throw new Error('Dòng đầu cần có mã đề ở các cột (ví dụ: Câu | 001 | 002 | 003)');
  const keys={};
  cols.forEach(({j,md})=>{const k={tn:[],ds:[],tln:[]};
    rows.slice(1).forEach(r=>{const c=classifyAns(r[j]);if(!c)return;if(c[0]==='tn')k.tn.push(c[1]);else if(c[0]==='ds')k.ds.push(c[1]);else k.tln.push(c[1])});keys[md]=k});
  const mds=Object.keys(keys),f=keys[mds[0]],same=mds.every(m=>keys[m].tn.length===f.tn.length&&keys[m].ds.length===f.ds.length&&keys[m].tln.length===f.tln.length);
  return{keys,mds,n:{tn:f.tn.length,ds:f.ds.length,tln:f.tln.length},same};
}
const KEY_TEMPLATE='Câu,001,002\n1,B,A\n2,C,A\n3,A,C\n4,B,A\n5,ĐĐĐS,ĐĐSĐ\n6,4,4\n';
function openImport(){
  const ex=curEx(),L=LY();let parsed=null;
  $('#kBody').innerHTML=`<div class="note">File/bảng có <b>dòng đầu là mã đề</b> (001, 002…), cột đầu là số câu. Mỗi ô là đáp án của một câu: <b>A–D</b> (trắc nghiệm), <b>ĐĐSĐ</b> (đúng–sai, 4 ý), còn lại là <b>trả lời ngắn</b>. App tự nhận loại câu theo nội dung ô.</div>
  <div class="row gap"><label class="btn" for="kxFile" style="display:inline-flex;align-items:center">📁 Chọn file .xlsx / .csv</label><input type="file" id="kxFile" accept=".xlsx,.csv,.tsv,.txt,text/csv" hidden><button class="btn ghost" id="kxTpl">Tải file mẫu (CSV)</button></div>
  <label class="f">Hoặc dán link Google Sheet (chia sẻ “Bất kỳ ai có đường liên kết”)<input id="kxUrl" placeholder="https://docs.google.com/spreadsheets/d/…"></label><button class="btn" id="kxGo">Tải từ link</button>
  <label class="f" style="margin-top:10px">Hoặc copy bảng từ Excel / Google Sheet rồi dán vào đây<textarea id="kxTx" rows="5" placeholder="Câu&#9;001&#9;002&#10;1&#9;B&#9;A&#10;…"></textarea></label>
  <div id="kxPrev"></div><div class="row gap"><button class="btn primary" id="kxOk" hidden>Nhập vào “${esc(ex.name)}”</button><button class="btn ghost" id="kxClose">Đóng</button></div>`;
  $('#kdlg').hidden=false;
  const show=rows=>{
    try{parsed=parseKeyGrid(rows)}catch(e){parsed=null;$('#kxOk').hidden=true;$('#kxPrev').innerHTML=`<div class="note">⚠ ${esc(e.message)}</div>`;return}
    const p=parsed,fit=p.n.tn===ex.nTN&&p.n.ds===ex.nDS&&p.n.tln===ex.nTLN;
    $('#kxPrev').innerHTML=`<div class="note ${p.same?'okn':''}">Đọc được <b>${p.mds.length}</b> mã đề: ${p.mds.join(', ')}<br>${p.n.tn} câu TN · ${p.n.ds} câu Đúng–Sai · ${p.n.tln} câu Trả lời ngắn${p.same?'':'<br>⚠ Các mã đề có số câu từng loại không giống nhau — kiểm tra lại bảng.'}${p.same&&!fit?`<br>Bài hiện tại đặt ${ex.nTN} TN · ${ex.nDS} ĐS · ${ex.nTLN} TLN — sẽ tự đổi số câu theo bảng (điểm mỗi câu giữ nguyên).`:''}</div>`;
    $('#kxOk').hidden=!p.same;
  };
  $('#kxFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;e.target.value='';
    try{const isX=/\.xlsx$/i.test(f.name);show(isX?await readXlsx(await f.arrayBuffer()):parseCSV(await f.text()))}catch(err){parsed=null;$('#kxOk').hidden=true;$('#kxPrev').innerHTML=`<div class="note">⚠ Không đọc được file: ${esc(err.message||err)}${/\.xls$/i.test(f.name)?'<br>File .xls cũ: mở bằng Excel rồi “Lưu thành” .xlsx hoặc .csv.':''}</div>`}};
  $('#kxTx').oninput=e=>{const t=e.target.value.trim();if(t)show(parseCSV(t))};
  $('#kxTpl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+KEY_TEMPLATE],{type:'text/csv;charset=utf-8'}));a.download='mau-dap-an.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
  $('#kxGo').onclick=async()=>{
    const m=/\/spreadsheets\/d\/([\w-]+)/.exec($('#kxUrl').value);if(!m)return toast('Dán đúng link Google Sheet (có /spreadsheets/d/…)');
    const gid=(/[#&?]gid=(\d+)/.exec($('#kxUrl').value)||[])[1];$('#kxPrev').innerHTML='<div class="note">Đang tải…</div>';
    const urls=[`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv${gid?'&gid='+gid:''}`,`https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv${gid?'&gid='+gid:''}`];
    for(const u of urls){try{const r=await fetch(u);if(!r.ok)continue;const t=await r.text();if(/^\s*<(!doctype|html)/i.test(t))continue;return show(parseCSV(t))}catch(_){}}
    parsed=null;$('#kxOk').hidden=true;$('#kxPrev').innerHTML='<div class="note">⚠ Không tải được từ link. Hãy kiểm tra: Chia sẻ → “Bất kỳ ai có đường liên kết” (Người xem). Nếu vẫn lỗi, dùng Tệp → Tải xuống → .xlsx rồi chọn file ở trên, hoặc copy bảng dán vào ô bên dưới.</div>'};
  $('#kxOk').onclick=()=>{if(!parsed||!parsed.same)return;const L2=LY(),p=parsed;
    ex.nTN=Math.min(L2.nTN,p.n.tn);ex.nDS=Math.min(L2.nDS,p.n.ds);ex.nTLN=Math.min(L2.nTLN,p.n.tln);
    const cut=p.n.tn>L2.nTN||p.n.ds>L2.nDS||p.n.tln>L2.nTLN;
    ex.keys=ex.keys||{};p.mds.forEach(m=>{const k=p.keys[m];const nk={tn:k.tn.slice(0,ex.nTN),ds:k.ds.slice(0,ex.nDS),tln:k.tln.slice(0,ex.nTLN)},of=ex.keys[m]&&ex.keys[m].free;if(of)nk.free=of;ex.keys[m]=nk});
    save.exams();$('#kdlg').hidden=true;renderKeys();updExLbl();toast('Đã nhập đáp án '+p.mds.length+' mã đề'+(cut?' (mẫu phiếu này chỉ chứa '+L2.nTN+' TN/'+L2.nDS+' ĐS/'+L2.nTLN+' TLN nên đã cắt bớt)':''),cut?6000:3000)};
  $('#kxClose').onclick=()=>$('#kdlg').hidden=true;
}
/* ----- form Tạo / Sửa bài kiểm tra ----- */
function openExam(id){
  const old=id?exById(id):null,lastLop=curEx().lop||'',hasScans=old?exCnt(old)>0:false;
  const e=old?JSON.parse(JSON.stringify(old)):newExam({name:'Bài '+(S.exams.length+1),lop:lastLop,layout:curEx().layout});
  const lops=[...new Set([...S.exams.map(x=>x.lop),...S.classes.map(c=>c.name)].filter(Boolean))].sort();
  const lay=()=>getLayout(e.layout);
  $('#eTitle').textContent=old?'Sửa bài kiểm tra':'Tạo bài kiểm tra';
  $('#eBody').innerHTML=`<label class="f"><span>Tên <b class="req">*</b></span><input id="eName" placeholder="Kiểm tra 15 phút" value="${esc(e.name)}"></label>
  <div class="row"><label class="f"><span>Ngày <b class="req">*</b></span><input id="eDate" type="date" value="${esc(e.date)}"></label><label class="f">Lớp<input id="eLop" list="eLops" placeholder="10A1" value="${esc(e.lop)}" autocapitalize="characters"><datalist id="eLops">${lops.map(x=>`<option value="${esc(x)}">`).join('')}</datalist></label></div>
  <label class="f"><span>Mẫu phiếu <b class="req">*</b></span><select id="eLay"${hasScans?' disabled':''}>${Object.keys(LAYOUT_NAMES).map(k=>`<option value="${k}"${k===e.layout?' selected':''}>${esc(LAYOUT_NAMES[k])}</option>`).join('')}</select></label>
  ${hasScans?'<div class="muted" style="margin:-4px 0 8px">Bài đã có phiếu quét nên không đổi được mẫu phiếu.</div>':''}
  <div class="part">Phần 1. ABCD <small id="cap1"></small></div>
  <div class="row"><label class="f"><input id="eN1" inputmode="numeric" placeholder="Số câu"></label><label class="f"><input id="eP1" inputmode="decimal" placeholder="Điểm mỗi câu"></label></div>
  <div class="part">Phần 2. Đúng sai <small id="cap2"></small></div>
  <label class="f"><input id="eN2" inputmode="numeric" placeholder="Số câu"></label>
  <div class="row"><label class="f"><input id="eD1" inputmode="decimal" placeholder="Điểm đúng 1 ý"></label><label class="f"><input id="eD2" inputmode="decimal" placeholder="Điểm đúng 2 ý"></label></div>
  <div class="row"><label class="f"><input id="eD3" inputmode="decimal" placeholder="Điểm đúng 3 ý"></label><label class="f"><input id="eD4" inputmode="decimal" placeholder="Điểm đúng 4 ý"></label></div>
  <div class="part">Phần 3. Trả lời ngắn <small id="cap3"></small></div>
  <div class="row"><label class="f"><input id="eN3" inputmode="numeric" placeholder="Số câu"></label><label class="f"><input id="eP3" inputmode="decimal" placeholder="Điểm mỗi câu"></label></div>
  <div class="tot"><button class="btn sm ghost" id="eNorm" type="button">Chia đều về 10 điểm</button><span>Tổng điểm: <b id="eTot">0,00</b></span></div>
  <div class="row gap"><button class="btn" id="eCancel">Huỷ</button><button class="btn primary" id="eSave" style="flex:1">${old?'Lưu':'Tạo'}</button></div>
  ${old?'<div class="row"><button class="btn danger ghost" id="eDel" style="margin-top:6px">Xóa bài kiểm tra này</button></div>':''}`;
  const g=k=>$('#'+k),val=()=>{const L=lay();
    e.name=g('eName').value.trim();e.date=g('eDate').value;e.lop=g('eLop').value.trim();
    e.nTN=Math.max(0,Math.min(L.nTN,parseInt(g('eN1').value,10)||0));e.pTn=g('eP1').value;
    e.nDS=L.nDS?Math.max(0,Math.min(L.nDS,parseInt(g('eN2').value,10)||0)):0;e.pDs=[g('eD1').value,g('eD2').value,g('eD3').value,g('eD4').value];
    e.nTLN=L.nTLN?Math.max(0,Math.min(L.nTLN,parseInt(g('eN3').value,10)||0)):0;e.pTln=g('eP3').value};
  const tot=()=>{const t=totalOf(e),el=g('eTot');el.textContent=t.toFixed(2).replace('.',',');el.className=Math.abs(t-10)<1e-6?'ok':t>0?'warn':'bad'};
  const fill=()=>{const L=lay();g('eN1').value=e.nTN;g('eP1').value=vnum(e.pTn);g('eN2').value=L.nDS?e.nDS:'';[1,2,3,4].forEach(i=>g('eD'+i).value=L.nDS?vnum(e.pDs[i-1]):'');g('eN3').value=L.nTLN?e.nTLN:'';g('eP3').value=L.nTLN?vnum(e.pTln):'';
    ['eN2','eD1','eD2','eD3','eD4'].forEach(k=>g(k).disabled=!L.nDS);['eN3','eP3'].forEach(k=>g(k).disabled=!L.nTLN);
    g('cap1').textContent='(tối đa '+L.nTN+' câu)';g('cap2').textContent=L.nDS?'(tối đa '+L.nDS+' câu)':'(mẫu này không có)';g('cap3').textContent=L.nTLN?'(tối đa '+L.nTLN+' câu)':'(mẫu này không có)';tot()};
  fill();
  ['eN1','eP1','eN2','eD1','eD2','eD3','eD4','eN3','eP3'].forEach(k=>g(k).oninput=()=>{val();tot()});
  g('eLay').onchange=ev=>{const keep={name:g('eName').value.trim(),date:g('eDate').value,lop:g('eLop').value.trim()};Object.assign(e,defExamFor(ev.target.value),keep);fill()};
  g('eNorm').onclick=()=>{val();const t=totalOf(e);if(t<=0)return toast('Nhập điểm trước');const f=10/t,r=x=>Math.round(num(x)*f*10000)/10000;e.pTn=r(e.pTn);e.pDs=e.pDs.map(r);e.pTln=r(e.pTln);fill();toast('Đã chia đều: tổng 10 điểm')};
  g('eCancel').onclick=()=>$('#edlg').hidden=true;
  g('eSave').onclick=()=>{val();
    if(!e.name)return toast('Nhập tên bài kiểm tra');if(!e.date)return toast('Chọn ngày');if(e.nTN+e.nDS+e.nTLN<1)return toast('Nhập số câu cho ít nhất một phần');
    const L=lay();if(e.nDS&&![0,1,2,3].every(i=>String(e.pDs[i]).trim()!==''))return toast('Nhập điểm Đúng–Sai cho 1, 2, 3, 4 ý');
    if(e.nTN&&String(e.pTn).trim()==='')return toast('Nhập điểm mỗi câu trắc nghiệm');if(e.nTLN&&String(e.pTln).trim()==='')return toast('Nhập điểm mỗi câu trả lời ngắn');
    e.pTn=num(e.pTn);e.pTln=num(e.pTln);e.pDs=e.pDs.map(num);
    if(old){Object.assign(old,e);if(old.keys)Object.keys(old.keys).forEach(m=>{const k=old.keys[m];if(k.tn.length!==old.nTN||k.ds.length!==old.nDS||k.tln.length!==old.nTLN)old.keys[m]={tn:k.tn.slice(0,old.nTN),ds:k.ds.slice(0,old.nDS),tln:k.tln.slice(0,old.nTLN)}})}else{e.t=Date.now();S.exams.push(e)}
    save.exams();$('#edlg').hidden=true;selectEx(old?old.id:e.id);renderKeys();toast(old?'Đã lưu bài kiểm tra':'Đã tạo “'+e.name+'” — thêm đáp án bên dưới',3400);
    if(!old)$('#keyBody').scrollIntoView({block:'end'})};
  if(old)g('eDel').onclick=()=>{const n=exCnt(old);if(!confirm('Xóa bài “'+old.name+'”'+(n?' cùng '+n+' phiếu đã quét':'')+'?'))return;
    S.scans.filter(x=>x.examId===old.id).forEach(x=>idb.del(x.id));S.scans=S.scans.filter(x=>x.examId!==old.id);S.exams=S.exams.filter(x=>x.id!==old.id);
    if(!S.exams.length)S.exams.push(newExam({name:'Bài 1'}));save.scans();save.exams();$('#edlg').hidden=true;selectEx(S.exams.some(x=>x.id===S.cur)?S.cur:S.exams[0].id);renderKeys()};
  $('#edlg').hidden=false;
}
$('#edlgX').onclick=()=>$('#edlg').hidden=true;
$('#kdlgX').onclick=()=>$('#kdlg').hidden=true;

/* ===================== PHIẾU ===================== */
const SL=()=>getLayout(S.cfg.layout);
function sheetInfo(){return{school:S.cfg.school,exam:S.cfg.exam,date:S.cfg.date}}
function renderSheet(){
  const L=SL();
  $('#shLayout').innerHTML=Object.keys(LAYOUT_NAMES).map(k=>`<option value="${k}"${k===L.id?' selected':''}>${esc(LAYOUT_NAMES[k])}</option>`).join('');
  ['school','exam','date'].forEach(k=>$('#sh_'+k).value=S.cfg[k]||'');
  $('#sheetPrev').innerHTML=sheetSVG(L,sheetInfo());
}
$('#shLayout').onchange=e=>{S.cfg.layout=e.target.value;save.cfg();renderSheet()};
['school','exam','date'].forEach(k=>$('#sh_'+k).oninput=e=>{S.cfg[k]=e.target.value;save.cfg();$('#sheetPrev').innerHTML=sheetSVG(SL(),sheetInfo())});
function markPrinted(){if(!S.cfg.printed){S.cfg.printed=true;save.cfg()}}
function printSVG(svg){markPrinted();const r=$('#printRoot');r.innerHTML=svg;document.body.classList.add('printing');setTimeout(()=>{window.print();setTimeout(()=>{document.body.classList.remove('printing');r.innerHTML=''},400)},120)}
$('#shPrint').onclick=()=>printSVG(sheetSVG(SL(),sheetInfo(),null,null,true));
$('#shDemo').onclick=()=>{const L=SL(),d=demoData(L);printSVG(sheetSVG(L,sheetInfo(),fillFromAnswers(L,d.st),{jitter:1},true))};
$('#shSvg').onclick=()=>{markPrinted();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([sheetSVG(SL(),sheetInfo(),null,null,true)],{type:'image/svg+xml'}));a.download='phieu-tra-loi-'+SL().id+'.svg';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
$('#shDemoShow').onclick=()=>{const L=SL(),d=demoData(L);$('#sheetPrev').innerHTML=sheetSVG(L,sheetInfo(),fillFromAnswers(L,d.st),{jitter:1});toast('Phiếu mẫu đã tô — quét thử, kết quả đúng phải là '+fmt(scoreScan(d.st,d.key,L,defaultPts(L)).total)+' điểm (đáp án mẫu mã 101)',6000)};

/* ===================== LỚP ===================== */
function renderClass(){
  const ex=curEx();
  let h=`<div class="card"><p class="muted">Mỗi lớp có danh sách <b>Số thứ tự – Họ tên – Số báo danh</b>. Khi quét, app hiện tên học sinh theo SBD và lưu điểm theo lớp. Đặt “Lớp” của bài kiểm tra trùng tên lớp ở đây.</p></div>`;
  h+=S.classes.length?'<div class="list">'+S.classes.map(c=>{const n=S.scans.filter(x=>x.examId===ex.id&&c.students.some(st=>st.sbd&&parseInt(st.sbd,10)===parseInt(x.sbd,10))).length;
    return `<button class="item cls" data-cid="${c.id}"><div class="l"><b>${esc(c.name)}</b><small>${c.students.length} học sinh${lc(c.name)===lc(ex.lop)?` · bài “${esc(ex.name)}”: ${n} đã quét`:''}</small></div><span class="pill">Sửa ▸</span></button>`}).join('')+'</div>':'<div class="empty">Chưa có lớp nào. Bấm “Tạo lớp” để thêm danh sách học sinh.</div>';
  h+=`<div class="row gap"><button class="btn primary" id="cNew">＋ Tạo lớp</button></div>`;
  $('#classBody').innerHTML=h;
  $$('#classBody .item.cls').forEach(b=>b.onclick=()=>openClass(b.dataset.cid));$('#cNew').onclick=()=>openClass(null);
}
function parseStudents(rows){
  rows=rows.map(r=>(r||[]).map(x=>String(x==null?'':x).trim())).filter(r=>r.some(x=>x!==''));if(!rows.length)return[];
  const nd=x=>x.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
  const h0=rows[0].map(nd),ix={name:h0.findIndex(x=>/^(ho va ten|ho ten|hoc sinh|ten hoc sinh)$/.test(x)),sbd:h0.findIndex(x=>/^(sbd|so bao danh|ma hs|ma hoc sinh|ma so)$/.test(x)),
    ho:h0.findIndex(x=>/^(ho|ho dem|ho va ten dem|ho lot)$/.test(x)),ten:h0.findIndex(x=>x==='ten')};
  const hasHead=ix.name>=0||ix.sbd>=0||(ix.ho>=0&&ix.ten>=0)||h0.some(x=>/^(stt|so thu tu)$/.test(x));
  const out=[];
  rows.slice(hasHead?1:0).forEach(r=>{let name='',sbd='';
    if(hasHead){if(ix.name>=0)name=r[ix.name];else if(ix.ho>=0&&ix.ten>=0)name=(r[ix.ho]+' '+r[ix.ten]).trim();if(ix.sbd>=0)sbd=r[ix.sbd]}
    else{const cand=r.map((x,i)=>({x,i,l:(x.match(/\p{L}/gu)||[]).length})).sort((a,b)=>b.l-a.l)[0];if(cand&&cand.l)name=cand.x;const nums=r.filter((x,i)=>/^\d+$/.test(x)&&(!cand||i!==cand.i));
      sbd=nums.length>=2?nums[nums.length-1]:(nums.length===1&&nums[0].length>=3?nums[0]:'')}
    sbd=String(sbd||'').replace(/\D/g,'').slice(0,6);name=String(name||'').replace(/\s+/g,' ').trim();if(name)out.push({name,sbd})});
  return out;
}
function openClass(id){
  const old=id?S.classes.find(c=>c.id===id):null;
  const c=old?{name:old.name,students:old.students.map(x=>({name:x.name,sbd:x.sbd,id:x.id,code:x.code}))}:{name:'',students:[]};
  $('#cTitle').textContent=old?'Sửa lớp':'Tạo lớp';
  $('#cBody').innerHTML=`<label class="f"><span>Tên lớp <b class="req">*</b></span><input id="cName" placeholder="10A1" value="${esc(c.name)}" autocapitalize="characters"></label>
  <div class="row gap"><label class="btn" for="cFile" style="display:inline-flex;align-items:center">📁 Nhập Excel / CSV</label><input type="file" id="cFile" accept=".xlsx,.csv,.tsv,.txt,text/csv" hidden><button class="btn" id="cPaste">📋 Dán danh sách</button></div>
  <div class="row"><label class="f"><span>SBD bắt đầu từ</span><input id="cBase" inputmode="numeric" maxlength="6" placeholder="000001"></label><button class="btn" id="cAuto" style="margin-bottom:10px">Đánh SBD tự động</button></div>
  <div class="ctab"><div class="chd"><span>STT</span><span>Họ và tên</span><span>SBD</span><span></span></div><div id="cRows"></div></div>
  <div class="row gap"><button class="btn" id="cAdd">＋ Thêm học sinh</button><button class="btn ghost" id="cCsv">⬇ Xuất CSV</button></div>
  <div id="cInfo" class="muted"></div>
  <div class="row gap"><button class="btn" id="cCancel">Huỷ</button><button class="btn primary" id="cSave" style="flex:1">${old?'Lưu':'Tạo lớp'}</button></div>${old?'<div class="row"><button class="btn danger ghost" id="cDel">Xóa lớp này</button></div>':''}`;
  const g=k=>$('#'+k);
  const info=()=>{const n=c.students.length,cnt={};c.students.forEach(x=>{if(x.sbd)cnt[parseInt(x.sbd,10)]=(cnt[parseInt(x.sbd,10)]||0)+1});const dup=Object.keys(cnt).filter(k=>cnt[k]>1),
      other=new Set();(S.classes||[]).forEach(o=>{if(old&&o.id===old.id)return;o.students.forEach(x=>{if(x.sbd&&cnt[parseInt(x.sbd,10)])other.add(x.sbd)})});
    const noSbd=c.students.filter(x=>!x.sbd).length;
    g('cInfo').innerHTML=`${n} học sinh`+(noSbd?` · <span style="color:var(--warn)">${noSbd} em chưa có SBD</span>`:'')+(dup.length?` · <span style="color:var(--bad)">trùng SBD: ${dup.join(', ')}</span>`:'')+(other.size?` · <span style="color:var(--warn)">SBD trùng lớp khác: ${[...other].slice(0,5).join(', ')}</span>`:'');
    $$('#cRows .crow').forEach((r,i)=>r.querySelector('input.cs').classList.toggle('dup',dup.includes(String(parseInt(c.students[i].sbd,10)))))};
  const draw=(focus)=>{g('cRows').innerHTML=c.students.map((x,i)=>`<div class="crow"><span class="stt">${i+1}</span><input class="cn" data-i="${i}" value="${esc(x.name)}" placeholder="Họ và tên"><input class="cs" data-i="${i}" inputmode="numeric" maxlength="6" value="${esc(x.sbd)}" placeholder="SBD"><button class="x sm" data-d="${i}" aria-label="Xóa">✕</button></div>`).join('')||'<div class="empty" style="padding:14px">Chưa có học sinh — bấm “＋ Thêm học sinh”, dán danh sách hoặc nhập file.</div>';
    $$('#cRows .cn').forEach(e=>e.oninput=()=>{c.students[+e.dataset.i].name=e.value;info()});
    $$('#cRows .cs').forEach(e=>e.oninput=()=>{e.value=e.value.replace(/\D/g,'');c.students[+e.dataset.i].sbd=e.value;info()});
    $$('#cRows [data-d]').forEach(b=>b.onclick=()=>{c.students.splice(+b.dataset.d,1);draw()});info();
    if(focus!=null){const f=$$('#cRows .cn')[focus];if(f)f.focus()}};
  draw();
  const addRows=list=>{if(!list.length)return toast('Không đọc được học sinh nào. Cần cột Họ tên (và SBD nếu có)');c.students.push(...list);draw();toast('Đã thêm '+list.length+' học sinh')};
  g('cAdd').onclick=()=>{c.students.push({name:'',sbd:''});draw(c.students.length-1)};
  g('cFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;e.target.value='';try{addRows(parseStudents(/\.xlsx$/i.test(f.name)?await readXlsx(await f.arrayBuffer()):parseCSV(await f.text())))}catch(err){toast('Không đọc được file: '+(err.message||err),4000)}};
  g('cPaste').onclick=()=>{const t=prompt('Dán danh sách (copy từ Excel: mỗi dòng STT, Họ tên, SBD):');if(t)addRows(parseStudents(parseCSV(t.trim())))};
  g('cAuto').onclick=()=>{const b=g('cBase').value.trim();if(!/^\d+$/.test(b))return toast('Nhập SBD bắt đầu, ví dụ 000001');if(!c.students.length)return toast('Chưa có học sinh');
    if(c.students.some(x=>x.sbd)&&!confirm('Ghi đè SBD của tất cả học sinh trong lớp?'))return;
    c.students.forEach((x,i)=>x.sbd=String(+b+i).padStart(b.length,'0').slice(-6));draw()};
  g('cCsv').onclick=()=>{const rows=[['STT','Họ và tên','SBD'],...c.students.map((x,i)=>[i+1,x.name,x.sbd])];const csv='﻿'+rows.map(r=>r.map(v=>/[",;\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')).join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='danh-sach-'+(g('cName').value.trim()||'lop')+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
  g('cCancel').onclick=()=>$('#cdlg').hidden=true;
  g('cSave').onclick=()=>{const nm=g('cName').value.trim();if(!nm)return toast('Nhập tên lớp');
    if(S.classes.some(o=>lc(o.name)===lc(nm)&&(!old||o.id!==old.id)))return toast('Đã có lớp “'+nm+'”');
    const st=c.students.filter(x=>x.name.trim()||x.sbd).map(x=>({name:x.name.trim(),sbd:x.sbd,id:x.id,code:x.code}));
    if(old){const used=new Set(st.map(x=>x.id).filter(Boolean));st.forEach(x=>{if(x.id)return;const m=old.students.find(o=>!used.has(o.id)&&((x.sbd&&o.sbd&&parseInt(o.sbd,10)===parseInt(x.sbd,10))||lc(o.name)===lc(x.name)));if(m){x.id=m.id;x.code=m.code;used.add(m.id)}})}
    st.forEach(x=>{if(!x.id)x.id=sid()});
    if(st.some(x=>!x.name))return toast('Có dòng chưa nhập họ tên');
    if(old){if(lc(old.name)!==lc(nm))S.exams.forEach(e=>{if(lc(e.lop)===lc(old.name))e.lop=nm});old.name=nm;old.students=st;save.exams()}else S.classes.push({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:nm,students:st});
    save.classes();$('#cdlg').hidden=true;renderClass();toast('Đã lưu lớp '+nm+' ('+st.length+' học sinh)')};
  if(old)g('cDel').onclick=()=>{if(!confirm('Xóa lớp “'+old.name+'” và danh sách học sinh? (Các phiếu đã quét không bị xóa)'))return;S.classes=S.classes.filter(o=>o.id!==old.id);save.classes();$('#cdlg').hidden=true;renderClass()};
  $('#cdlg').hidden=false;if(!old)g('cName').focus();
}
$('#cdlgX').onclick=()=>$('#cdlg').hidden=true;

/* ===================== CÀI ĐẶT ===================== */
function renderSettings(){
  const c=S.cfg;
  $('#cfgThr').value=c.thr;$('#cfgThrV').textContent=(+c.thr).toFixed(2);$('#cfgSnd').checked=!!c.sound;
  $('#gsUrl').value=c.gsUrl||'';$('#gsSheet').value=c.gsSheet||'';$('#gsToken').value=c.gsToken||'';$('#gsAuto').checked=c.gsAuto!==false;gsStatus(gsOn()?(gsSt.msg||'Đã nhập link — bấm “Kiểm tra kết nối”'):'Chưa nối Google Sheet',gsSt.ok);
}
$('#cfgThr').oninput=e=>{S.cfg.thr=+e.target.value;$('#cfgThrV').textContent=(+e.target.value).toFixed(2);save.cfg()};
$('#cfgSnd').onchange=e=>{S.cfg.sound=e.target.checked;save.cfg()};
$('#gsUrl').oninput=e=>{S.cfg.gsUrl=e.target.value.trim();save.cfg()};$('#gsSheet').oninput=e=>{S.cfg.gsSheet=e.target.value.trim();save.cfg()};$('#gsToken').oninput=e=>{S.cfg.gsToken=e.target.value;save.cfg()};
$('#gsAuto').onchange=e=>{S.cfg.gsAuto=e.target.checked;save.cfg();if(e.target.checked)queueSync()};
$('#gsTest').onclick=async()=>{if(!gsOn())return gsStatus('⚠ Link phải bắt đầu bằng https://script.google.com/…',false);gsStatus('Đang kiểm tra…',null);const r=await gsPost({action:'ping'});
  gsStatus(r&&r.ok?(r.unconfirmed?'Đã gửi (không đọc được phản hồi) — thử “Lưu tất cả bài” để chắc chắn':'✓ Kết nối được'+(r.name?' — bảng “'+r.name+'”':'')):'⚠ '+((r&&r.error)||'Không kết nối được'),!!(r&&r.ok))};
$('#gsAll').onclick=()=>{if(!gsOn())return gsStatus('⚠ Chưa nhập link Apps Script',false);syncAll(true)};
$('#gsCode').onclick=()=>{$('#kBody').innerHTML=`<div class="note"><b>Cài một lần (khoảng 3 phút)</b><br>1. Tạo (hoặc mở) một Google Sheet › menu <b>Tiện ích mở rộng › Apps Script</b>.<br>2. Xóa mã cũ, dán mã dưới đây, bấm Lưu.<br>3. <b>Triển khai › Tùy chọn triển khai mới › Ứng dụng web</b>: Thực thi với tư cách <b>Tôi</b>, Người có quyền truy cập <b>Bất kỳ ai</b> › Triển khai, cấp quyền khi Google hỏi.<br>4. Sao chép <b>URL ứng dụng web</b> (bắt đầu bằng script.google.com/macros/s/…) dán vào app. Nếu script không tạo từ bên trong Google Sheet thì dán thêm link bảng tính.<br>Sửa mã sau này: phải Triển khai › Quản lý › tạo phiên bản mới.</div><textarea id="gsCodeTx" rows="12" readonly></textarea><div class="row gap"><button class="btn primary" id="gsCopy">Sao chép mã</button><button class="btn ghost" id="gsCl">Đóng</button></div>`;$('#gsCodeTx').value=GS_CODE;$('#kdlg').hidden=false;
  $('#gsCopy').onclick=async()=>{try{await navigator.clipboard.writeText(GS_CODE);toast('Đã sao chép mã Apps Script')}catch(e){$('#gsCodeTx').select();document.execCommand('copy');toast('Đã sao chép')}};$('#gsCl').onclick=()=>$('#kdlg').hidden=true};
$('#wipe').onclick=async()=>{if(!confirm('Xóa TẤT CẢ phiếu đã quét của bài “'+curEx().name+'”?'))return;const ids=myScans().map(s=>s.id);S.scans=S.scans.filter(s=>!ids.includes(s.id));save.scans();ids.forEach(i=>idb.del(i));updCount();toast('Đã xóa')};
$('#bkup').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({v:3,cfg:S.cfg,keys:S.keys,scans:S.scans,classes:S.classes,exams:S.exams,cur:S.cur,qr:S.qr})],{type:'application/json'}));a.download='sao-luu-cham-phieu.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
$('#rstFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.cfg)S.cfg=Object.assign({},DEF,d.cfg);S.keys=d.keys||{};if(d.scans)S.scans=d.scans;if(d.classes)S.classes=d.classes;else if(d.roster){lsSet('omr.roster',d.roster);S.classes=null}if(d.qr&&Array.isArray(d.qr.rounds))S.qr=Object.assign({n:24,cur:0},d.qr);S.exams=d.exams||null;S.cur=d.cur||null;migrateClasses();migrate();Object.values(save).forEach(fn=>fn());updCount();updExLbl();renderSettings();toast('Đã khôi phục')}catch(err){toast('File sao lưu không hợp lệ')}e.target.value=''};

/* ===================== KHỞI ĐỘNG ===================== */
setTimeout(()=>queueSync(),1500);updCount();updExLbl();$$('.exlbl').forEach(e=>e.onclick=()=>go('keys'));$('#autoTg').textContent=S.cfg.auto?'Tự chốt: BẬT':'Tự chốt: TẮT';
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b&&!b.dataset.skip)go(b.dataset.go)});
window.OMR={S,openSummary,buildMsg,buildClassMsg,MSG_STYLES,bandOf,parseStudents,renderClass,openClass,rebuildRoster,clsOf,gsRows,gsBody,syncAll,queueSync,gsPost,parseKeyGrid,parseCSV,readXlsx,classifyAns,openImport,curEx,selectEx,newExam,totalOf,ptsOf,exOf,openExam,renderKeys,migrate,analyze,getLayout,buildLayout,sheetSVG,demoData,fillFromAnswers,scoreScan,parseKeyText,keyToText,handleFiles,commitScan,scoreOf,go,defaultPts,tableRows,ptsNow};
