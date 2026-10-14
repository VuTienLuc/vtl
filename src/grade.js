/* ===================== SỔ ĐIỂM: THƯỜNG XUYÊN / GIỮA KỲ / CUỐI KỲ ===================== */
/* Mỗi lớp có “cột điểm”: nhập tay hoặc liên kết với một bài kiểm tra đã chấm.
   ĐTB học kỳ = (Σ điểm × hệ số) / Σ hệ số (mặc định TX×1, GK×2, CK×3 theo Thông tư 22/2021).
   ĐTB cả năm = (ĐTB HK1 + 2 × ĐTB HK2) / 3. Điểm làm tròn 1 chữ số thập phân. */
const GB={cid:lsGet('omr.gbcls',null),hk:lsGet('omr.gbhk',1)};
const LOAI={tx:'Thường xuyên',gk:'Giữa kỳ',ck:'Cuối kỳ'},LOAI_S={tx:'TX',gk:'GK',ck:'CK'},LOAI_ORD={tx:0,gk:1,ck:2};
const r1=x=>Math.round(x*10+1e-9)/10;
const f1=x=>x==null||isNaN(x)?'–':String(r1(x)).replace('.',',');
const gbOf=c=>{if(!c.gb)c.gb={w:{tx:1,gk:2,ck:3},cols:[],v:{}};if(!c.gb.v)c.gb.v={};if(!c.gb.w)c.gb.w={tx:1,gk:2,ck:3};return c.gb};

/* bài làm của học sinh trong một bài kiểm tra (nếu có nhiều phiếu thì lấy phiếu quét sau cùng) */
function stScan(ex,st){
  const k=String(parseInt(st.sbd,10));if(!st.sbd||k==='NaN')return null;
  return S.scans.filter(s=>s.examId===ex.id&&!/\?/.test(s.sbd)&&String(parseInt(s.sbd,10))===k).sort((a,b)=>b.t-a.t)[0]||null;
}
/* điểm quy về thang 10, làm tròn 1 chữ số; null nếu chưa có */
function stExamScore(ex,st){const s=stScan(ex,st);if(!s)return null;const sc=scoreOf(s);if(!sc)return null;const tot=totalOf(ex)||10;return r1(sc.total/tot*10)}
function colScore(c,col,st){
  if(col.exam){const ex=exById(col.exam);return ex?stExamScore(ex,st):null}
  const v=gbOf(c).v[col.id],x=v&&v[st.id];return x==null||x===''?null:+x;
}
function gbSem(c,st,hk){
  const g=gbOf(c),b={tx:[],gk:[],ck:[]};
  g.cols.filter(k=>k.hk===hk).forEach(k=>{const v=colScore(c,k,st);if(v!=null)b[k.loai].push(v)});
  let sw=0,sum=0;['tx','gk','ck'].forEach(t=>b[t].forEach(v=>{sw+=num(g.w[t]);sum+=num(g.w[t])*v}));
  return{tx:b.tx,gk:b.gk,ck:b.ck,avg:sw?r1(sum/sw):null,part:!(b.gk.length&&b.ck.length)};
}
function gbYear(c,st){
  const a=gbSem(c,st,1),b=gbSem(c,st,2);
  return{a,b,avg:(a.avg!=null&&b.avg!=null)?r1((a.avg+2*b.avg)/3):null,part:a.part||b.part};
}
/* tóm tắt cho phiếu điểm / tra cứu */
function gbSummary(c,st){
  const g=gbOf(c);if(!g.cols.length)return null;
  const y=gbYear(c,st),pk=s=>({tx:s.tx.map(f1),gk:s.gk.map(f1),ck:s.ck.map(f1),avg:s.avg,part:s.part});
  return{hk1:pk(y.a),hk2:pk(y.b),year:y.avg};
}
const gbCols=(c,hk)=>gbOf(c).cols.map((k,i)=>({k,i})).filter(x=>hk===0||x.k.hk===hk).sort((a,b)=>LOAI_ORD[a.k.loai]-LOAI_ORD[b.k.loai]||a.i-b.i).map(x=>x.k);

