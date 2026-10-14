/* ===================== SAO LƯU TỰ ĐỘNG LÊN GOOGLE DRIVE + TRẠNG THÁI ĐỒNG BỘ ===================== */
/* Dữ liệu (lớp, bài, phiếu, sổ điểm…) gửi qua Apps Script vào thư mục “Chấm phiếu OMR - Sao lưu” trong Drive của thầy.
   Ảnh bài làm gửi tăng dần (chỉ ảnh mới). Mỗi ngày giữ một bản riêng, giữ 14 ngày gần nhất. */
const BK={st:'idle',msg:'',t:lsGet('omr.bkt',0),dirty:lsGet('omr.bkdirty',0),busy:false,timer:0,err:'',imgs:new Set(lsGet('omr.bkimgs',[])),last:lsGet('omr.bkinfo',null)};
const bkOn=()=>gsOn()&&S.cfg.bkAuto!==false;
const hhmm=t=>{const d=new Date(t),z=x=>String(x).padStart(2,'0');return z(d.getHours())+':'+z(d.getMinutes())+(new Date().toDateString()===d.toDateString()?'':' '+z(d.getDate())+'/'+z(d.getMonth()+1))};
function scriptHint(msg){return /undefined|Unknown|không hợp lệ|not a function/i.test(String(msg||''))?' — mã Apps Script trên Google còn bản cũ: dán mã mới (Cài đặt › Lấy mã Apps Script) rồi Triển khai › Quản lý bản triển khai › phiên bản mới':''}

/* trạng thái hiển thị: {cls, text} */
function bkState(){
  if(!gsOn())return{cls:'',text:'Chưa bật — nối Google Apps Script ở Cài đặt để tự sao lưu lên Drive'};
  if(BK.busy)return{cls:'run',text:BK.msg||'Đang sao lưu lên Drive…'};
  if(BK.err)return{cls:'bad',text:'⚠ '+BK.err+' (sẽ tự thử lại)'};
  if(S.cfg.bkAuto===false)return{cls:'',text:BK.t?'Tự động đang tắt · lần cuối '+hhmm(BK.t):'Tự động sao lưu đang tắt'};
  if(BK.dirty)return{cls:'wait',text:navigator.onLine?'Có thay đổi chưa sao lưu — sắp tự lưu':'Chờ có mạng để sao lưu · có thay đổi chưa lưu'};
  if(BK.t)return{cls:'ok',text:'Đã sao lưu lúc '+hhmm(BK.t)+(BK.last?` · ${BK.last.ex} bài, ${BK.last.sc} phiếu, ${BK.last.im} ảnh`:'')};
  return{cls:'wait',text:'Chưa sao lưu lần nào'};
}
function bkUI(){const s=bkState();$$('.bk-dot').forEach(e=>e.className='bkdot bk-dot '+s.cls);$$('.bk-msg').forEach(e=>e.textContent=s.text)}
function bkCard(){
  const s=bkState();
  return`<div class="card bkcard"><span class="bkdot bk-dot ${s.cls}"></span><div class="l"><b>☁ Sao lưu Google Drive</b><small class="bk-msg">${esc(s.text)}</small></div>${gsOn()?'<button class="btn sm" data-bk="now">Sao lưu</button>':'<button class="btn sm primary" data-go="settings">Cài đặt</button>'}</div>`;
}
function bkRender(){
  const box=$('#bkBox');if(!box)return;const s=bkState();
  box.innerHTML=`<p class="muted" style="margin-top:0">Tự động gửi toàn bộ dữ liệu (lớp, bài kiểm tra, phiếu đã quét, sổ điểm, ảnh bài làm) vào thư mục <b>“Chấm phiếu OMR - Sao lưu”</b> trong Google Drive của thầy. Mất máy hoặc đổi máy chỉ cần bấm “Khôi phục từ Drive”. Dùng chung link Apps Script ở mục Google Sheet bên trên.</p>
  <div class="bkcard" style="margin:6px 0 10px"><span class="bkdot bk-dot ${s.cls}"></span><div class="l"><b>Trạng thái</b><small class="bk-msg">${esc(s.text)}</small></div></div>
  <label class="toggle"><input type="checkbox" id="bkAuto"${S.cfg.bkAuto!==false?' checked':''}> Tự động sao lưu khi có thay đổi</label>
  <label class="toggle"><input type="checkbox" id="bkImg"${S.cfg.bkImg!==false?' checked':''}> Sao lưu cả ảnh bài làm (tốn dung lượng Drive)</label>
  <div class="row gap"><button class="btn primary" id="bkNow">☁ Sao lưu ngay</button><button class="btn" id="bkRest">⬇ Khôi phục từ Drive</button></div>
  <p class="muted">Lần đầu phải <b>dán lại mã Apps Script mới</b> (nút “Lấy mã Apps Script”) rồi triển khai lại và cho phép truy cập Drive.</p>`;
  $('#bkAuto').onchange=e=>{S.cfg.bkAuto=e.target.checked;save.cfg();if(S.cfg.bkAuto&&BK.dirty)bkSched();bkUI()};
  $('#bkImg').onchange=e=>{S.cfg.bkImg=e.target.checked;save.cfg()};
  $('#bkNow').onclick=()=>bkRun(true);$('#bkRest').onclick=bkRestoreDlg;
}
/* ---------- đánh dấu thay đổi & hàng đợi ---------- */
function bkMark(){BK.dirty=Date.now();lsSet('omr.bkdirty',BK.dirty);bkSched();bkUI()}
function bkSched(){if(!bkOn())return;clearTimeout(BK.timer);BK.timer=setTimeout(()=>bkRun(false),20000)}
['scans','classes','exams','keys','qr'].forEach(k=>{const f=save[k];if(!f)return;save[k]=(...a)=>{const r=f(...a);bkMark();lkQueue();return r}});

