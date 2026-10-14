'use strict';
/* ===================== TIỆN ÍCH ===================== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>n==null||isNaN(n)?'–':(Math.round(n*1000)/1000).toString().replace('.',',');

/* ===================== BỐ CỤC PHIẾU (mm, A4) ===================== */
const BUB_R=2.4,INNER=1.45;
function buildLayout(id){
  const m=/^tn(\d+)$/.exec(id),n=m?+m[1]:id==='half'?20:12;
  const L={id,W:210,H:297,mk:8,M:[[12,12],[198,12],[198,285],[12,285]],bar:[32,10.5,16,3],ref:[32,15.5,16,2],
    groups:[],texts:[],rects:[],lines:[],nTN:n,nDS:m?0:4,nTLN:m?0:6,tnTitle:'',r:BUB_R};
  const T=(x,y,s,o)=>L.texts.push(Object.assign({x,y,s},o||{}));
  const G=(gid,kind,labels,pts,ex)=>L.groups.push(Object.assign({id:gid,kind,labels,pts},ex||{}));
  if(id==='half')return buildHalf(L,T,G);
  T(20,26,'PHIẾU TRẢ LỜI TRẮC NGHIỆM',{size:5,bold:1});
  T(20,44,'Họ và tên:',{size:3});L.lines.push([38,44.5,120,44.5]);
  T(20,53,'Lớp:',{size:3});L.lines.push([28,53.5,60,53.5]);
  T(68,53,'Ngày:',{size:3});L.lines.push([79,53.5,120,53.5]);
  L.rects.push({x:18,y:58.5,w:104,h:25.5,r:1.5});
  ['• Dùng bút chì đen hoặc bút mực đen, tô kín ô tròn.','• Không viết, không tô vào 4 ô vuông đen ở góc phiếu.','• Muốn sửa: tẩy sạch hoặc gạch bỏ hẳn, chỉ để 1 ô được tô.','• Phần III: viết đáp án vào ô, rồi tô các ô tròn tương ứng.'].forEach((s,i)=>T(20.5,64+i*5,s,{size:2.7}));
  // SBD (6 cột) + Mã đề (3 cột)
  T(130,22,'SỐ BÁO DANH',{size:2.8,bold:1});T(166,22,'MÃ ĐỀ',{size:2.8,bold:1});
  for(let c=0;c<6;c++){const x=130+c*5.4;L.rects.push({x:x-2.5,y:24.5,w:5,h:6});
    G('sbd'+c,'sbd',[...'0123456789'],[...Array(10)].map((_,r)=>[x,38+r*5]))}
  for(let c=0;c<3;c++){const x=166+c*5.4;L.rects.push({x:x-2.5,y:24.5,w:5,h:6});
    G('md'+c,'md',[...'0123456789'],[...Array(10)].map((_,r)=>[x,38+r*5]))}
  for(let r=0;r<10;r++){T(126.4,38+r*5+0.9,String(r),{size:2.4,anchor:'end'});T(162.4,38+r*5+0.9,String(r),{size:2.4,anchor:'end'})}
  // PHẦN I
  let y;
  if(!m){
    T(18,92,'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (mỗi câu chỉ chọn một)',{size:3.2,bold:1});
    [18,78,138].forEach((x0,b)=>{
      [...'ABCD'].forEach((ch,k)=>T(x0+14+k*9,99,ch,{size:2.8,anchor:'middle',bold:1}));
      for(let r=0;r<4;r++){const q=b*4+r+1,yy=106+r*6.6;T(x0+7,yy+1,String(q),{size:3,anchor:'end',bold:1});
        G('tn'+q,'tn',[...'ABCD'],[0,1,2,3].map(k=>[x0+14+k*9,yy]),{q})}
    });
    // PHẦN II
    T(18,139,'PHẦN II. Câu trắc nghiệm đúng sai (mỗi ý chọn Đ hoặc S)',{size:3.2,bold:1});
    [18,64,110,156].forEach((x0,b)=>{
      T(x0,146,'Câu '+(b+1),{size:3,bold:1});T(x0+22,146,'Đ',{size:2.8,anchor:'middle',bold:1});T(x0+33,146,'S',{size:2.8,anchor:'middle',bold:1});
      for(let i=0;i<4;i++){const yy=153+i*6.6;T(x0+13,yy+1,'abcd'[i]+')',{size:3,anchor:'end'});
        G('ds'+(b+1)+'_'+i,'ds',['Đ','S'],[[x0+22,yy],[x0+33,yy]],{q:b+1,i})}
    });
    // PHẦN III
    T(18,187,'PHẦN III. Câu trắc nghiệm trả lời ngắn (đáp án tối đa 4 ký tự)',{size:3.2,bold:1});
    for(let b=0;b<6;b++){const x0=16+b*31.5;
      T(x0+16,194,'Câu '+(b+1),{size:3,anchor:'middle',bold:1});
      for(let c=0;c<4;c++){L.rects.push({x:x0+8+c*5.8-2.7,y:196,w:5.4,h:6});T(x0+8+c*5.8,206.4,c?',':'−',{size:3,anchor:'middle',bold:1})}
      for(let r=1;r<=10;r++)T(x0+4.8,209+r*5+0.8,String(r-1),{size:2.4,anchor:'end'});
      for(let c=0;c<4;c++)G('tl'+(b+1)+'_'+c,'tln',[c?',':'-',...'0123456789'],[...Array(11)].map((_,r)=>[x0+8+c*5.8,209+r*5]),{q:b+1,c,r:2.2})}
    T(18,268,'Phiếu này được chấm bằng camera điện thoại. Giữ phiếu phẳng, đủ sáng, thấy rõ 4 ô vuông đen ở góc.',{size:2.6});
  }else{
    T(18,92,'TRẮC NGHIỆM ('+n+' câu, mỗi câu chỉ chọn một phương án)',{size:3.2,bold:1});
    const rows=Math.ceil(n/4);
    [18,64,110,156].forEach((x0,b)=>{
      [...'ABCD'].forEach((ch,k)=>T(x0+10+k*8,99,ch,{size:2.8,anchor:'middle',bold:1}));
      for(let r=0;r<rows;r++){const q=b*rows+r+1;if(q>n)break;const yy=106+r*6.2;
        T(x0+4,yy+1,String(q),{size:3,anchor:'end',bold:1});
        G('tn'+q,'tn',[...'ABCD'],[0,1,2,3].map(k=>[x0+10+k*8,yy]),{q})}
    });
    T(18,268,'Phiếu này được chấm bằng camera điện thoại. Giữ phiếu phẳng, đủ sáng, thấy rõ 4 ô vuông đen ở góc.',{size:2.6});
  }
  return finish(L);
}
function finish(L){ // lân cận (cho ước lượng nền giấy)
  const all=[];L.groups.forEach(g=>g.pts.forEach((p,k)=>all.push({g,k,x:p[0],y:p[1]})));
  all.forEach((a,i)=>{a.nb=[];all.forEach((b,j)=>{if(Math.hypot(a.x-b.x,a.y-b.y)<(L.nbR||28))a.nb.push(j)})});
  L.all=all;return L;
}
/* Phiếu NỬA TỜ A4 (210×148,5 mm): in 2 phiếu trên 1 tờ A4 rồi cắt đôi. 20 TN + 6 Đúng–Sai + 6 Trả lời ngắn */
function buildHalf(L,T,G){
  L.H=148.5;L.mk=6;L.M=[[8,8],[202,8],[202,140.5],[8,140.5]];L.bar=[26,6.5,14,3];L.ref=[26,11,14,2.2];
  L.nTN=20;L.nDS=6;L.nTLN=6;L.r=1.9;L.inner=1.1;L.nbR=20;L.dual=true;
  L.hdr={school:[14,18.2,2.6],exam:[14,31.5,2.8]};L.pts={tn:0.2,tln:0.5,ds:[0,0.05,0.125,0.25,0.5]};
  // ── Hàng trên, từ trái sang phải: thông tin → SỐ BÁO DANH → MÃ ĐỀ → PHẦN I ──
  T(14,25,'PHIẾU TRẢ LỜI TRẮC NGHIỆM',{size:4.2,bold:1});
  T(14,39,'Họ và tên:',{size:2.8});L.lines.push([29,39.5,88,39.5]);
  T(14,46,'Lớp:',{size:2.8});L.lines.push([22,46.5,44,46.5]);T(48,46,'Ngày:',{size:2.8});L.lines.push([58,46.5,88,46.5]);
  L.rects.push({x:14,y:50.5,w:74,h:15,r:1.2});
  T(16,55.3,'• Tô kín ô tròn bằng bút chì đen hoặc bút mực đen.',{size:2.2});
  T(16,59.3,'• Không viết vào 4 ô vuông đen ở góc phiếu.',{size:2.2});
  T(16,63.3,'• Phần III: viết đáp án vào ô, rồi tô số bên dưới.',{size:2.2});
  // số báo danh (6 cột) và mã đề (3 cột): ô vuông để ghi số + bảng tô
  const sx=c=>94+c*4.3,mx=c=>124+c*4.3,ry=r=>27+r*4;
  T(94,16.3,'SỐ BÁO DANH',{size:2.3,bold:1});T(124,16.3,'MÃ ĐỀ',{size:2.3,bold:1});
  for(let c=0;c<6;c++){L.rects.push({x:sx(c)-2.1,y:18.3,w:4.2,h:5.2});
    G('sbd'+c,'sbd',[...'0123456789'],[...Array(10)].map((_,r)=>[sx(c),ry(r)]),{r:1.7})}
  for(let c=0;c<3;c++){L.rects.push({x:mx(c)-2.1,y:18.3,w:4.2,h:5.2});
    G('md'+c,'md',[...'0123456789'],[...Array(10)].map((_,r)=>[mx(c),ry(r)]),{r:1.7})}
  for(let r=0;r<10;r++){T(90.9,ry(r)+0.7,String(r),{size:2,anchor:'end'});T(120.9,ry(r)+0.7,String(r),{size:2,anchor:'end'})}
  // PHẦN I: 20 câu = 2 khối × 10 hàng
  T(140,16.3,'I. TRẮC NGHIỆM (20 câu, chọn 1)',{size:2.5,bold:1});
  [140,167].forEach((x0,b)=>{
    [...'ABCD'].forEach((ch,k)=>T(x0+8+k*4.6,21.4,ch,{size:2.2,anchor:'middle',bold:1}));
    for(let r=0;r<10;r++){const q=b*10+r+1,yy=25+r*4.3;T(x0+5,yy+0.8,String(q),{size:2.4,anchor:'end',bold:1});
      G('tn'+q,'tn',[...'ABCD'],[0,1,2,3].map(k=>[x0+8+k*4.6,yy]),{q})}
  });
  // ── Hàng dưới: PHẦN II (đúng–sai) rồi PHẦN III (trả lời ngắn) ──
  T(14,71.5,'II. ĐÚNG – SAI (6 câu)',{size:2.5,bold:1});
  for(let j=0;j<3;j++)for(let rw=0;rw<2;rw++){const q=rw*3+j+1,x0=14+j*16.8,yb=rw?103:76.5;
    T(x0,yb,'Câu '+q,{size:2.6,bold:1});T(x0+6.5,yb+3.6,'Đ',{size:2.2,anchor:'middle',bold:1});T(x0+11.3,yb+3.6,'S',{size:2.2,anchor:'middle',bold:1});
    for(let i=0;i<4;i++){const yy=yb+7.4+i*4.1;T(x0+3.4,yy+0.7,'abcd'[i]+')',{size:2.2,anchor:'end'});
      G('ds'+q+'_'+i,'ds',['Đ','S'],[[x0+6.5,yy],[x0+11.3,yy]],{q,i,r:1.8})}}
  T(70,71.5,'III. TRẢ LỜI NGẮN (6 câu, tối đa 4 ký tự: viết vào ô rồi tô từng cột)',{size:2.5,bold:1});
  for(let b=0;b<6;b++){const x0=70+b*21;
    T(x0+9.6,76.5,'Câu '+(b+1),{size:2.6,anchor:'middle',bold:1});
    for(let c=0;c<4;c++){const cx=x0+6+c*4.4;L.rects.push({x:cx-2.1,y:77.8,w:4.2,h:4.6});T(cx,86.2,c?',':'−',{size:2.6,anchor:'middle',bold:1})}
    for(let r=1;r<=10;r++)T(x0+2.6,88+r*4.1+0.7,String(r-1),{size:2,anchor:'end'});
    for(let c=0;c<4;c++)G('tl'+(b+1)+'_'+c,'tln',[c?',':'-',...'0123456789'],[...Array(11)].map((_,r)=>[x0+6+c*4.4,88+r*4.1]),{q:b+1,c,r:1.8})
  }
  T(14,134.6,'Phiếu chấm bằng camera: giữ phiếu phẳng, đủ sáng, thấy rõ 4 ô vuông đen ở góc.',{size:2.1});
  return finish(L);
}
const LAYOUTS={};const getLayout=id=>LAYOUTS[id]||(LAYOUTS[id]=buildLayout(id));
const LAYOUT_NAMES={half:'Nửa tờ A4 (2 phiếu/tờ): 20 TN + 6 Đúng–Sai + 6 Trả lời ngắn',thpt2025:'THPT 2025: 12 TN + 4 Đúng–Sai + 6 Trả lời ngắn',tn20:'Trắc nghiệm 20 câu (A–D)',tn30:'Trắc nghiệm 30 câu (A–D)',tn40:'Trắc nghiệm 40 câu (A–D)',tn50:'Trắc nghiệm 50 câu (A–D)'};

