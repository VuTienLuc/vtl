/* ===================== TIẾN BỘ TỪNG HỌC SINH + SO SÁNH GIỮA CÁC LỚP ===================== */
const PR={cid:lsGet('omr.prcls',null),view:lsGet('omr.prview','st'),sort:lsGet('omr.prsort','stt'),grp:lsGet('omr.prgrp','')};
const mean0=a=>{const v=a.filter(x=>x!=null&&!isNaN(x));return v.length?v.reduce((p,q)=>p+q,0)/v.length:null};
const grpKey=ex=>String(ex.name||'').normalize('NFC').replace(/\s+/g,' ').trim().toLowerCase();
const exOrd=(a,b)=>String(a.date).localeCompare(String(b.date))||a.t-b.t;

/* các bài kiểm tra đã có phiếu của một lớp, theo thứ tự thời gian */
const clsExams=c=>S.exams.filter(e=>clsOf(e)===c&&S.scans.some(s=>s.examId===e.id)).sort(exOrd);
function progData(c){
  const exs=clsExams(c);
  const per=exs.map(ex=>{const sc=c.students.map(st=>stExamScore(ex,st)),vals=sc.filter(x=>x!=null),sorted=[...vals].sort((a,b)=>b-a);
    return{ex,sc,n:vals.length,mean:mean0(vals),max:vals.length?Math.max(...vals):null,min:vals.length?Math.min(...vals):null,rankOf:v=>v==null?null:sorted.indexOf(v)+1}});
  const rows=c.students.map((st,i)=>{
    const pts=per.map(p=>({ex:p.ex,v:p.sc[i],mean:p.mean,rk:p.rankOf(p.sc[i]),n:p.n})),have=pts.filter(p=>p.v!=null),
      last=have[have.length-1]||null,prev=have[have.length-2]||null;
    return{st,i,pts,have,last,prev,avg:mean0(have.map(p=>p.v)),d:last&&prev?r1(last.v-prev.v):null}});
  return{exs,per,rows};
}
/* ---------- biểu đồ SVG ---------- */
function spark(vals,w,h){
  w=w||84;h=h||26;const n=vals.length,pad=3;if(n<1)return'';
  const X=i=>n===1?w/2:pad+i*(w-2*pad)/(n-1),Y=v=>h-pad-(v/10)*(h-2*pad);
  const pts=vals.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);if(!pts.length)return'';
  const lastP=pts[pts.length-1];
  return`<svg class="spk" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><line x1="0" x2="${w}" y1="${Y(5)}" y2="${Y(5)}" stroke="var(--border)" stroke-dasharray="2 3"/><polyline points="${pts.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lastP[0].toFixed(1)}" cy="${lastP[1].toFixed(1)}" r="3" fill="var(--primary)"/></svg>`;
}
function lineChart(labels,series){
  const W=340,H=170,L=26,R=10,T=12,B=26,n=labels.length,iw=W-L-R,ih=H-T-B;
  const X=i=>n===1?L+iw/2:L+i*iw/(n-1),Y=v=>T+ih-(v/10)*ih;
  let s=`<svg class="lch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ điểm qua các bài">`;
  [0,2.5,5,7.5,10].forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--border)" ${v===5?'stroke-dasharray="4 3"':''}/><text x="${L-4}" y="${Y(v)+3}" text-anchor="end" font-size="9" fill="var(--muted)">${v}</text>`});
  labels.forEach((lb,i)=>{s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle" font-size="9" fill="var(--muted)">${esc(lb)}</text>`});
  series.forEach(se=>{
    const pts=se.vals.map((v,i)=>v==null?null:[X(i),Y(v),v]);let d='',pen=false;
    pts.forEach(p=>{if(!p){pen=false;return}d+=(pen?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)+' ';pen=true});
    s+=`<path d="${d}" fill="none" stroke="${se.color}" stroke-width="${se.main?2.5:1.8}" ${se.dash?'stroke-dasharray="5 4"':''} stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach(p=>{if(!p)return;s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${se.main?3.6:2.6}" fill="${se.color}"/>`;if(se.main)s+=`<text x="${p[0].toFixed(1)}" y="${(p[1]-7).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--text)">${f1(p[2])}</text>`});
  });
  return s+'</svg>';
}
const arrow=d=>d==null?'':d>=1?`<span class="dl up">▲ ${f1(d)}</span>`:d<=-1?`<span class="dl dn">▼ ${f1(Math.abs(d))}</span>`:d>0?`<span class="dl fl">▲ ${f1(d)}</span>`:d<0?`<span class="dl fl">▼ ${f1(Math.abs(d))}</span>`:'<span class="dl fl">＝</span>';