/* ---------- hiển thị ---------- */
function gbClass(){if(!S.classes.some(c=>c.id===GB.cid))GB.cid=(S.classes[0]||{}).id||null;return S.classes.find(c=>c.id===GB.cid)||null}
function renderGB(){
  const box=$('#gbBody');
  if(!S.classes.length){box.innerHTML='<div class="empty">Chưa có lớp nào. Vào tab <b>Lớp</b> để tạo danh sách học sinh trước.</div>';return}
  const c=gbClass(),g=gbOf(c),hk=GB.hk;
  let h=`<div class="card"><label class="f">Lớp<select id="gbCls">${S.classes.map(x=>`<option value="${x.id}"${x.id===c.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
  <div class="seg" id="gbSeg"><button data-hk="1"${hk===1?' class="on"':''}>Học kỳ I</button><button data-hk="2"${hk===2?' class="on"':''}>Học kỳ II</button><button data-hk="0"${hk===0?' class="on"':''}>Cả năm</button></div>
  <div class="row gap"><button class="btn primary" id="gbAdd">＋ Thêm cột điểm</button><button class="btn" id="gbW">⚙ Hệ số ${g.w.tx}-${g.w.gk}-${g.w.ck}</button></div></div>`;
  if(!c.students.length){box.innerHTML=h+'<div class="empty">Lớp này chưa có học sinh.</div>';wireGB(c);return}
  const cols=hk===0?[]:gbCols(c,hk);
  if(hk!==0&&!cols.length){box.innerHTML=h+`<div class="empty">Học kỳ này chưa có cột điểm.<br>Bấm “＋ Thêm cột điểm” để thêm điểm <b>thường xuyên</b>, <b>giữa kỳ</b>, <b>cuối kỳ</b> — nhập tay hoặc lấy từ bài kiểm tra đã chấm.</div>`;wireGB(c);return}
  h+='<div class="card tblw"><table class="gbt"><thead><tr><th class="sticky">STT</th><th class="sticky2">Họ và tên</th>';
  if(hk===0)h+='<th>ĐTB HK I</th><th>ĐTB HK II</th><th>Cả năm</th>';
  else h+=cols.map(k=>`<th class="colh" data-col="${k.id}"><span class="tp tp-${k.loai}">${LOAI_S[k.loai]}</span>${esc(k.name)}${k.exam?' <i title="Lấy từ bài kiểm tra">🔗</i>':''}</th>`).join('')+'<th>ĐTB</th>';
  h+='</tr></thead><tbody>';
  let anyPart=false;
  c.students.forEach((st,i)=>{
    h+=`<tr><td class="sticky">${i+1}</td><td class="sticky2 nm">${esc(st.name)}</td>`;
    if(hk===0){const y=gbYear(c,st);anyPart=anyPart||(y.avg!=null&&y.part);
      h+=`<td>${f1(y.a.avg)}</td><td>${f1(y.b.avg)}</td><td class="avg${y.part?' tmp':''}">${f1(y.avg)}</td>`}
    else{
      cols.forEach(k=>{const v=colScore(c,k,st);
        h+=k.exam?`<td class="au">${f1(v)}</td>`:`<td><input class="gi" data-c="${k.id}" data-s="${st.id}" inputmode="decimal" value="${v==null?'':String(v).replace('.',',')}" aria-label="${esc(k.name)} — ${esc(st.name)}"></td>`});
      const s=gbSem(c,st,hk);anyPart=anyPart||(s.avg!=null&&s.part);
      h+=`<td class="avg${s.part?' tmp':''}" data-avg="${st.id}">${f1(s.avg)}</td>`}
    h+='</tr>'});
  // dòng trung bình lớp
  h+='<tr class="foot"><td class="sticky"></td><td class="sticky2 nm">Trung bình lớp</td>';
  const mean=a=>{const v=a.filter(x=>x!=null);return v.length?v.reduce((p,q)=>p+q,0)/v.length:null};
  if(hk===0){const ys=c.students.map(st=>gbYear(c,st));h+=`<td>${f1(mean(ys.map(y=>y.a.avg)))}</td><td>${f1(mean(ys.map(y=>y.b.avg)))}</td><td>${f1(mean(ys.map(y=>y.avg)))}</td>`}
  else{cols.forEach(k=>{h+=`<td>${f1(mean(c.students.map(st=>colScore(c,k,st))))}</td>`});h+=`<td>${f1(mean(c.students.map(st=>gbSem(c,st,hk).avg)))}</td>`}
  h+='</tr></tbody></table></div>';
  h+=`<p class="muted">${hk===0?'ĐTB cả năm = (HK I + 2 × HK II) / 3.':`ĐTB = (TX×${g.w.tx} + GK×${g.w.gk} + CK×${g.w.ck}) / tổng hệ số.`} Điểm làm tròn 1 chữ số.${anyPart?' <i>Số in nghiêng là điểm tạm tính</i> (chưa đủ điểm giữa kỳ hoặc cuối kỳ).':''} Ô có 🔗 lấy tự động từ bài kiểm tra; bấm tên cột để sửa.</p>`;
  h+='<div class="row gap"><button class="btn" id="gbCsv">⬇ Xuất CSV (Excel)</button><button class="btn" id="gbPdf">📄 In / lưu PDF</button></div>';
  box.innerHTML=h;wireGB(c);
}
function wireGB(c){
  const g=gbOf(c);
  $('#gbCls').onchange=e=>{GB.cid=e.target.value;lsSet('omr.gbcls',GB.cid);renderGB()};
  $$('#gbSeg button').forEach(b=>b.onclick=()=>{GB.hk=+b.dataset.hk;lsSet('omr.gbhk',GB.hk);renderGB()});
  $('#gbAdd').onclick=()=>gbEditCol(c,null);
  $('#gbW').onclick=()=>gbEditW(c);
  $$('#gbBody .colh').forEach(t=>t.onclick=()=>gbEditCol(c,t.dataset.col));
  $$('#gbBody .gi').forEach(inp=>{
    inp.onchange=()=>{const col=inp.dataset.c,sid=inp.dataset.s,t=inp.value.trim().replace(',','.');
      const v=g.v[col]||(g.v[col]={});
      if(t===''){delete v[sid]}else{const x=parseFloat(t);if(isNaN(x)||x<0||x>10){toast('Điểm phải từ 0 đến 10');const o=v[sid];inp.value=o==null?'':String(o).replace('.',',');return}v[sid]=r1(x);inp.value=String(v[sid]).replace('.',',')}
      save.classes();
      const st=c.students.find(s=>s.id===sid),td=$(`[data-avg="${sid}"]`);if(td&&st){const s=gbSem(c,st,GB.hk);td.textContent=f1(s.avg);td.classList.toggle('tmp',s.part)}};
    inp.onfocus=()=>inp.select&&inp.select();
  });
  $('#gbCsv')&&($('#gbCsv').onclick=()=>gbCsv(c));
  $('#gbPdf')&&($('#gbPdf').onclick=()=>gbPrint(c));
}
function gbRows(c){
  const hk=GB.hk,rows=[];
  if(hk===0){rows.push(['STT','Họ và tên','SBD','ĐTB HK I','ĐTB HK II','ĐTB cả năm']);
    c.students.forEach((st,i)=>{const y=gbYear(c,st);rows.push([i+1,st.name,st.sbd||'',f1(y.a.avg),f1(y.b.avg),f1(y.avg)])})}
  else{const cols=gbCols(c,hk);rows.push(['STT','Họ và tên','SBD',...cols.map(k=>LOAI_S[k.loai]+' '+k.name),'ĐTB HK '+(hk===1?'I':'II')]);
    c.students.forEach((st,i)=>{const s=gbSem(c,st,hk);rows.push([i+1,st.name,st.sbd||'',...cols.map(k=>f1(colScore(c,k,st))),f1(s.avg)])})}
  return rows;
}
function gbCsv(c){
  const csv='﻿'+gbRows(c).map(r=>r.map(v=>/[",;\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='so-diem-'+c.name+'-'+(GB.hk===0?'ca-nam':'HK'+GB.hk)+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
function gbPrint(c){
  const rows=gbRows(c),hk=GB.hk;
  const h=`<div class="pdf"><div class="pg"><div class="ph"><b>${esc(S.cfg.school||'Sổ điểm')}</b><span>Thầy Vũ Tiến Lực · Chấm phiếu OMR</span></div><h1>Sổ điểm lớp ${esc(c.name)}</h1><p class="pm">${hk===0?'Cả năm học':'Học kỳ '+(hk===1?'I':'II')} · hệ số TX ${gbOf(c).w.tx} – GK ${gbOf(c).w.gk} – CK ${gbOf(c).w.ck}</p>
  <table class="pt"><thead><tr>${rows[0].map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map((x,i)=>`<td${i===1?' class="l"':''}>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  printHTML(h);
}
/* in nội dung HTML (ra PDF bằng hộp thoại in) */
function printHTML(h,imgs){
  const r=$('#printRoot');r.innerHTML=h;
  Promise.all([...r.querySelectorAll('img')].map(i=>i.decode?i.decode().catch(()=>{}):0)).then(()=>{
    document.body.classList.add('printing');
    setTimeout(()=>{window.print();setTimeout(()=>{document.body.classList.remove('printing');r.innerHTML=''},600)},150)});
}

/* ---------- hộp thoại dùng chung ---------- */
function xdlg(title,html){$('#xTitle').textContent=title;$('#xBody').innerHTML=html;$('#xdlg').hidden=false;$('#xdlg .sheetbox').scrollTop=0}
$('#xdlgX').onclick=()=>$('#xdlg').hidden=true;

function gbEditW(c){
  const g=gbOf(c);
  xdlg('Hệ số điểm',`<p class="muted">Mặc định theo Thông tư 22/2021: thường xuyên × 1, giữa kỳ × 2, cuối kỳ × 3. ĐTB cả năm = (HK I + 2 × HK II) / 3.</p>
  <div class="row"><label class="f">Thường xuyên<input id="wTx" inputmode="decimal" value="${g.w.tx}"></label><label class="f">Giữa kỳ<input id="wGk" inputmode="decimal" value="${g.w.gk}"></label><label class="f">Cuối kỳ<input id="wCk" inputmode="decimal" value="${g.w.ck}"></label></div>
  <div class="row gap"><button class="btn" id="wReset">Về mặc định 1-2-3</button><button class="btn primary" id="wOk" style="flex:1">Lưu</button></div>`);
  $('#wReset').onclick=()=>{$('#wTx').value=1;$('#wGk').value=2;$('#wCk').value=3};
  $('#wOk').onclick=()=>{const a=num($('#wTx').value),b=num($('#wGk').value),k=num($('#wCk').value);if(a<=0||b<=0||k<=0)return toast('Hệ số phải lớn hơn 0');g.w={tx:a,gk:b,ck:k};save.classes();$('#xdlg').hidden=true;renderGB()};
}
function gbEditCol(c,id){
  const g=gbOf(c),old=id?g.cols.find(k=>k.id===id):null;
  const k=old?Object.assign({},old):{id:'k'+Math.random().toString(36).slice(2,7),name:'',loai:'tx',hk:GB.hk===2?2:1,exam:''};
  const exs=S.exams.filter(e=>clsOf(e)===c).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  xdlg(old?'Sửa cột điểm':'Thêm cột điểm',`<label class="f"><span>Tên cột <b class="req">*</b></span><input id="kName" placeholder="Kiểm tra 15 phút" value="${esc(k.name)}"></label>
  <div class="f"><span>Loại điểm</span><div class="seg" id="kLoai">${Object.keys(LOAI).map(t=>`<button data-v="${t}"${k.loai===t?' class="on"':''}>${LOAI[t]}</button>`).join('')}</div></div>
  <div class="f"><span>Học kỳ</span><div class="seg" id="kHk"><button data-v="1"${k.hk===1?' class="on"':''}>Học kỳ I</button><button data-v="2"${k.hk===2?' class="on"':''}>Học kỳ II</button></div></div>
  <label class="f"><span>Nguồn điểm</span><select id="kSrc"><option value="">Nhập tay</option>${exs.map(e=>`<option value="${e.id}"${k.exam===e.id?' selected':''}>Lấy từ bài: ${esc(e.name)} (${esc(vnDate(e.date))})</option>`).join('')}</select></label>
  <p class="muted">${exs.length?'Chọn “Lấy từ bài” để điểm tự cập nhật khi chấm hoặc sửa đáp án (quy về thang 10).':'Chưa có bài kiểm tra nào gắn với lớp này (đặt “Lớp” khi tạo bài ở tab Bài).'}</p>
  <div class="row gap">${old&&!old.exam?'<button class="btn" id="kPaste">📋 Dán điểm cả cột</button>':''}${old?'<button class="btn danger ghost" id="kDel">Xóa cột</button>':''}<button class="btn primary" id="kOk" style="flex:1">Lưu</button></div>`);
  const seg=(sel,cb)=>$$(sel+' button').forEach(b=>b.onclick=()=>{$$(sel+' button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cb(b.dataset.v)});
  seg('#kLoai',v=>k.loai=v);seg('#kHk',v=>k.hk=+v);
  $('#kSrc').onchange=e=>{k.exam=e.target.value;const ex=exById(k.exam);if(ex&&!$('#kName').value.trim())$('#kName').value=ex.name};
  $('#kOk').onclick=()=>{k.name=$('#kName').value.trim();if(!k.name)return toast('Nhập tên cột');k.exam=$('#kSrc').value;
    if(old)Object.assign(old,k);else g.cols.push(k);save.classes();$('#xdlg').hidden=true;GB.hk=k.hk;lsSet('omr.gbhk',GB.hk);renderGB()};
  if(old&&$('#kDel'))$('#kDel').onclick=()=>{if(!confirm('Xóa cột “'+old.name+'” và điểm đã nhập?'))return;g.cols=g.cols.filter(x=>x.id!==old.id);delete g.v[old.id];save.classes();$('#xdlg').hidden=true;renderGB()};
  if($('#kPaste'))$('#kPaste').onclick=()=>{const t=prompt('Dán các điểm theo đúng thứ tự STT của lớp (mỗi dòng một điểm, dòng trống = chưa có):');if(t==null)return;
    const lines=t.replace(/\r/g,'').split('\n');if(lines.length&&lines[lines.length-1].trim()==='')lines.pop();
    const v={};let n=0,bad=0;c.students.forEach((st,i)=>{const s=(lines[i]||'').trim().replace(',','.');if(s==='')return;const x=parseFloat(s);if(isNaN(x)||x<0||x>10){bad++;return}v[st.id]=r1(x);n++});
    g.v[old.id]=v;save.classes();$('#xdlg').hidden=true;renderGB();toast('Đã nhập '+n+' điểm'+(bad?' · '+bad+' dòng không hợp lệ':''))};
}