/* ===================== VẼ PHIẾU (SVG) ===================== */
// fill: {groupId:[chỉ số ô được tô,...]} dùng cho phiếu mẫu / kiểm thử
function sheetSVG(L,info,fill,fillOpt,dual){
  const body=sheetBody(L,info,fill,fillOpt);
  if(dual&&L.dual)return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm" font-family="Helvetica,Arial,sans-serif"><rect width="210" height="297" fill="#fff"/><g>${body}</g><g transform="translate(0,148.5)">${body}</g><line x1="0" y1="148.5" x2="210" y2="148.5" stroke="#888" stroke-width=".25" stroke-dasharray="2 1.5"/><text x="3" y="147.6" font-size="2.6" fill="#888" font-family="Helvetica,Arial,sans-serif">✂ cắt ở đây</text></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.W} ${L.H}" width="${L.W}mm" height="${L.H}mm" font-family="Helvetica,Arial,sans-serif"><rect width="${L.W}" height="${L.H}" fill="#fff"/>${body}</svg>`;
}
function sheetBody(L,info,fill,fillOpt){
  info=info||{};fillOpt=fillOpt||{};let s='';
  L.M.forEach(p=>s+=`<rect x="${p[0]-L.mk/2}" y="${p[1]-L.mk/2}" width="${L.mk}" height="${L.mk}" fill="#000"/>`);
  s+=`<rect x="${L.bar[0]}" y="${L.bar[1]}" width="${L.bar[2]}" height="${L.bar[3]}" fill="#000"/>`;
  const hd=L.hdr||{school:[20,19,3.2],exam:[20,34,3.6]};
  if(info.school)s+=`<text x="${hd.school[0]}" y="${hd.school[1]}" font-size="${hd.school[2]}" fill="#000">${esc(info.school)}</text>`;
  if(info.exam||info.date)s+=`<text x="${hd.exam[0]}" y="${hd.exam[1]}" font-size="${hd.exam[2]}" font-weight="bold" fill="#000">${esc(info.exam||'')}${info.date?'  –  '+esc(info.date):''}</text>`;
  L.rects.forEach(r=>s+=`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"${r.r?` rx="${r.r}"`:''} fill="none" stroke="#000" stroke-width=".3"/>`);
  L.lines.forEach(l=>s+=`<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#000" stroke-width=".2" stroke-dasharray=".6 .8"/>`);
  L.texts.forEach(t=>s+=`<text x="${t.x}" y="${t.y}" font-size="${t.size||3}"${t.bold?' font-weight="bold"':''}${t.anchor?` text-anchor="${t.anchor}"`:''} fill="#000">${esc(t.s)}</text>`);
  L.groups.forEach(g=>{const R=g.r||L.r;g.pts.forEach((p,k)=>{
    s+=`<circle cx="${p[0]}" cy="${p[1]}" r="${R}" fill="none" stroke="#000" stroke-width=".3"/>`;
    if(fill&&fill[g.id]&&fill[g.id].includes(k)){const j=fillOpt.jitter?((Math.sin(p[0]*7+p[1]*3+k)*0.35)):0,j2=fillOpt.jitter?((Math.cos(p[0]*5+p[1]*11)*0.3)):0,op=fillOpt.light?0.55:0.95;
      s+=`<circle cx="${p[0]+j}" cy="${p[1]+j2}" r="${R-0.25}" fill="${fillOpt.pencil?'#444':'#111'}" fill-opacity="${op}"/>`}
  })});
  return s;
}