/* ---------- màn hình ---------- */
function prClass(){if(!S.classes.some(c=>c.id===PR.cid))PR.cid=(S.classes[0]||{}).id||null;return S.classes.find(c=>c.id===PR.cid)||null}
function renderProg(){
  const box=$('#prBody');
  if(!S.classes.length){box.innerHTML='<div class="empty">Chưa có lớp nào. Vào tab <b>Lớp</b> để tạo danh sách học sinh, rồi tạo bài kiểm tra có đặt “Lớp” và quét phiếu.</div>';return}
  let h=`<div class="seg" id="prSeg"><button data-v="st"${PR.view==='st'?' class="on"':''}>👤 Từng học sinh</button><button data-v="cmp"${PR.view==='cmp'?' class="on"':''}>🏫 So sánh các lớp</button></div>`;
  h+=PR.view==='st'?progStudents():progCompare();
  box.innerHTML=h;
  $$('#prSeg button').forEach(b=>b.onclick=()=>{PR.view=b.dataset.v;lsSet('omr.prview',PR.view);renderProg()});
  if(PR.view==='st')wireStudents();else wireCompare();
}
function progStudents(){
  const c=prClass(),D=progData(c);
  let h=`<div class="card"><label class="f">Lớp<select id="prCls">${S.classes.map(x=>`<option value="${x.id}"${x.id===c.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>`;
  if(!D.exs.length)return h+'</div><div class="empty">Lớp này chưa có bài kiểm tra nào đã quét. Tạo bài ở tab <b>Bài</b> (chọn đúng lớp) rồi quét phiếu.</div>';
  const up=D.rows.filter(r=>r.d!=null&&r.d>=1),dn=D.rows.filter(r=>r.d!=null&&r.d<=-1),low=D.rows.filter(r=>r.last&&r.last.v<5);
  const lastP=D.per[D.per.length-1];
  h+=`<p class="muted" style="margin:0">${D.exs.length} bài kiểm tra · bài gần nhất “${esc(lastP.ex.name)}”: TB lớp <b>${f1(lastP.mean)}</b>, ${lastP.n}/${c.students.length} em có điểm</p></div>`;
  h+=`<div class="chips"><span class="chip up">▲ Tiến bộ <b>${up.length}</b></span><span class="chip dn">▼ Giảm điểm <b>${dn.length}</b></span><span class="chip lo">Dưới 5 <b>${low.length}</b></span></div>`;
  if(D.exs.length<2)h+='<p class="muted">Cần ít nhất 2 bài kiểm tra để thấy xu hướng tiến bộ.</p>';
  if(dn.length)h+=`<div class="card warnb"><b>Cần chú ý (giảm từ 1 điểm trở lên):</b> ${dn.sort((a,b)=>a.d-b.d).map(r=>esc(r.st.name)+' ('+f1(r.d)+')').join('; ')}</div>`;
  if(up.length)h+=`<div class="card okb"><b>Tiến bộ rõ (tăng từ 1 điểm trở lên):</b> ${up.sort((a,b)=>b.d-a.d).map(r=>esc(r.st.name)+' (+'+f1(r.d)+')').join('; ')}</div>`;
  h+=`<div class="seg sm" id="prSort">${[['stt','Theo STT'],['up','Tiến bộ nhất'],['dn','Giảm nhiều nhất'],['avg','Điểm TB']].map(x=>`<button data-v="${x[0]}"${PR.sort===x[0]?' class="on"':''}>${x[1]}</button>`).join('')}</div>`;
  const rows=D.rows.slice();
  if(PR.sort==='up')rows.sort((a,b)=>(b.d==null?-99:b.d)-(a.d==null?-99:a.d));
  else if(PR.sort==='dn')rows.sort((a,b)=>(a.d==null?99:a.d)-(b.d==null?99:b.d));
  else if(PR.sort==='avg')rows.sort((a,b)=>(b.avg==null?-1:b.avg)-(a.avg==null?-1:a.avg));
  h+='<div class="list">'+rows.map(r=>`<button class="item prow" data-i="${r.i}"><div class="l"><b>${r.i+1}. ${esc(r.st.name)}</b><small>${r.have.length?`TB ${f1(r.avg)} · ${r.have.length}/${D.exs.length} bài`:'Chưa có điểm'}</small></div>${spark(r.pts.map(p=>p.v))}<div class="sc">${r.last?`<b>${f1(r.last.v)}</b>${arrow(r.d)}`:'<b>–</b>'}</div></button>`).join('')+'</div>';
  h+='<div class="row gap"><button class="btn" id="prCsv">⬇ Xuất CSV tiến bộ</button></div>';
  return h;
}
function wireStudents(){
  const c=prClass();
  $('#prCls').onchange=e=>{PR.cid=e.target.value;lsSet('omr.prcls',PR.cid);renderProg()};
  $$('#prSort button').forEach(b=>b.onclick=()=>{PR.sort=b.dataset.v;lsSet('omr.prsort',PR.sort);renderProg()});
  $$('#prBody .prow').forEach(b=>b.onclick=()=>progStudentDlg(c,+b.dataset.i));
  const csv=$('#prCsv');if(csv)csv.onclick=()=>{const D=progData(c);
    const rows=[['STT','Họ và tên','SBD',...D.exs.map(e=>e.name+' ('+vnDate(e.date)+')'),'Điểm TB','Thay đổi bài gần nhất'],...D.rows.map(r=>[r.i+1,r.st.name,r.st.sbd||'',...r.pts.map(p=>f1(p.v)),f1(r.avg),r.d==null?'':f1(r.d)]),
      ['','Trung bình lớp','',...D.per.map(p=>f1(p.mean)),'','']];
    const t='﻿'+rows.map(r=>r.map(v=>/[",;\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')).join('\r\n'),a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([t],{type:'text/csv;charset=utf-8'}));a.download='tien-bo-'+c.name+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
}
function progStudentDlg(c,i){
  const D=progData(c),r=D.rows[i];if(!r)return;
  const labels=D.exs.map((_,k)=>'B'+(k+1));
  let h=`<p class="muted" style="margin:0 0 6px">Lớp ${esc(c.name)}${r.st.sbd?' · SBD '+esc(r.st.sbd):''}</p>`;
  h+=`<div class="lcw">${lineChart(labels,[{vals:D.per.map(p=>p.mean),color:'var(--muted)',dash:true},{vals:r.pts.map(p=>p.v),color:'var(--primary)',main:true}])}</div><div class="lgd"><span><i style="background:var(--primary)"></i>${esc(r.st.name)}</span><span><i class="ds"></i>TB lớp</span></div>`;
  h+='<table class="gbt sm"><thead><tr><th></th><th>Bài kiểm tra</th><th>Điểm</th><th>TB lớp</th><th>Hạng</th></tr></thead><tbody>'+
    r.pts.map((p,k)=>`<tr><td>B${k+1}</td><td class="l">${esc(p.ex.name)}<small>${esc(vnDate(p.ex.date))}</small></td><td><b>${f1(p.v)}</b></td><td>${f1(p.mean)}</td><td>${p.rk?p.rk+'/'+p.n:'–'}</td></tr>`).join('')+'</tbody></table>';
  const sm=gbSummary(c,r.st);
  if(sm)h+=`<p class="muted">Sổ điểm: HK I = <b>${f1(sm.hk1.avg)}</b> · HK II = <b>${f1(sm.hk2.avg)}</b> · Cả năm = <b>${f1(sm.year)}</b></p>`;
  h+=`<div class="row gap"><button class="btn primary" id="pdRep">📄 Phiếu điểm cho phụ huynh</button></div>`;
  xdlg(r.st.name,h);
  $('#pdRep').onclick=()=>{$('#xdlg').hidden=true;repOpen(c.id,r.st.id)};
}
/* ---------- so sánh lớp ---------- */
function cmpGroups(){
  const m={};
  S.exams.forEach(e=>{const c=clsOf(e);if(!c||!S.scans.some(s=>s.examId===e.id))return;const k=grpKey(e);(m[k]||(m[k]={key:k,name:e.name,exams:[],date:e.date}));m[k].exams.push({ex:e,c});if(String(e.date)>String(m[k].date))m[k].date=e.date});
  return Object.values(m).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function classStat(ex,c){
  const sc=c.students.map(st=>stExamScore(ex,st)),v=sc.filter(x=>x!=null),n=v.length;
  const pc=f=>n?Math.round(v.filter(f).length/n*100):0;
  return{c,ex,size:c.students.length,n,mean:mean0(v),max:n?Math.max(...v):null,min:n?Math.min(...v):null,g:pc(x=>x>=8),k:pc(x=>x>=6.5&&x<8),t:pc(x=>x>=5&&x<6.5),y:pc(x=>x<5),all:v};
}
function progCompare(){
  const G=cmpGroups();
  if(!G.length)return'<div class="empty">Chưa có dữ liệu để so sánh. Cần các bài kiểm tra đã quét và đã đặt “Lớp” cho bài.</div>';
  if(!G.some(g=>g.key===PR.grp))PR.grp=G[0].key;
  const g=G.find(x=>x.key===PR.grp),st=g.exams.map(x=>classStat(x.ex,x.c)).sort((a,b)=>(b.mean==null?-1:b.mean)-(a.mean==null?-1:a.mean));
  let h=`<div class="card"><label class="f">Đợt kiểm tra (các lớp có bài trùng tên)<select id="cmpG">${G.map(x=>`<option value="${esc(x.key)}"${x.key===g.key?' selected':''}>${esc(x.name)} · ${x.exams.length} lớp</option>`).join('')}</select></label>
  <p class="muted" style="margin:0">Muốn so sánh nhiều lớp, đặt <b>cùng tên bài</b> cho các lớp (ví dụ “Kiểm tra giữa kỳ I”).</p></div>`;
  const mx=10;
  h+=`<div class="card"><h3>Điểm trung bình</h3><div class="hbars">${st.map(x=>`<div class="hb"><span class="nm">${esc(x.c.name)}</span><div class="bar"><i style="width:${x.mean==null?0:x.mean/mx*100}%"></i></div><b>${f1(x.mean)}</b></div>`).join('')}</div></div>`;
  h+=`<div class="card tblw"><table class="gbt"><thead><tr><th>Lớp</th><th>Làm bài</th><th>TB</th><th>Cao</th><th>Thấp</th><th class="wide">Phân bố</th></tr></thead><tbody>${st.map(x=>`<tr><td><b>${esc(x.c.name)}</b></td><td>${x.n}/${x.size}</td><td class="avg">${f1(x.mean)}</td><td>${f1(x.max)}</td><td>${f1(x.min)}</td><td class="wide"><div class="stk" title="Giỏi ${x.g}% · Khá ${x.k}% · Đạt ${x.t}% · Chưa đạt ${x.y}%"><i class="s1" style="width:${x.g}%"></i><i class="s2" style="width:${x.k}%"></i><i class="s3" style="width:${x.t}%"></i><i class="s4" style="width:${x.y}%"></i></div></td></tr>`).join('')}</tbody></table></div>
  <div class="lgd"><span><i class="s1"></i>Giỏi ≥ 8</span><span><i class="s2"></i>Khá 6,5–8</span><span><i class="s3"></i>Đạt 5–6,5</span><span><i class="s4"></i>Chưa đạt &lt; 5</span></div>`;
  // ma trận lớp × đợt
  const cls=[...new Set(G.flatMap(x=>x.exams.map(e=>e.c.id)))].map(id=>S.classes.find(c=>c.id===id)),gs=G.slice(0,6).reverse();
  if(gs.length>1&&cls.length>1){
    h+=`<div class="card tblw"><h3 style="padding:12px 12px 0">Điểm TB các lớp qua các đợt</h3><table class="gbt"><thead><tr><th>Lớp</th>${gs.map(x=>`<th title="${esc(x.name)}">${esc(x.name.length>12?x.name.slice(0,11)+'…':x.name)}</th>`).join('')}<th>Chung</th></tr></thead><tbody>${cls.map(c=>{
      const vals=gs.map(x=>{const e=x.exams.find(y=>y.c===c);return e?classStat(e.ex,c).mean:null});
      const all=G.flatMap(x=>x.exams.filter(y=>y.c===c).flatMap(y=>classStat(y.ex,c).all));
      return`<tr><td><b>${esc(c.name)}</b></td>${vals.map(v=>`<td>${f1(v)}</td>`).join('')}<td class="avg">${f1(mean0(all))}</td></tr>`}).join('')}</tbody></table></div>`}
  return h;
}
function wireCompare(){const s=$('#cmpG');if(s)s.onchange=e=>{PR.grp=e.target.value;lsSet('omr.prgrp',PR.grp);renderProg()}}
