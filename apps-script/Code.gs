/* Chấm phiếu VTL — nhận điểm từ app, ghi vào Google Sheet, sao lưu lên Drive và phục vụ trang tra cứu điểm.
   Mỗi LỚP một trang tính: SBD | Họ tên | TB | các cột điểm của từng bài kiểm tra.
   Trang "Chi tiết": toàn bộ điểm từng bài (điểm TN / ĐS / TLN). Gửi lại nhiều lần chỉ cập nhật, không nhân đôi. */
var TOKEN = '';   // (tùy chọn) đặt mật khẩu, ví dụ 'abc123' rồi nhập đúng mật khẩu đó trong app

function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
var VER = 2;
function doGet(e){
  var q=(e&&e.parameter)||{};
  if(q.m) return lookup_(q.m);
  return out_({ok:true,ver:VER,msg:'Chấm phiếu VTL: script sẵn sàng'});
}
function doPost(e){
  var lock=null;
  try{
    var p=JSON.parse(e.postData.contents);
    if(TOKEN && p.token!==TOKEN) return out_({ok:false,error:'Sai mật khẩu'});
    // ----- sao lưu Drive (không cần Google Sheet) -----
    if(p.action==='bk_put'){ bkPut_(p); return out_({ok:true}); }
    if(p.action==='bk_img'){ bkSave_(safeName_(p.name),p.data); return out_({ok:true}); }
    if(p.action==='bk_list') return out_({ok:true,files:bkList_()});
    if(p.action==='bk_get') return out_(bkGet_(p.name));
    var ss=p.sheetId?SpreadsheetApp.openById(p.sheetId):SpreadsheetApp.getActive();
    if(!ss) return out_({ok:false,error:'Chưa có Google Sheet: dán link Google Sheet vào app'});
    if(p.action==='ping') return out_({ok:true,name:ss.getName(),ver:VER});
    lock=LockService.getScriptLock(); lock.waitLock(25000);
    if(p.action==='lookup_put'){ var n=lookupPut_(ss,p.rows||[]); return out_({ok:true,students:n}); }
    var n2=saveExam_(ss,p.exam,p.rows||[]);
    return out_({ok:true,classes:n2,rows:(p.rows||[]).length,sheet:ss.getName()});
  }catch(err){return out_({ok:false,error:String(err&&err.message||err)});}
  finally{ if(lock) lock.releaseLock(); }
}
/* ===== Sao lưu lên Google Drive: thư mục "Chấm phiếu VTL - Sao lưu" ===== */
var BK_FOLDER='Chấm phiếu VTL - Sao lưu', BK_KEEP_DAYS=14;
function safeName_(n){n=String(n||'');if(!/^[A-Za-z0-9_\-]{1,80}$/.test(n))throw new Error('Tên file không hợp lệ');return n;}
function bkFolder_(){var it=DriveApp.getFoldersByName(BK_FOLDER);return it.hasNext()?it.next():DriveApp.createFolder(BK_FOLDER);}
function bkSave_(name,data){
  var f=bkFolder_(),fn=name+'.json',it=f.getFilesByName(fn);
  if(it.hasNext()){var file=it.next();file.setContent(data);return file;}
  return f.createFile(fn,data,'application/json');
}
function bkPut_(p){
  var name=safeName_(p.name);
  bkSave_(name,p.data);
  if(name==='du-lieu'&&p.day&&/^\d{4}-\d\d-\d\d$/.test(p.day)){
    bkSave_('du-lieu-'+p.day,p.data);
    // giữ BK_KEEP_DAYS bản theo ngày gần nhất
    var it=bkFolder_().getFiles(),names=[],map={};
    while(it.hasNext()){var f=it.next(),n=f.getName();if(/^du-lieu-\d{4}-\d\d-\d\d\.json$/.test(n)){names.push(n);map[n]=f;}}
    names.sort().reverse();
    for(var i=BK_KEEP_DAYS;i<names.length;i++)map[names[i]].setTrashed(true);
  }
}
function bkList_(){
  var it=bkFolder_().getFiles(),out=[];
  while(it.hasNext()){var f=it.next();out.push({name:f.getName(),updated:f.getLastUpdated().getTime(),size:f.getSize()});}
  return out;
}
function bkGet_(name){
  var fn=safeName_(name)+'.json',it=bkFolder_().getFilesByName(fn);
  if(!it.hasNext())return {ok:false,error:'Không thấy file '+fn};
  return {ok:true,data:it.next().getBlob().getDataAsString()};
}
/* ===== Tra cứu điểm cho học sinh: mỗi học sinh một mã riêng, trang tính ẩn "TraCuu" ===== */
function lookupPut_(ss,rows){
  var sh=ss.getSheetByName('TraCuu')||ss.insertSheet('TraCuu');
  sh.clear();
  var now=new Date().getTime(),data=[['Mã','Dữ liệu','Cập nhật']];
  rows.forEach(function(r){if(r&&r.c)data.push([String(r.c).toUpperCase(),JSON.stringify(r),now]);});
  if(sh.getMaxRows()<data.length)sh.insertRowsAfter(sh.getMaxRows(),data.length-sh.getMaxRows());
  sh.getRange(1,1,data.length,3).setNumberFormat('@').setValues(data);
  sh.setFrozenRows(1);
  try{sh.hideSheet();}catch(e){}
  PropertiesService.getScriptProperties().setProperty('LK_SHEET',ss.getId());
  return data.length-1;
}
function lookup_(code){
  code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length<6)return out_({ok:false,error:'Mã không hợp lệ'});
  var id=PropertiesService.getScriptProperties().getProperty('LK_SHEET');
  var ss=id?SpreadsheetApp.openById(id):SpreadsheetApp.getActive();
  var sh=ss&&ss.getSheetByName('TraCuu');
  if(!sh)return out_({ok:false,error:'Thầy cô chưa đăng điểm lên mạng'});
  var rng=sh.getRange(2,1,Math.max(sh.getLastRow()-1,1),3).getValues();
  for(var i=0;i<rng.length;i++){
    if(String(rng[i][0])===code){
      var d;try{d=JSON.parse(rng[i][1]);}catch(e){return out_({ok:false,error:'Dữ liệu lỗi'});}
      return out_({ok:true,d:d,u:Number(rng[i][2])||0});
    }
  }
  return out_({ok:false,error:'Không tìm thấy mã này. Kiểm tra lại cách gõ (không có chữ O, I, số 0, 1).'});
}
function tabName_(s){s=String(s||'').replace(/[\[\]\*\?\:\/\\]/g,' ').trim();return (s||'Chưa rõ lớp').slice(0,90);}
function sbdKey_(v){var n=parseInt(String(v).replace(/\D/g,''),10);return isNaN(n)?String(v):String(n);}
function sheet_(ss,name){return ss.getSheetByName(name)||ss.insertSheet(name);}
function saveExam_(ss,ex,rows){
  var header=ex.name+(ex.date?' ('+ex.date+')':'');
  var byClass={}; rows.forEach(function(r){var c=tabName_(r.lop||ex.lop);(byClass[c]=byClass[c]||[]).push(r);});
  if(!rows.length&&ex.lop){byClass[tabName_(ex.lop)]=[];}
  // lớp đã có cột bài này nhưng nay không còn phiếu nào -> xóa điểm
  ss.getSheets().forEach(function(sh){var nm=sh.getName();if(nm==='Chi tiết'||byClass[nm])return;
    var lc=sh.getLastColumn();if(lc<4)return;var notes=sh.getRange(1,1,1,lc).getNotes()[0];if(notes.indexOf(ex.id)>=0)byClass[nm]=[];});
  var classes=Object.keys(byClass);
  classes.forEach(function(cn){
    var sh=sheet_(ss,cn),list=byClass[cn];
    if(sh.getLastRow()===0||sh.getLastColumn()<3){sh.getRange(1,1,1,3).setValues([['SBD','Họ tên','TB']]);}
    var lc=sh.getLastColumn(),notes=sh.getRange(1,1,1,lc).getNotes()[0],col=notes.indexOf(ex.id);
    if(col<0){col=Math.max(lc,3);sh.getRange(1,col+1).setNote(ex.id);}
    var lr=Math.max(sh.getLastRow(),1),ncol=Math.max(sh.getLastColumn(),col+1);
    var data=sh.getRange(1,1,lr,ncol).getValues();
    data[0][col]=header;
    var idx={};for(var i=1;i<data.length;i++){if(String(data[i][0])!=='')idx[sbdKey_(data[i][0])]=i;}
    var seen={};
    list.forEach(function(r){var k=sbdKey_(r.sbd),i=idx[k];
      if(i==null){var row=[];for(var c=0;c<ncol;c++)row.push('');row[0]=k.length<6&&/^\d+$/.test(k)?k:String(r.sbd);row[1]=r.name||'';data.push(row);i=data.length-1;idx[k]=i;}
      if(r.name)data[i][1]=r.name;
      data[i][col]=(r.score===null||r.score===undefined||r.score==='')?'':Number(r.score);seen[k]=1;});
    for(var k2 in idx){if(!seen[k2])data[idx[k2]][col]='';}
    var head=data.shift();
    data.sort(function(a,b){var x=parseInt(a[0],10),y=parseInt(b[0],10);return (isNaN(x)?1e12:x)-(isNaN(y)?1e12:y);});
    data=data.filter(function(row,i){return String(row[0])!==''||row.slice(3).some(function(v){return v!==''});});
    data.forEach(function(row,i){var r=i+2,L=colLetter_(ncol);row[2]='=IFERROR(ROUND(AVERAGE(D'+r+':'+r+'),2),"")';});
    data.unshift(head);
    if(sh.getMaxRows&&sh.getMaxRows()<data.length)sh.insertRowsAfter(sh.getMaxRows(),data.length-sh.getMaxRows());
    sh.getRange(1,1,data.length,ncol).setValues(data);
    var old=sh.getLastRow();if(old>data.length)sh.getRange(data.length+1,1,old-data.length,ncol).clearContent();
    sh.getRange(1,1,1,ncol).setFontWeight('bold');sh.setFrozenRows(1);
  });
  detail_(ss,ex,rows,header);
  return classes.length;
}
function colLetter_(n){var s='';while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}
function detail_(ss,ex,rows,header){
  var sh=sheet_(ss,'Chi tiết'),H=['Mã bài','Bài','Ngày','Lớp','SBD','Họ tên','Mã đề','Điểm TN','Điểm ĐS','Điểm TLN','Tổng','Ô cần xem','Cập nhật'];
  var keep=[];if(sh.getLastRow()>1){sh.getRange(2,1,sh.getLastRow()-1,H.length).getValues().forEach(function(r){if(r[0]!==ex.id)keep.push(r);});}
  var now=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'dd/MM/yyyy HH:mm');
  rows.forEach(function(r){if(r.absent)return;keep.push([ex.id,ex.name,ex.date||'',r.lop||ex.lop||'',r.sbd,r.name||'',r.md,r.sTN===null?'':r.sTN,r.sDS===null?'':r.sDS,r.sTL===null?'':r.sTL,r.score===null?'':r.score,r.flags||0,now]);});
  var old=sh.getLastRow();if(old>0)sh.getRange(1,1,old,H.length).clearContent();
  var all=[H].concat(keep);sh.getRange(1,1,all.length,H.length).setValues(all);sh.getRange(1,1,1,H.length).setFontWeight('bold');sh.setFrozenRows(1);
}