/* ===================== HÌNH HỌC ===================== */
function solveH(src,dst){ // src,dst: 4 điểm [x,y]; trả về 8 hệ số h0..h7
  const A=[],b=[];
  for(let i=0;i<4;i++){const[x,y]=src[i],[u,v]=dst[i];
    A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}
  const n=8;for(let i=0;i<n;i++){A[i].push(b[i])}
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;
    if(Math.abs(A[p][c])<1e-12)return null;[A[c],A[p]]=[A[p],A[c]];
    for(let r=0;r<n;r++){if(r===c)continue;const f=A[r][c]/A[c][c];for(let k=c;k<=n;k++)A[r][k]-=f*A[c][k]}}
  return A.map((row,i)=>row[n]/row[i]);
}
const mapH=(h,X,Y)=>{const w=h[6]*X+h[7]*Y+1;return[(h[0]*X+h[1]*Y+h[2])/w,(h[3]*X+h[4]*Y+h[5])/w]};
function bil(g,w,h,x,y){ // nội suy song tuyến
  if(x<0||y<0||x>=w-1||y>=h-1)return -1;const x0=x|0,y0=y|0,fx=x-x0,fy=y-y0,i=y0*w+x0;
  return g[i]*(1-fx)*(1-fy)+g[i+1]*fx*(1-fy)+g[i+w]*(1-fx)*fy+g[i+w+1]*fx*fy;
}

