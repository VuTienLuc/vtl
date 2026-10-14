/* ===================== PHIẾU ĐIỂM CÁ NHÂN + TRA CỨU ĐIỂM CHO HỌC SINH ===================== */
const REP={cid:lsGet('omr.rpcls',null),sel:'',img:lsGet('omr.rpimg','last'),msg:lsGet('omr.rpmsg',true),gb:lsGet('omr.rpgb',true),qr:lsGet('omr.rpqr',true)};
const LK_ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const lkNorm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const lkShow=c=>c?c.slice(0,4)+'-'+c.slice(4):'';
function lkNewCode(){const used=new Set();S.classes.forEach(c=>c.students.forEach(x=>x.code&&used.add(x.code)));
  for(;;){let s='';const a=new Uint8Array(8);(crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*256));for(let i=0;i<8;i++)s+=LK_ALPHA[a[i]%32];if(!used.has(s))return s}}
const lkOn=()=>!!S.cfg.lkOn;
/* địa chỉ web của app (để tạo đường dẫn tra cứu) */
function lkSite(){let u=String(S.cfg.siteUrl||'').trim();if(!u&&/^https?:$/.test(location.protocol)&&!/^(localhost|127\.)/.test(location.hostname))u=location.origin;return u.replace(/\/+$/,'').replace(/\/(index|tra-cuu)\.html$/,'')}
function lkScriptRef(){const u=String(S.cfg.gsUrl||'').trim(),m=/^https:\/\/script\.google\.com\/macros\/s\/([\w-]+)\/exec$/.exec(u);return m?m[1]:encodeURIComponent(u.replace(/^https:\/\/script\.google\.com\//,''))}
function lkLink(code){const s=lkSite();if(!s||!gsOn())return'';return s+'/tra-cuu.html?u='+lkScriptRef()+(code?'&m='+code:'')}
function qrSvg(text,size){
  const q=qrcode(0,'L');q.addData(text);q.make();const n=q.getModuleCount(),m=size/(n+4);let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${((c+2)*m).toFixed(2)} ${((r+2)*m).toFixed(2)}h${(m+.02).toFixed(2)}v${(m+.02).toFixed(2)}h-${(m+.02).toFixed(2)}z`;
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}mm" height="${size}mm" class="qrs"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000" shape-rendering="crispEdges"/></svg>`;
}

/* ---------- dữ liệu một học sinh ---------- */
function stReport(c,st){
  const D=progData(c),r=D.rows.find(x=>x.st===st)||D.rows.find(x=>x.st.id===st.id);
  return{D,r,sm:gbSummary(c,st)};
}
function lkRows(){
  const rows=[];
  S.classes.forEach(c=>{
    const D=progData(c);
    D.rows.forEach(r=>{
      if(!r.st.code)return;
      const x=r.have.map(p=>{const o={e:p.ex.name,d:vnDate(p.ex.date),s:p.v};if(S.cfg.lkMean!==false)o.m=p.mean==null?null:r1(p.mean);if(S.cfg.lkRank)o.r=p.rk,o.n=p.n;return o});
      const g=gbSummary(c,r.st);
      if(!x.length&&!(g&&(g.hk1.avg!=null||g.hk2.avg!=null)))return;
      rows.push({c:r.st.code,n:r.st.name,l:c.name,x,g:g?{hk1:g.hk1,hk2:g.hk2,y:g.year}:null});
    });
  });
  return rows;
}
const lkSig=()=>JSON.stringify(lkRows());
async function lkPublish(force){
  if(!lkOn()||!gsOn()){lkStatus(lkOn()?'Chưa nối Google Apps Script (Cài đặt)':'Chưa bật tra cứu',null);return false}
  const rows=lkRows(),sig=JSON.stringify(rows);
  if(!force&&sig===S.cfg.lkSig){lkStatus('Điểm trên mạng đã mới nhất',true);return true}
  lkStatus('Đang đăng điểm lên mạng…',null);
  const r=await gsPost({action:'lookup_put',rows,t:Date.now()});
  if(r&&r.ok){S.cfg.lkSig=sig;S.cfg.lkT=Date.now();save.cfg();const d=new Date(),z=x=>String(x).padStart(2,'0');lkStatus('✓ Đã đăng điểm của '+rows.length+' học sinh lúc '+z(d.getHours())+':'+z(d.getMinutes())+(r.unconfirmed?' (chưa xác nhận)':''),true);return true}
  lkStatus('⚠ Chưa đăng được: '+((r&&r.error)||'lỗi không rõ')+(/Unknown|action|hợp lệ/i.test((r&&r.error)||'')?' — hãy dán lại mã Apps Script mới và triển khai lại':''),false);return false;
}
let lkTimer=0;
function lkQueue(){if(!lkOn()||!gsOn())return;clearTimeout(lkTimer);lkTimer=setTimeout(()=>{lkPublish(false)},4000)}
function lkStatus(m,ok){S.lkMsg=m;S.lkOk=ok;const e=$('#lkState');if(e){e.textContent=m;e.className='gsstate '+(ok===true?'ok':ok===false?'bad':'')}}

/* ---------- màn hình ---------- */
function repClass(){if(!S.classes.some(c=>c.id===REP.cid))REP.cid=(S.classes[0]||{}).id||null;return S.classes.find(c=>c.id===REP.cid)||null}
function repOpen(cid,stId){REP.cid=cid;REP.sel=stId||'';lsSet('omr.rpcls',cid);go('rep')}
function renderRep(){
  const box=$('#repBody');
  if(!S.classes.length){box.innerHTML='<div class="empty">Chưa có lớp nào. Vào tab <b>Lớp</b> để tạo danh sách học sinh.</div>';return}
  const c=repClass(),withCode=c.students.filter(x=>x.code).length,link=lkLink('');
  let h=`<div class="card"><label class="f">Lớp<select id="rpCls">${S.classes.map(x=>`<option value="${x.id}"${x.id===c.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label></div>`;
  h+=`<div class="card"><h3>📄 Phiếu điểm cá nhân (gửi phụ huynh)</h3>
  <label class="f">Học sinh<select id="rpSt"><option value="">— Cả lớp (mỗi em một phiếu) —</option>${c.students.map((x,i)=>`<option value="${x.id}"${REP.sel===x.id?' selected':''}>${i+1}. ${esc(x.name)}</option>`).join('')}</select></label>
  <label class="f">Ảnh bài làm<select id="rpImg"><option value="last"${REP.img==='last'?' selected':''}>Kèm ảnh bài mới nhất</option><option value="all"${REP.img==='all'?' selected':''}>Kèm ảnh tất cả các bài</option><option value="none"${REP.img==='none'?' selected':''}>Không kèm ảnh</option></select></label>
  <label class="ck"><input type="checkbox" id="rpMsg"${REP.msg?' checked':''}> Kèm lời nhận xét, động viên (phong cách chọn ở “Tổng kết”)</label>
  <label class="ck"><input type="checkbox" id="rpGb"${REP.gb?' checked':''}> Kèm điểm thường xuyên / giữa kỳ / cuối kỳ / ĐTB</label>
  <label class="ck"><input type="checkbox" id="rpQr"${REP.qr?' checked':''}> Kèm mã QR tra cứu điểm (cần bật tra cứu bên dưới)</label>
  <label class="f">Ký tên<input id="rpSign" value="${esc(S.cfg.sign||'Thầy Vũ Tiến Lực')}"></label>
  <div class="row gap"><button class="btn primary" id="rpPrint">📄 In / lưu PDF</button><button class="btn" id="rpCopy">📋 Sao chép lời nhắn</button><button class="btn" id="rpShare">📤 Chia sẻ</button></div>
  <p class="muted">Lời nhắn là đoạn chữ ngắn để dán vào Zalo hoặc tin nhắn. PDF có điểm các bài, biểu đồ tiến bộ và ảnh bài làm của em.</p></div>`;
  h+=`<div class="card"><h3>🔎 Trang tra cứu điểm cho học sinh</h3>
  <p class="muted" style="margin-top:0">Mỗi em có một <b>mã riêng</b>. Em vào trang tra cứu (hoặc quét QR trên thẻ), nhập mã và chỉ thấy điểm của chính mình. Điểm được đăng qua Google Apps Script của thầy.</p>
  <label class="ck"><input type="checkbox" id="lkOn"${lkOn()?' checked':''}> Cho học sinh tra cứu điểm</label>
  <div id="lkBox"${lkOn()?'':' hidden'}>
   <label class="f">Địa chỉ web của app (Vercel)<input id="lkSite" placeholder="https://ten-app.vercel.app" value="${esc(lkSite())}"></label>
   <label class="ck"><input type="checkbox" id="lkMean"${S.cfg.lkMean!==false?' checked':''}> Hiện điểm trung bình lớp</label>
   <label class="ck"><input type="checkbox" id="lkRank"${S.cfg.lkRank?' checked':''}> Hiện thứ hạng trong lớp</label>
   <p class="muted">Lớp ${esc(c.name)}: <b>${withCode}/${c.students.length}</b> học sinh đã có mã.${gsOn()?'':' <b style="color:var(--bad)">Chưa nối Google Apps Script — vào Cài đặt.</b>'}${link?'':' <b style="color:var(--warn)">Nhập địa chỉ web của app để tạo đường dẫn.</b>'}</p>
   <div class="row gap"><button class="btn" id="lkGen">🔑 Tạo mã cho lớp</button><button class="btn primary" id="lkPub">☁ Đăng điểm lên mạng</button><button class="btn" id="lkCards">🖨 In thẻ mã tra cứu</button></div>
   <div id="lkState" class="gsstate">${esc(S.lkMsg||(S.cfg.lkT?'Lần đăng gần nhất: '+new Date(S.cfg.lkT).toLocaleString('vi-VN'):'Chưa đăng điểm'))}</div>
   <details class="card sub"><summary>Danh sách mã tra cứu của lớp</summary><div class="lkl">${c.students.map((x,i)=>`<div class="lkr"><span>${i+1}. ${esc(x.name)}</span><b>${x.code?lkShow(x.code):'–'}</b>${x.code&&link?`<button class="btn sm" data-cp="${x.id}">Chép link</button>`:''}</div>`).join('')}</div></details>
  </div></div>`;
  box.innerHTML=h;wireRep(c);
}
function wireRep(c){
  const sv=(k,v)=>{REP[k]=v;lsSet('omr.rp'+k,v)};
  $('#rpCls').onchange=e=>{REP.cid=e.target.value;REP.sel='';lsSet('omr.rpcls',REP.cid);renderRep()};
  $('#rpSt').onchange=e=>REP.sel=e.target.value;
  $('#rpImg').onchange=e=>sv('img',e.target.value);$('#rpMsg').onchange=e=>sv('msg',e.target.checked);$('#rpGb').onchange=e=>sv('gb',e.target.checked);$('#rpQr').onchange=e=>sv('qr',e.target.checked);
  $('#rpSign').onchange=e=>{S.cfg.sign=e.target.value.trim();save.cfg()};
  $('#rpPrint').onclick=()=>repPrint(c);
  $('#rpCopy').onclick=async()=>{const t=repText(c);if(!t)return;try{await navigator.clipboard.writeText(t);toast('Đã sao chép lời nhắn')}catch(e){prompt('Sao chép đoạn này:',t)}};
  $('#rpShare').onclick=async()=>{const t=repText(c);if(!t)return;if(navigator.share){try{await navigator.share({text:t})}catch(e){}}else{try{await navigator.clipboard.writeText(t);toast('Máy không có menu chia sẻ — đã sao chép lời nhắn')}catch(e){prompt('Sao chép đoạn này:',t)}}};
  $('#lkOn').onchange=e=>{S.cfg.lkOn=e.target.checked;save.cfg();$('#lkBox').hidden=!S.cfg.lkOn;if(S.cfg.lkOn)lkQueue()};
  $('#lkSite').onchange=e=>{S.cfg.siteUrl=e.target.value.trim();save.cfg();renderRep()};
  $('#lkMean').onchange=e=>{S.cfg.lkMean=e.target.checked;save.cfg();lkQueue()};$('#lkRank').onchange=e=>{S.cfg.lkRank=e.target.checked;save.cfg();lkQueue()};
  $('#lkGen').onclick=()=>{let n=0;c.students.forEach(x=>{if(!x.code){x.code=lkNewCode();n++}});save.classes();renderRep();toast(n?'Đã tạo '+n+' mã mới':'Cả lớp đã có mã');lkQueue()};
  $('#lkPub').onclick=async()=>{if(!c.students.every(x=>x.code)){c.students.forEach(x=>{if(!x.code)x.code=lkNewCode()});save.classes()}await lkPublish(true);renderRep()};
  $('#lkCards').onclick=()=>lkPrintCards(c);
  $$('#repBody [data-cp]').forEach(b=>b.onclick=async()=>{const st=c.students.find(x=>x.id===b.dataset.cp),l=lkLink(st.code);try{await navigator.clipboard.writeText(l);toast('Đã chép link của '+st.name)}catch(e){prompt('Link tra cứu:',l)}});
}
/* ---------- lời nhắn gửi phụ huynh ---------- */
function repList(c){return REP.sel?c.students.filter(x=>x.id===REP.sel):c.students.slice()}
function parentMsg(c,st){
  const {r,sm}=stReport(c,st),sign=S.cfg.sign||'Thầy Vũ Tiến Lực';
  if(!r||!r.last)return `Kính gửi phụ huynh em ${st.name} (lớp ${c.name}). Em chưa có điểm bài kiểm tra nào được chấm.\n${sign}`;
  const p=r.last,ex=p.ex,tot=totalOf(ex)||10;let t=`Kính gửi phụ huynh em ${st.name} (lớp ${c.name}).\nKết quả “${ex.name}” (${vnDate(ex.date)}): ${f1(p.v)}/10 điểm`+(p.mean!=null?`, điểm trung bình lớp ${f1(p.mean)}`:'')+'.';
  if(r.prev){const d=r.d;t+=d>=0.4?` Em tiến bộ ${f1(d)} điểm so với bài trước.`:d<=-0.4?` Điểm giảm ${f1(Math.abs(d))} so với bài trước, mong gia đình động viên và nhắc em ôn lại.`:' Điểm gần như giữ nguyên so với bài trước.'}
  const s=stScan(ex,st),sc=s&&scoreOf(s);if(sc&&p.v<6.5){const w=weakInfo(sc,ex);if(w)t+=` Em cần ôn lại: ${w}.`}
  if(sm&&sm.year!=null)t+=` Điểm trung bình môn cả năm hiện tại: ${f1(sm.year)}.`;else if(sm&&sm.hk1.avg!=null)t+=` Điểm trung bình học kỳ I: ${f1(sm.hk1.avg)}.`;
  const l=st.code&&lkOn()?lkLink(st.code):'';if(l)t+=`\nXem chi tiết các bài: ${l}  (mã tra cứu: ${lkShow(st.code)})`;
  return t+`\nTrân trọng, ${sign}.`;
}
function repText(c){
  const l=repList(c);if(!l.length){toast('Lớp chưa có học sinh');return''}
  return l.map(st=>parentMsg(c,st)).join('\n\n———\n\n');
}
/* ---------- phiếu điểm in / PDF ---------- */
async function repPage(c,st,D,opts){
  const r=D.rows.find(x=>x.st===st),sm=gbSummary(c,st);
  let h=`<div class="pg rp"><div class="ph"><b>${esc(S.cfg.school||'Phiếu điểm cá nhân')}</b><span>Phiếu điểm cá nhân · ${esc(vnDate(todayISO()))}</span></div>
  <h1>${esc(st.name)}</h1><p class="pm">Lớp ${esc(c.name)}${st.sbd?' · SBD '+esc(st.sbd):''}</p>`;
  if(r&&r.have.length){
    const labels=D.exs.map((_,k)=>'B'+(k+1));
    h+=`<div class="rpt"><div class="rpc">${lineChart(labels,[{vals:D.per.map(p=>p.mean),color:'#6b7285',dash:true},{vals:r.pts.map(p=>p.v),color:'#2563eb',main:true}])}<div class="lgd"><span><i style="background:#2563eb"></i>Điểm của em</span><span><i class="ds"></i>TB lớp</span></div></div>
    <div class="rpn"><div class="big"><b>${f1(r.last.v)}</b><small>bài gần nhất</small></div><div class="big"><b>${f1(r.avg)}</b><small>điểm TB các bài</small></div>${r.d!=null?`<div class="big"><b>${r.d>0?'+':''}${f1(r.d)}</b><small>so với bài trước</small></div>`:''}</div></div>`;
    h+='<table class="pt"><thead><tr><th></th><th>Bài kiểm tra</th><th>Ngày</th><th>Điểm (thang 10)</th><th>TB lớp</th><th>Hạng</th></tr></thead><tbody>'+r.pts.map((p,k)=>`<tr><td>B${k+1}</td><td class="l">${esc(p.ex.name)}</td><td>${esc(vnDate(p.ex.date))}</td><td><b>${f1(p.v)}</b></td><td>${f1(p.mean)}</td><td>${p.rk?p.rk+'/'+p.n:'–'}</td></tr>`).join('')+'</tbody></table>';
  }else h+='<p>Em chưa có điểm bài kiểm tra nào được chấm.</p>';
  if(opts.gb&&sm){
    const li=a=>a.length?a.join(' · '):'–';
    h+=`<h2>Sổ điểm môn học</h2><table class="pt"><thead><tr><th></th><th>Thường xuyên</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>ĐTB học kỳ</th></tr></thead><tbody><tr><td><b>HK I</b></td><td>${li(sm.hk1.tx)}</td><td>${li(sm.hk1.gk)}</td><td>${li(sm.hk1.ck)}</td><td><b>${f1(sm.hk1.avg)}</b></td></tr><tr><td><b>HK II</b></td><td>${li(sm.hk2.tx)}</td><td>${li(sm.hk2.gk)}</td><td>${li(sm.hk2.ck)}</td><td><b>${f1(sm.hk2.avg)}</b></td></tr><tr><td colspan="4" style="text-align:right"><b>Điểm trung bình môn cả năm</b></td><td><b>${f1(sm.year)}</b></td></tr></tbody></table>`;
  }
  if(opts.msg&&r&&r.last){
    const ex=r.last.ex,s=stScan(ex,st),sc=s&&scoreOf(s);
    if(sc){const t=buildMsg({s,sc,nm:{name:st.name,lop:c.name}},S.cfg.msgStyle||'am',ex);h+=`<h2>Lời nhắn của thầy cô</h2><div class="quote">${esc(t)}</div>`}
  }
  if(opts.img!=='none'&&r){
    const list=(opts.img==='all'?r.have:[r.last]).filter(Boolean),figs=[];
    for(const p of list){const s=stScan(p.ex,st);if(!s)continue;const im=await idb.get(s.id);if(im)figs.push(`<figure><figcaption><b>${esc(p.ex.name)}</b><span>${f1(p.v)} điểm</span></figcaption><img src="${im}"></figure>`)}
    if(figs.length)h+=`<h2>Ảnh bài làm</h2><div class="grid2">${figs.join('')}</div>`;
  }
  const code=st.code&&lkOn()?st.code:'',link=code?lkLink(code):'';
  if(opts.qr&&link)h+=`<div class="rpq">${qrSvg(link,26)}<div><b>Tra cứu điểm trực tuyến</b><br>Quét mã QR hoặc vào <u>${esc(lkSite().replace(/^https?:\/\//,''))}/tra-cuu.html</u> và nhập mã: <b class="cd">${lkShow(code)}</b></div></div>`;
  h+=`<div class="rpf"><span></span><span>${esc(S.cfg.sign||'Thầy Vũ Tiến Lực')}</span></div></div>`;
  return h;
}
async function repPrint(c){
  const list=repList(c);if(!list.length)return toast('Lớp chưa có học sinh');
  toast('Đang tạo phiếu điểm…',5000);
  const D=progData(c),opts={img:REP.img,msg:REP.msg,gb:REP.gb,qr:REP.qr};
  if(opts.qr&&!(lkOn()&&gsOn()))opts.qr=false;
  let h='<div class="pdf">';for(const st of list)h+=await repPage(c,st,D,opts);h+='</div>';
  printHTML(h);
}
/* ---------- thẻ mã tra cứu (cắt phát cho học sinh) ---------- */
function lkPrintCards(c){
  if(!gsOn())return toast('Chưa nối Google Apps Script — vào Cài đặt');
  if(!lkSite())return toast('Nhập địa chỉ web của app (Vercel) trước');
  let ch=false;c.students.forEach(x=>{if(!x.code){x.code=lkNewCode();ch=true}});if(ch)save.classes();
  let h='<div class="pdf">';
  for(let i=0;i<c.students.length;i+=10){
    h+=`<div class="pg lkp"><div class="lkg">`+c.students.slice(i,i+10).map(st=>`<div class="lkc"><div class="t"><b>${esc(st.name)}</b><span>Lớp ${esc(c.name)}</span><small>Tra cứu điểm Toán: quét mã QR, hoặc vào <u>${esc(lkSite().replace(/^https?:\/\//,''))}/tra-cuu.html</u> rồi nhập mã.</small><div class="cd">${lkShow(st.code)}</div></div>${qrSvg(lkLink(st.code),30)}</div>`).join('')+'</div></div>';
  }
  printHTML(h+'</div>');
}
