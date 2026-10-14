/* Chấm phiếu OMR — nhận điểm từ app và ghi vào Google Sheet.
   Mỗi LỚP một trang tính: SBD | Họ tên | TB | các cột điểm của từng bài kiểm tra.
   Trang "Chi tiết": toàn bộ điểm từng bài (điểm TN / ĐS / TLN). Gửi lại nhiều lần chỉ cập nhật, không nhân đôi. */
var TOKEN = '';   // (tùy chọn) đặt mật khẩu, ví dụ 'abc123' rồi nhập đúng mật khẩu đó trong app

function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return out_({ok:true,msg:'Chấm phiếu OMR: script sẵn sàng'});}
function doPost(e){
  var lock=null;
  try{
    var p=JSON.parse(e.postData.contents);
    if(TOKEN && p.token!==TOKEN) return out_({ok:false,error:'Sai mật khẩu'});
    var ss=p.sheetId?SpreadsheetApp.openById(p.sheetId):SpreadsheetApp.getActive();
    if(!ss) return out_({ok:false,error:'Chưa có Google Sheet: dán link Google Sheet vào app'});
    if(p.action==='ping') return out_({ok:true,name:ss.getName()});
    lock=LockService.getScriptLock(); lock.waitLock(25000);
    var n=saveExam_(ss,p.exam,p.rows||[]);
    return out_({ok:true,classes:n,rows:(p.rows||[]).length,sheet:ss.getName()});
  }catch(err){return out_({ok:false,error:String(err&&err.message||err)});}
  finally{ if(lock) lock.releaseLock(); }
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