/* ===================== TÌM 4 Ô VUÔNG GÓC ===================== */
let _stk=null;
function findMarkers(g,w,h){
  const I=new Float64Array((w+1)*(h+1));
  for(let y=0;y<h;y++){let rs=0;for(let x=0;x<w;x++){rs+=g[y*w+x];I[(y+1)*(w+1)+x+1]=I[y*(w+1)+x+1]+rs}}
  const hw=Math.max(8,Math.round(Math.max(w,h)/30)),dark=new Uint8Array(w*h);
  for(let y=0;y<h;y++){const y0=Math.max(0,y-hw),y1=Math.min(h,y+hw+1);
    for(let x=0;x<w;x++){const x0=Math.max(0,x-hw),x1=Math.min(w,x+hw+1);
      const area=(x1-x0)*(y1-y0),mean=(I[y1*(w+1)+x1]-I[y0*(w+1)+x1]-I[y1*(w+1)+x0]+I[y0*(w+1)+x0])/area,v=g[y*w+x];
      if(mean>45&&v<mean*0.7)dark[y*w+x]=1}}
  if(!_stk||_stk.length<w*h)_stk=new Int32Array(w*h);
  const cand=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(dark[i]!==1)continue;
    let sp=0;_stk[sp++]=i;dark[i]=2;let minx=x,maxx=x,miny=y,maxy=y,a=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;
    while(sp){const p=_stk[--sp],py=(p/w)|0,px=p-py*w;a++;sx+=px;sy+=py;sxx+=px*px;syy+=py*py;sxy+=px*py;
      if(px<minx)minx=px;if(px>maxx)maxx=px;if(py<miny)miny=py;if(py>maxy)maxy=py;
      if(px>0&&dark[p-1]===1){dark[p-1]=2;_stk[sp++]=p-1}if(px<w-1&&dark[p+1]===1){dark[p+1]=2;_stk[sp++]=p+1}
      if(py>0&&dark[p-w]===1){dark[p-w]=2;_stk[sp++]=p-w}if(py<h-1&&dark[p+w]===1){dark[p+w]=2;_stk[sp++]=p+w}}
    const bw=maxx-minx+1,bh=maxy-miny+1;
    if(a<18||bw<4||bh<4||a>w*h/12)continue;
    if(minx<=1||miny<=1||maxx>=w-2||maxy>=h-2)continue;   // ô bị cắt ở mép ảnh
    const cx=sx/a,cy=sy/a,vxx=sxx/a-cx*cx,vyy=syy/a-cy*cy,vxy=sxy/a-cx*cy;
    const tr=vxx+vyy,det=vxx*vyy-vxy*vxy,disc=Math.sqrt(Math.max(0,tr*tr/4-det)),l1=tr/2+disc,l2=tr/2-disc;
    if(l2/l1<0.6)continue;                       // không đẳng hướng (thanh, chữ, đường)
    if(a/(bw*bh)<0.42)continue;                  // quá rỗng
    // đặc: diện tích so với phương sai (hình vuông/tròn đặc ~ a/12)
    if(Math.abs(Math.sqrt(12*(l1+l2)/2)-Math.sqrt(a))>0.28*Math.sqrt(a))continue;
    cand.push({a,cx:cx+0.5,cy:cy+0.5,s:Math.sqrt(a)});}
  cand.sort((p,q)=>q.a-p.a);const top=cand.slice(0,9);
  let best=null,bs=0;
  for(let i=0;i<top.length;i++)for(let j=i+1;j<top.length;j++)for(let k=j+1;k<top.length;k++)for(let l=k+1;l<top.length;l++){
    const c=[top[i],top[j],top[k],top[l]],amax=Math.max(...c.map(o=>o.a)),amin=Math.min(...c.map(o=>o.a));
    if(amax/amin>2.1)continue;
    const mx=(c[0].cx+c[1].cx+c[2].cx+c[3].cx)/4,my=(c[0].cy+c[1].cy+c[2].cy+c[3].cy)/4;
    const o=c.slice().sort((p,q)=>Math.atan2(p.cy-my,p.cx-mx)-Math.atan2(q.cy-my,q.cx-mx));
    let cr=0,ok=true;for(let t=0;t<4;t++){const A=o[t],B=o[(t+1)%4],C=o[(t+2)%4],z=(B.cx-A.cx)*(C.cy-B.cy)-(B.cy-A.cy)*(C.cx-B.cx);if(z<=0)ok=false}
    if(!ok)continue;
    let ar=0;for(let t=0;t<4;t++){const A=o[t],B=o[(t+1)%4];ar+=A.cx*B.cy-B.cx*A.cy}ar=Math.abs(ar)/2;
    const e=[0,1,2,3].map(t=>Math.hypot(o[(t+1)%4].cx-o[t].cx,o[(t+1)%4].cy-o[t].cy)),asp=(e[0]+e[2])/(e[1]+e[3]);
    if(asp<0.4||asp>2.5)continue;
    if(ar>bs){bs=ar;best=o}}
  if(!best||bs<w*h*0.05)return null;
  return best;
}
// tinh chỉnh tâm ô vuông trên ảnh làm việc (độ phân giải cao)
function refineCenter(G,w,h,cx,cy,half){
  const x0=Math.max(0,Math.round(cx-half)),x1=Math.min(w-1,Math.round(cx+half)),y0=Math.max(0,Math.round(cy-half)),y1=Math.min(h-1,Math.round(cy+half));
  if(x1-x0<4||y1-y0<4)return[cx,cy];
  const hist=new Int32Array(256);let n=0;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){hist[G[y*w+x]]++;n++}
  const pct=q=>{let a=0;for(let i=0;i<256;i++){a+=hist[i];if(a>=n*q)return i}return 255};
  const thr=(pct(0.03)+pct(0.97))/2;let sx=0,sy=0,c=0;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(G[y*w+x]<thr){sx+=x;sy+=y;c++}}
  return c>10?[sx/c+0.5,sy/c+0.5]:[cx,cy];
}