/* ---------- gửi lên Drive ---------- */
function bkData(){
  const cfg=Object.assign({},S.cfg);['gsUrl','gsSheet','gsToken','lkSig','lkT'].forEach(k=>delete cfg[k]);
  return{v:4,app:'omr',t:Date.now(),cfg,keys:S.keys,scans:S.scans,classes:S.classes,exams:S.exams,cur:S.cur,qr:S.qr};
}
async function bkRun(manual){
  if(!gsOn()){if(manual)toast('Chưa nối Google Apps Script — vào Cài đặt');bkUI();return}
  if(BK.busy)return;
  if(!navigator.onLine){bkUI();if(manual)toast('Đang offline — sẽ sao lưu khi có mạng');return}
  BK.busy=true;BK.err='';BK.msg='Đang gửi dữ liệu lên Drive…';bkUI();
  const t0=Date.now();let unconf=false;
  try{
    const d=bkData(),r=await gsPost({action:'bk_put',name:'du-lieu',day:todayISO(),data:JSON.stringify(d)});
    if(!r||!r.ok)throw new Error((r&&r.error)||'Lỗi không rõ');if(r.unconfirmed)unconf=true;
    let nimg=BK.imgs.size;
    if(S.cfg.bkImg!==false){
      const ids=S.scans.map(s=>s.id).filter(id=>!BK.imgs.has(id));let chunk={},bytes=0,cnt=0,sent=0;
      const flush=async()=>{if(!cnt)return;BK.msg='Đang gửi ảnh bài làm ('+(sent+cnt)+'/'+ids.length+')…';bkUI();
        const rr=await gsPost({action:'bk_img',name:'anh-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5),data:JSON.stringify(chunk)});
        if(!rr||!rr.ok)throw new Error((rr&&rr.error)||'Không gửi được ảnh');Object.keys(chunk).forEach(k=>BK.imgs.add(k));sent+=cnt;lsSet('omr.bkimgs',[...BK.imgs]);chunk={};bytes=0;cnt=0};
      for(const id of ids){const im=await idb.get(id);if(!im)continue;chunk[id]=im;bytes+=im.length;cnt++;if(bytes>2200000||cnt>=40)await flush()}
      await flush();nimg=[...BK.imgs].filter(id=>S.scans.some(s=>s.id===id)).length;
    }
    BK.t=Date.now();lsSet('omr.bkt',BK.t);BK.last={ex:S.exams.length,sc:S.scans.length,im:nimg};lsSet('omr.bkinfo',BK.last);
    if(BK.dirty<=t0){BK.dirty=0;lsSet('omr.bkdirty',0)}else bkSched();
    BK.busy=false;BK.err='';bkUI();if(manual)toast(unconf?'Đã gửi (chưa xác nhận được từ Google)':'✓ Đã sao lưu lên Drive');
  }catch(e){
    BK.busy=false;BK.err=String(e&&e.message||e)+scriptHint(e&&e.message);bkUI();if(manual)toast('Chưa sao lưu được: '+BK.err,5000);
    if(bkOn())BK.timer=setTimeout(()=>bkRun(false),60000);
  }
}
/* ---------- khôi phục ---------- */
function applyBackup(d){
  const keep={gsUrl:S.cfg.gsUrl,gsSheet:S.cfg.gsSheet,gsToken:S.cfg.gsToken};
  if(d.cfg)S.cfg=Object.assign({},DEF,d.cfg,keep);
  S.keys=d.keys||{};if(d.scans)S.scans=d.scans;if(d.classes)S.classes=d.classes;
  if(d.qr&&Array.isArray(d.qr.rounds))S.qr=Object.assign({n:24,cur:0},d.qr);
  S.exams=d.exams||null;S.cur=d.cur||null;migrateClasses();migrate();
  Object.values(save).forEach(fn=>fn());updCount();updExLbl();
}
async function bkRestoreDlg(){
  if(!gsOn())return toast('Chưa nối Google Apps Script — vào Cài đặt');
  toast('Đang lấy danh sách bản sao lưu…');
  const r=await gsPost({action:'bk_list'});
  if(!r||!r.ok)return toast('Không lấy được danh sách: '+((r&&r.error)||'lỗi không rõ')+scriptHint(r&&r.error),5500);
  const data=(r.files||[]).filter(f=>/^du-lieu(-\d{4}-\d\d-\d\d)?\.json$/.test(f.name)).sort((a,b)=>b.updated-a.updated),nimg=(r.files||[]).filter(f=>/^anh-/.test(f.name)).length;
  if(!data.length)return toast('Chưa có bản sao lưu nào trên Drive');
  xdlg('Khôi phục từ Drive',`<p class="muted" style="margin-top:0">Chọn bản sao lưu. <b>Dữ liệu hiện có trên máy sẽ được thay bằng bản này</b> (link Apps Script và mật khẩu của máy được giữ nguyên). Có ${nimg} gói ảnh bài làm trên Drive.</p>
  <div class="list">${data.map(f=>`<button class="item" data-f="${esc(f.name)}"><div class="l"><b>${f.name==='du-lieu.json'?'Bản mới nhất':'Bản ngày '+esc(f.name.slice(8,18).split('-').reverse().join('/'))}</b><small>Lưu lúc ${esc(new Date(f.updated).toLocaleString('vi-VN'))} · ${Math.round(f.size/1024)} KB</small></div><span class="pill">Chọn ▸</span></button>`).join('')}</div>`);
  $$('#xBody [data-f]').forEach(b=>b.onclick=()=>bkRestore(b.dataset.f));
}
async function bkRestore(name){
  if(!confirm('Thay toàn bộ dữ liệu trên máy bằng bản sao lưu này?'))return;
  $('#xdlg').hidden=true;toast('Đang tải bản sao lưu…',8000);
  const r=await gsPost({action:'bk_get',name:name.replace(/\.json$/,'')});
  if(!r||!r.ok)return toast('Không tải được: '+((r&&r.error)||'lỗi không rõ'),5000);
  let d;try{d=JSON.parse(r.data)}catch(e){return toast('Bản sao lưu bị hỏng, hãy thử bản ngày khác',5000)}
  applyBackup(d);toast('Đã khôi phục dữ liệu. Đang tải ảnh bài làm…',6000);
  let n=0;
  try{const l=await gsPost({action:'bk_list'});for(const f of(l.files||[]).filter(x=>/^anh-/.test(x.name))){
    const g=await gsPost({action:'bk_get',name:f.name.replace(/\.json$/,'')});if(!g||!g.ok)continue;
    const o=JSON.parse(g.data);for(const id of Object.keys(o)){await idb.put(id,o[id]);BK.imgs.add(id);n++}toast('Đã tải '+n+' ảnh…',4000)}
    lsSet('omr.bkimgs',[...BK.imgs])}catch(e){}
  BK.dirty=0;lsSet('omr.bkdirty',0);BK.t=Date.now();lsSet('omr.bkt',BK.t);bkUI();go('home');toast('✓ Khôi phục xong'+(n?' · '+n+' ảnh':''),4000);
}
/* ---------- tự chạy ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-bk]');if(b)bkRun(true)});
window.addEventListener('online',()=>{if(BK.dirty&&bkOn())bkRun(false);bkUI()});window.addEventListener('offline',bkUI);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&BK.dirty&&bkOn())bkRun(false)});
setInterval(()=>{if(BK.dirty&&bkOn()&&!BK.busy)bkRun(false);bkUI()},300000);
setTimeout(()=>{if(bkOn()&&!BK.t&&(S.scans.length||S.classes.length))bkMark();else if(bkOn()&&BK.dirty)bkSched();bkUI();if(lkOn())lkQueue()},3000);
Object.assign(window.OMR,{BK,bkRun,bkData,bkState,applyBackup,bkRestoreDlg,lkRows,lkPublish,lkNewCode,progData,gbSem,gbYear,gbSummary,colScore,renderGB,renderProg,renderRep,repPage,parentMsg,lkLink,lkSite,classStat,cmpGroups,stExamScore});
