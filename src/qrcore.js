/* ===================== QR NHÓM: TÌM NHIỀU THẺ + HƯỚNG XOAY =====================
   Mỗi nhóm có một thẻ QR (nội dung NHOM01…NHOM24). Học sinh xoay thẻ sao cho chữ cái
   đáp án nằm ở cạnh TRÊN. App tìm 3 ô vuông định vị của từng mã (jsQR chỉ đọc được 1 mã
   mỗi lần nên phần tìm nhiều mã do app tự làm), cắt riêng từng mã để đọc số nhóm,
   còn hướng xoay tính từ vị trí 3 ô định vị. */
const QRX={PREF:'NHOM',LET:['A','D','C','B'],DIM:14};   // LET[k]: thẻ xoay k góc 90° theo chiều kim đồng hồ → chữ ở cạnh trên
const qrText=g=>QRX.PREF+String(g).padStart(2,'0');
const qrParse=t=>{const m=/^NHOM(\d{1,3})$/.exec(String(t||'').trim());return m?+m[1]:0};

/* 1. Nhị phân hoá theo ngưỡng cục bộ (ảnh tích phân) → bin[i]=1 là điểm tối */
function qrBinarize(px,w,h){
  const g=new Uint8Array(w*h),W=w+1,I=new Int32Array(W*(h+1));
  for(let y=0,p=0;y<h;y++){let rs=0;for(let x=0;x<w;x++,p++){const q=p*4,v=(px[q]*77+px[q+1]*151+px[q+2]*28)>>8;g[p]=v;rs+=v;I[(y+1)*W+x+1]=I[y*W+x+1]+rs}}
  const r=Math.max(12,Math.round(w/14)),bin=new Uint8Array(w*h);
  for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h,y+r+1);
    for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w,x+r+1),n=(x1-x0)*(y1-y0);
      const s=I[y1*W+x1]-I[y0*W+x1]-I[y1*W+x0]+I[y0*W+x0],v=g[y*w+x];
      if(v*n<s*0.8&&v<185)bin[y*w+x]=1}}
  return bin;
}
/* 2. Tìm tâm các ô định vị (tỉ lệ 1:1:3:1:1) */
function qrVCheck(bin,w,h,cx,cy,maxLen){
  const c=[0,0,0,0,0];let y=cy;
  while(y>=0&&bin[y*w+cx]){c[2]++;y--}if(y<0)return null;
  while(y>=0&&!bin[y*w+cx]&&c[1]<maxLen){c[1]++;y--}if(y<0||c[1]>=maxLen)return null;
  while(y>=0&&bin[y*w+cx]&&c[0]<maxLen){c[0]++;y--}if(c[0]>=maxLen)return null;
  y=cy+1;
  while(y<h&&bin[y*w+cx]){c[2]++;y++}if(y>=h)return null;
  while(y<h&&!bin[y*w+cx]&&c[3]<maxLen){c[3]++;y++}if(y>=h||c[3]>=maxLen)return null;
  while(y<h&&bin[y*w+cx]&&c[4]<maxLen){c[4]++;y++}if(c[4]>=maxLen)return null;
  const tot=c[0]+c[1]+c[2]+c[3]+c[4],ms=tot/7;
  if(Math.abs(c[0]-ms)>ms*.8||Math.abs(c[1]-ms)>ms*.8||Math.abs(c[3]-ms)>ms*.8||Math.abs(c[4]-ms)>ms*.8||Math.abs(c[2]-3*ms)>ms*1.3)return null;
  return{tot,cy:y-c[4]-c[3]-c[2]/2};
}
function qrFinders(bin,w,h,step){
  const F=[];
  for(let y=0;y<h;y+=step){
    const L=[],C=[];let x=0,cur=bin[y*w]|0,st=0;
    for(x=1;x<=w;x++){
      const v=x<w?bin[y*w+x]:cur^1;
      if(v!==cur){L.push(x-st);C.push(cur);st=x;cur=v;
        const n=L.length;
        if(n>=5&&C[n-1]===1){
          const a=L[n-5],b=L[n-4],c=L[n-3],d=L[n-2],e=L[n-1],tot=a+b+c+d+e;
          if(tot>=9){const ms=tot/7;
            if(Math.abs(a-ms)<=ms*.75&&Math.abs(b-ms)<=ms*.75&&Math.abs(d-ms)<=ms*.75&&Math.abs(e-ms)<=ms*.75&&Math.abs(c-3*ms)<=ms*1.2){
              const cx=Math.round(x-e-d-c/2),vr=qrVCheck(bin,w,h,Math.min(w-1,Math.max(0,cx)),y,Math.ceil(tot));
              if(vr&&Math.abs(vr.tot-tot)<=tot*.45){
                const m=(tot+vr.tot)/14,fx=x-e-d-c/2,fy=vr.cy;
                let k=null;for(const f of F)if(Math.abs(f.x-fx)<m*2&&Math.abs(f.y-fy)<m*2){k=f;break}
                if(k){k.x=(k.x*k.n+fx)/(k.n+1);k.y=(k.y*k.n+fy)/(k.n+1);k.ms=(k.ms*k.n+m)/(k.n+1);k.n++}else F.push({x:fx,y:fy,ms:m,n:1})}}}}
      }
    }
  }
  return F.filter(f=>f.n>=2);
}
/* 3. Ghép 3 ô định vị thành một mã: tam giác vuông cân, cạnh = 14 ô con */
function qrGroup(F){
  const T=[];
  for(let i=0;i<F.length;i++){const C=F[i],nb=[];
    for(let j=0;j<F.length;j++){if(j===i)continue;const P=F[j],r=P.ms/C.ms;if(r<.62||r>1.6)continue;
      const ms=(P.ms+C.ms)/2,dx=P.x-C.x,dy=P.y-C.y,dist=Math.hypot(dx,dy);if(Math.abs(dist/ms-QRX.DIM)>4)continue;nb.push({j,dx,dy,dist})}
    for(let a=0;a<nb.length;a++)for(let b=a+1;b<nb.length;b++){const A=nb[a],B=nb[b];
      const cos=Math.abs(A.dx*B.dx+A.dy*B.dy)/(A.dist*B.dist),lr=Math.min(A.dist,B.dist)/Math.max(A.dist,B.dist);
      if(cos>.32||lr<.72)continue;
      const hyp=Math.hypot(A.dx-B.dx,A.dy-B.dy),hr=hyp/(Math.SQRT2*(A.dist+B.dist)/2);if(Math.abs(hr-1)>.2)continue;
      T.push({c:i,a:A.j,b:B.j,score:cos+(1-lr)+Math.abs(hr-1)})}}
  T.sort((p,q)=>p.score-q.score);
  const used=new Set(),out=[];
  for(const t of T){if(used.has(t.c)||used.has(t.a)||used.has(t.b))continue;used.add(t.c);used.add(t.a);used.add(t.b);
    const C=F[t.c];let A=F[t.a],B=F[t.b];
    if((A.x-C.x)*(B.y-C.y)-(A.y-C.y)*(B.x-C.x)<0){const s=A;A=B;B=s}   // A=ô trên-phải, B=ô dưới-trái của mã
    const ms=(C.ms+A.ms+B.ms)/3;
    out.push({C:{x:C.x,y:C.y},TR:{x:A.x,y:A.y},BL:{x:B.x,y:B.y},ms})}
  return out;
}
/* 4. Hướng xoay (độ, 0 = thẳng đứng, chiều kim đồng hồ) và thông tin hình học */
function qrGeom(t){
  const ux=t.TR.x-t.C.x,uy=t.TR.y-t.C.y,vx=t.BL.x-t.C.x,vy=t.BL.y-t.C.y,lu=Math.hypot(ux,uy),lv=Math.hypot(vx,vy);
  const sx=ux/lu+vy/lv,sy=uy/lu-vx/lv;                    // (BL-C) xoay −90° rồi cộng với (TR-C)
  let th=Math.atan2(sy,sx)*180/Math.PI;if(th<0)th+=360;
  const k=Math.round(th/90)%4;
  let d=Math.abs(th-k*90);if(d>180)d=360-d;
  const BR={x:t.TR.x+t.BL.x-t.C.x,y:t.TR.y+t.BL.y-t.C.y},m1={x:ux/QRX.DIM,y:uy/QRX.DIM},m2={x:vx/QRX.DIM,y:vy/QRX.DIM};
  const P=(a,b)=>({x:t.C.x+a*m1.x+b*m2.x,y:t.C.y+a*m1.y+b*m2.y});   // toạ độ theo ô con, gốc = tâm ô định vị trên-trái
  return{th,k,dev:d,m1,m2,P,quad:[P(-3.5,-3.5),P(17.5,-3.5),P(17.5,17.5),P(-3.5,17.5)],cx:(t.TR.x+t.BL.x)/2,cy:(t.TR.y+t.BL.y)/2,d:(lu+lv)/2,BR};
}
/* 5. Cắt riêng một mã (tô trắng mọi thứ ngoài mã) rồi nhờ jsQR đọc số nhóm */
function qrDecodeOne(px,w,h,t,gm){
  const q=[gm.P(-6.5,-6.5),gm.P(20.5,-6.5),gm.P(20.5,20.5),gm.P(-6.5,20.5)];
  const x0=Math.max(0,Math.floor(Math.min(...q.map(p=>p.x)))),x1=Math.min(w,Math.ceil(Math.max(...q.map(p=>p.x)))),
        y0=Math.max(0,Math.floor(Math.min(...q.map(p=>p.y)))),y1=Math.min(h,Math.ceil(Math.max(...q.map(p=>p.y))));
  const cw=x1-x0,ch=y1-y0;if(cw<12||ch<12)return 0;
  const out=new Uint8ClampedArray(cw*ch*4).fill(255);
  const a=gm.m1.x,b=gm.m2.x,c=gm.m1.y,d=gm.m2.y,det=a*d-b*c;if(Math.abs(det)<1e-6)return 0;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
    const dx=x0+x+.5-t.C.x,dy=y0+y+.5-t.C.y,u=(dx*d-dy*b)/det,v=(dy*a-dx*c)/det;
    if(u<-6.5||u>20.5||v<-6.5||v>20.5)continue;
    const s=((y0+y)*w+x0+x)*4,o=(y*cw+x)*4;out[o]=px[s];out[o+1]=px[s+1];out[o+2]=px[s+2]}
  const r=jsQR(out,cw,ch,{inversionAttempts:'dontInvert'});
  return r?qrParse(r.data):0;
}
/* 6. Toàn bộ một khung hình. trk: danh sách mã đã đọc ở khung trước (để khỏi giải mã lại).
      Trả về [{g,k,letter,dev,quad,cx,cy,d}] */