/* ===================== ĐỌC Ô TÔ ===================== */
function decodePick(fs,thr){
  let b=0;fs.forEach((v,i)=>{if(v>fs[b])b=i});
  const f1=fs[b];let f2=0;fs.forEach((v,i)=>{if(i!==b&&v>f2)f2=v});
  if(f1<thr)return{i:-1,warn:f1>thr*0.7,f1};
  if(f2>=thr*0.85&&f2>0.55*f1)return{i:-2,warn:true,f1};
  return{i:b,warn:f1<thr*1.35||f2>thr*0.55,f1};
}
// đọc toàn phiếu: trả về {res, fills, H}
function readSheet(G,w,h,H,L,thr){
  const inn=L.inner||INNER,offs=[];for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const dx=j*inn/2,dy=i*inn/2;if(Math.hypot(dx,dy)<=inn+0.01)offs.push([dx,dy])}
  const all=L.all,m=new Float64Array(all.length),bad=new Uint8Array(all.length);
  all.forEach((a,i)=>{let s=0,c=0;for(const o of offs){const p=mapH(H,a.x+o[0],a.y+o[1]),v=bil(G,w,h,p[0],p[1]);if(v>=0){s+=v;c++}}
    if(c<offs.length*0.8)bad[i]=1;m[i]=c?s/c:255});
  const f=new Float64Array(all.length);
  all.forEach((a,i)=>{const arr=[];for(const j of a.nb)if(!bad[j])arr.push(m[j]);arr.sort((p,q)=>p-q);
    const P=arr.length?arr[Math.floor(arr.length*0.72)]:255;f[i]=Math.max(0,1-m[i]/Math.max(P,30))});
  const noise=(()=>{const s=Array.from(f).sort((p,q)=>p-q);return s[Math.floor(s.length*0.5)]})();
  // ngưỡng thích nghi: tách 2 cụm (ô trống / ô được tô) để vẫn đọc được nét bút chì nhạt
  let tEff=thr;{const v=Array.from(f).filter((x,i)=>!bad[i]);let lo=0.01,hi=Math.max(...v);
    if(hi>0.1){for(let it=0;it<12;it++){const mid=(lo+hi)/2;let sl=0,nl=0,sh=0,nh=0;v.forEach(x=>{if(x<mid){sl+=x;nl++}else{sh+=x;nh++}});if(!nl||!nh)break;lo=sl/nl;hi=sh/nh}
      const share=v.filter(x=>x>=(lo+hi)/2).length/v.length;
      if(hi-lo>0.08&&share>0.01&&share<0.6)tEff=Math.min(thr,Math.max(0.1,(lo+hi)/2))}}
  const idx={};all.forEach((a,i)=>{(idx[a.g.id]||(idx[a.g.id]=[]))[a.k]=i});
  const pk={},flags=[];
  L.groups.forEach(g=>{const fs=g.pts.map((_,k)=>f[idx[g.id][k]]);const d=decodePick(fs,tEff);d.fs=fs;pk[g.id]=d;
    if(d.warn||d.i===-2)flags.push({id:g.id,t:d.i===-2?'multi':'warn'})});
  const res={sbd:'',md:'',tn:[],ds:[],tln:[]};
  for(let c=0;c<6;c++){const d=pk['sbd'+c];res.sbd+=d.i>=0?d.i:'?'}
  for(let c=0;c<3;c++){const d=pk['md'+c];res.md+=d.i>=0?d.i:'?'}
  for(let q=1;q<=L.nTN;q++){const d=pk['tn'+q];res.tn.push(d.i>=0?'ABCD'[d.i]:d.i===-2?'*':null)}
  for(let q=1;q<=L.nDS;q++){const a=[];for(let i=0;i<4;i++){const d=pk['ds'+q+'_'+i];a.push(d.i>=0?['Đ','S'][d.i]:d.i===-2?'*':null)}res.ds.push(a)}
  for(let q=1;q<=L.nTLN;q++){let s='',bad2=false;for(let c=0;c<4;c++){const g=L.groups.find(x=>x.id==='tl'+q+'_'+c),d=pk['tl'+q+'_'+c];
      if(d.i>=0)s+=g.labels[d.i];else if(d.i===-2)bad2=true}
    res.tln.push(bad2?'*':s)}
  const rawBlank=a=>a===null;
  return{res,flags,noise,pk,tEff};
}

/* ===================== PHÂN TÍCH 1 KHUNG HÌNH ===================== */
// srcCanvas: canvas/video đã vẽ; cfg.thr
const _small=document.createElement('canvas'),_sctx=_small.getContext('2d',{willReadFrequently:true});
const _work=document.createElement('canvas'),_wctx=_work.getContext('2d',{willReadFrequently:true});
function toGray(d,n){const g=new Uint8Array(n);for(let i=0,j=0;i<n;i++,j+=4)g[i]=(d[j]*77+d[j+1]*150+d[j+2]*29)>>8;return g}
// src: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | ImageBitmap
function analyze(src,sw,sh,L,thr,opts){
  opts=opts||{};
  const long=Math.max(sw,sh),ks=Math.min(1,720/long);
  _small.width=Math.round(sw*ks);_small.height=Math.round(sh*ks);_sctx.drawImage(src,0,0,_small.width,_small.height);
  const sd=_sctx.getImageData(0,0,_small.width,_small.height),g=toGray(sd.data,_small.width*_small.height);
  const q=findMarkers(g,_small.width,_small.height);
  if(!q)return{ok:false,why:'Chưa thấy đủ 4 ô vuông đen ở góc phiếu'};
  // ảnh làm việc
  const kw=Math.min(1,(opts.workLong||1400)/long);_work.width=Math.round(sw*kw);_work.height=Math.round(sh*kw);_wctx.drawImage(src,0,0,_work.width,_work.height);
  const W=_work.width,Hh=_work.height,G=toGray(_wctx.getImageData(0,0,W,Hh).data,W*Hh);
  const f=W/_small.width;let pts=q.map(o=>[o.cx*f,o.cy*f]);
  const msz=Math.sqrt(q.reduce((s,o)=>s+o.a,0)/4)*f;
  pts=pts.map(p=>refineCenter(G,W,Hh,p[0],p[1],msz*1.15));
  let best=null;
  for(let r=0;r<4;r++){
    const dst=[0,1,2,3].map(k=>pts[(k+r)%4]),H=solveH(L.M,dst);if(!H)continue;
    const mean=(x,y,w2,h2)=>{let s=0,c=0;for(let i=0;i<=4;i++)for(let j=0;j<=2;j++){const p=mapH(H,x+w2*i/4,y+h2*(0.15+0.7*j/2)),v=bil(G,W,Hh,p[0],p[1]);if(v>=0){s+=v;c++}}return c?s/c:255};
    const sc=mean(L.ref[0],L.ref[1],L.ref[2],L.ref[3])-mean(L.bar[0],L.bar[1],L.bar[2],L.bar[3]);
    if(!best||sc>best.sc)best={sc,H,r,dst}
  }
  if(!best||best.sc<35)return{ok:false,why:'Không nhận ra chiều phiếu (thanh đen nhỏ cạnh góc trên trái)',quad:pts};
  // kiểm tra lại 4 ô góc: tâm phải đen, vành quanh phải trắng (loại trường hợp nhận nhầm vật khác)
  for(const mpt of L.M){let c=0,nc=0,rg=0,nr=0;const h2=L.mk*0.3;
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const p=mapH(best.H,mpt[0]+h2*i/2,mpt[1]+h2*j/2),v2=bil(G,W,Hh,p[0],p[1]);if(v2<0)return{ok:false,why:'Phiếu bị cắt mất góc — lùi máy ra một chút',quad:pts};c+=v2;nc++}
    for(let k=0;k<12;k++){const an=k*Math.PI/6,p=mapH(best.H,mpt[0]+Math.cos(an)*L.mk*0.95,mpt[1]+Math.sin(an)*L.mk*0.95),v2=bil(G,W,Hh,p[0],p[1]);if(v2>=0){rg+=v2;nr++}}
    if(!nr||rg/nr-c/nc<60)return{ok:false,why:'Chưa khớp 4 ô vuông góc — giữ phiếu phẳng, đủ sáng',quad:pts}}
  const rd=readSheet(G,W,Hh,best.H,L,thr);
  return{ok:true,H:best.H,W,Hh,G,quad:best.dst,res:rd.res,flags:rd.flags,noise:rd.noise,pk:rd.pk,tEff:rd.tEff,scale:W/sw};
}
// ảnh phẳng của phiếu (để lưu minh chứng)
function rectified(G,W,Hh,H,L,ow){
  ow=ow||(L.W>L.H?640:420);const oh=Math.round(ow*L.H/L.W),c=document.createElement('canvas');c.width=ow;c.height=oh;const x=c.getContext('2d'),im=x.createImageData(ow,oh);
  for(let v=0;v<oh;v++)for(let u=0;u<ow;u++){const p=mapH(H,u*L.W/ow,v*L.H/oh),val=bil(G,W,Hh,p[0],p[1]),o=(v*ow+u)*4;const g=val<0?255:val;im.data[o]=im.data[o+1]=im.data[o+2]=g;im.data[o+3]=255}
  x.putImageData(im,0,0);return c.toDataURL('image/jpeg',0.6);
}