function qrScanFrame(px,w,h,trk,opt){
  opt=opt||{};const step=opt.step||(w>1500?2:1),maxDec=opt.maxDec==null?8:opt.maxDec,now=opt.now||0;
  const bin=qrBinarize(px,w,h),F=qrFinders(bin,w,h,step),G=qrGroup(F),res=[];let dec=0;
  trk=trk||[];
  for(const t of G){
    const gm=qrGeom(t);let g=0,tr=null,best=1e9;
    for(const o of trk){const dd=Math.hypot(o.cx-gm.cx,o.cy-gm.cy);if(dd<gm.d*.35&&dd<best&&Math.abs(o.d/gm.d-1)<.35){best=dd;tr=o}}
    if(tr&&now-tr.tDec<2500)g=tr.g;
    else if(dec<maxDec){dec++;g=qrDecodeOne(px,w,h,t,gm);if(!g&&tr)g=0}
    if(!g)continue;
    res.push({g,k:gm.k,letter:QRX.LET[gm.k],dev:gm.dev,th:gm.th,quad:gm.quad,cx:gm.cx,cy:gm.cy,d:gm.d,tDec:(tr&&now-tr.tDec<2500)?tr.tDec:now});
  }
  return{codes:res,nFinders:F.length,nGroups:G.length};
}