/* ===================== ĐÁP ÁN & CHẤM ===================== */
const DS_PTS=[0,0.1,0.25,0.5,1];
function normNum(s){return String(s==null?'':s).trim().replace(/\./g,',').replace(/^\+/,'')}
function tlnEq(a,b){a=normNum(a);b=normNum(b);if(!a||!b)return false;if(a===b)return true;
  const x=parseFloat(a.replace(',','.')),y=parseFloat(b.replace(',','.'));return!isNaN(x)&&!isNaN(y)&&Math.abs(x-y)<1e-9}
function defaultPts(L){if(L.pts)return{tn:L.pts.tn,tln:L.pts.tln,ds:L.pts.ds.slice()};return L.nDS?{tn:0.25,tln:0.5,ds:DS_PTS.slice()}:{tn:Math.round(1000/L.nTN)/100,tln:0,ds:DS_PTS.slice()}}
function scoreScan(res,key,L,pts){
  if(!key)return null;pts=pts||defaultPts(L);
  const nT=pts.nTN==null?L.nTN:Math.min(L.nTN,pts.nTN),nD=pts.nDS==null?L.nDS:Math.min(L.nDS,pts.nDS),nL=pts.nTLN==null?L.nTLN:Math.min(L.nTLN,pts.nTLN);
  const fr=key.free||{},fTN=new Set(fr.tn||[]),fDS=new Set(fr.ds||[]),fTL=new Set(fr.tln||[]);
  const d={tn:[],ds:[],tln:[]};let sTN=0,sDS=0,sTL=0;
  for(let i=0;i<L.nTN;i++){if(i>=nT){d.tn.push(null);continue}const ok=fTN.has(i)||(!!key.tn[i]&&res.tn[i]===key.tn[i]);d.tn.push(ok);if(ok)sTN+=pts.tn}
  for(let q=0;q<L.nDS;q++){if(q>=nD){d.ds.push([null,null,null,null]);continue}const k=key.ds[q]||[];let c=0;const row=[];for(let i=0;i<4;i++){const ok=fDS.has(q+'_'+i)||(!!k[i]&&res.ds[q][i]===k[i]);row.push(ok);if(ok)c++}d.ds.push(row);sDS+=pts.ds[c]}
  for(let q=0;q<L.nTLN;q++){if(q>=nL){d.tln.push(null);continue}const ok=fTL.has(q)||tlnEq(res.tln[q],(key.tln||[])[q]);d.tln.push(ok);if(ok)sTL+=pts.tln}
  return{sTN,sDS,sTL,total:sTN+sDS+sTL,d,nTN:d.tn.filter(Boolean).length,nTLN:d.tln.filter(Boolean).length};
}
function parseKeyText(text,L){
  const out={tn:[],ds:[],tln:[]};text=String(text||'');
  if(/PH[ẦA]N\s*(I{1,3})\b/i.test(text)){
    let part=0;
    for(const line of text.split(/\r?\n/)){
      const pm=/PH[ẦA]N\s*(III|II|I)\b/i.exec(line);if(pm){part=pm[1].length;continue}
      const km=/<\s*Key\s*=\s*([^>]*)>/i.exec(line),am=/^\s*[*_]*\s*Đáp án\s*[*_]*\s*:\s*[*_]*\s*(.+?)\s*$/i.exec(line);
      if(part===1&&am){const c=(/[A-D]/i.exec(am[1])||[])[0];if(c)out.tn.push(c.toUpperCase())}
      else if(part===2&&am){const set=new Set((am[1].match(/[a-d]/gi)||[]).map(x=>x.toLowerCase()));out.ds.push(['a','b','c','d'].map(x=>set.has(x)?'Đ':'S'))}
      else if(part===3&&km)out.tln.push(km[1].trim());
      else if(part===3&&am&&!/key/i.test(am[1]))out.tln.push(am[1].trim().replace(/[*_]/g,''));
    }
  }else{
    for(const line of text.split(/\r?\n/)){
      const m=/^\s*(I{1,3}|[123])\s*[:：.\-]\s*(.+)$/i.exec(line);if(!m)continue;const p=m[1].length&&/^[123]$/.test(m[1])?+m[1]:m[1].length;
      if(p===1)out.tn=(m[2].toUpperCase().match(/[A-D]/g)||[]);
      else if(p===2)out.ds=m[2].toUpperCase().split(/[\s,;|]+/).filter(Boolean).map(t=>[...t.replace(/D/g,'Đ')].filter(c=>c==='Đ'||c==='S')).filter(a=>a.length);
      else if(p===3)out.tln=m[2].split(/[;|]+/).map(x=>x.trim()).filter(x=>x!=='');
    }
  }
  return out;
}
const keyToText=k=>`I: ${k.tn.join('')}\nII: ${k.ds.map(a=>a.join('')).join(' ')}\nIII: ${k.tln.join('; ')}`;

/* ===================== PHIẾU MẪU ĐÃ TÔ (để thử quét) ===================== */
function demoData(L){
  const key={tn:[...'ABCDABCDABCD'].slice(0,L.nTN),ds:[['Đ','S','Đ','S'],['S','S','Đ','Đ'],['Đ','Đ','Đ','Đ'],['S','Đ','S','Đ'],['Đ','S','S','Đ'],['S','S','S','Đ']].slice(0,L.nDS),tln:['5','-2,5','12','0,75','3','8'].slice(0,L.nTLN)};
  if(L.nTN>12){key.tn=[];for(let i=0;i<L.nTN;i++)key.tn.push('ABCD'[(i*7+i%3)%4])}
  const st={sbd:'000012',md:'101',tn:key.tn.slice(),ds:key.ds.map(a=>a.slice()),tln:key.tln.slice()};
  st.tn[L.nTN-1]=st.tn[L.nTN-1]==='A'?'B':'A';st.tn[5]=null;
  if(L.nDS){st.ds[1][3]=st.ds[1][3]==='Đ'?'S':'Đ';st.ds[2][0]=st.ds[2][0]==='Đ'?'S':'Đ';st.ds[2][1]=st.ds[2][1]==='Đ'?'S':'Đ';
    st.ds[3][1]=st.ds[3][1]==='Đ'?'S':'Đ';st.ds[3][2]=st.ds[3][2]==='Đ'?'S':'Đ';st.ds[3][3]=st.ds[3][3]==='Đ'?'S':'Đ';
    st.tln[3]='0,7';st.tln[5]=''}
  return{key,st};
}
function fillFromAnswers(L,st){
  const f={};
  [...st.sbd].forEach((c,i)=>f['sbd'+i]=[+c]);[...st.md].forEach((c,i)=>f['md'+i]=[+c]);
  st.tn.forEach((a,i)=>{if(a)f['tn'+(i+1)]=['ABCD'.indexOf(a)]});
  st.ds.forEach((r,q)=>r.forEach((a,i)=>{if(a)f['ds'+(q+1)+'_'+i]=[a==='Đ'?0:1]}));
  st.tln.forEach((s,q)=>{[...s].forEach((ch,c)=>{const g=L.groups.find(x=>x.id==='tl'+(q+1)+'_'+c);const k=g.labels.indexOf(ch==='.'?',':ch);if(k>=0)f[g.id]=[k]})});
  return f;
}
