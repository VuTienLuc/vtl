/* ===================== LỜI NHẮN ĐỘNG VIÊN (nhiều phong cách) ===================== */
/* Mức điểm (theo % tổng điểm): L <35, M 35–50, K 50–65, G 65–80, T ≥80. {Em}/{em}: "Em Lan"/"em Lan"; {hoten}: họ tên đầy đủ; {d}/{t}: điểm / tổng điểm */
const MSG_STYLES=[
{id:'am',name:'Ấm áp',ic:'🤗',
 open:{L:["{Em} ơi, bài lần này em được {d}/{t} điểm. Thầy biết chắc em cũng chưa hài lòng với kết quả này.","Thầy đã xem bài của {em}: {d}/{t} điểm. Con số này chưa phản ánh hết sức học thật của em đâu."],
  M:["{Em} được {d}/{t} điểm, chỉ còn cách mốc đạt một đoạn ngắn thôi.","Kết quả {d}/{t} điểm cho thấy {em} đã nắm được một phần kiến thức rồi, chỉ cần thêm một chút nữa."],
  K:["{Em} đạt {d}/{t} điểm — em đã qua mốc đạt, thầy ghi nhận điều đó.","Điểm {d}/{t} là một nền tốt để {em} bứt lên ở bài sau."],
  G:["{Em} được {d}/{t} điểm, kết quả tốt đấy!","Thầy rất vui với {d}/{t} điểm của {em}."],
  T:["Xuất sắc! {Em} đạt {d}/{t} điểm.","{d}/{t} điểm — kết quả rất đáng tự hào của {em}."]},
 core:{L:["Một bài kiểm tra chỉ là một lần dừng chân, không nói lên em là ai. Điều quan trọng là em chịu đi tiếp.","Ai cũng có lúc vấp, thầy tin em hoàn toàn có thể làm tốt hơn nếu mình bắt đầu lại từng bước nhỏ."],
  M:["Thầy thấy ở em có tiềm năng, chỉ cần ôn lại những chỗ còn hổng là kết quả sẽ khác ngay.","Em đã cố gắng, thầy nhìn thấy điều đó. Thêm một chút kiên trì nữa là em vượt qua được."],
  K:["Mỗi ngày ôn thêm 15 phút, em sẽ thấy điểm số nhích lên rõ rệt.","Em hãy giữ nhịp học này và sửa nốt những lỗi nhỏ còn lại nhé."],
  P:["Em cứ giữ phong độ và giúp các bạn cùng tiến nhé.","Thầy tin em còn tiến xa hơn nữa."]},
 tip:"Em xem lại giúp thầy {weak} nhé.",
 close:["Bài sau thầy chờ tin vui của em. Có gì chưa hiểu, cứ hỏi thầy nhé!","Thầy luôn ở đây giúp em. Cố lên em!","Chúng ta cùng cố gắng ở bài kiểm tra sau nhé, thầy tin ở em!"],
 cls:["Thầy thấy cả lớp đã rất cố gắng. Bạn nào chưa được như ý, đừng buồn: thầy sẽ cùng các em ôn lại những phần còn yếu.","Mỗi bài kiểm tra là một cơ hội để mình biết cần học thêm gì. Thầy tin cả lớp sẽ tiến bộ hơn ở bài sau."]},
{id:'cam',name:'Truyền cảm hứng',ic:'🔥',
 open:{L:["{Em} ơi, {d}/{t} điểm không phải dấu chấm hết — đó là điểm xuất phát.","Hôm nay là {d}/{t}. Nhưng người giỏi không phải là người không vấp ngã, mà là người đứng dậy nhanh nhất."],
  M:["{d}/{t} điểm: {em} đang đứng ngay trước ngưỡng cửa của sự tiến bộ.","{Em} chỉ cách mốc đạt một bước chân với {d}/{t} điểm."],
  K:["{d}/{t} điểm — {em} đã chạm mốc đạt, giờ là lúc nhắm tới mục tiêu cao hơn.","{Em} đã vượt qua vạch đầu tiên với {d}/{t} điểm."],
  G:["{d}/{t} điểm — {em} đang đi đúng hướng!","Kết quả {d}/{t} cho thấy nỗ lực của {em} đã được đền đáp."],
  T:["{d}/{t} điểm — tuyệt vời! {Em} cho thấy nỗ lực luôn có kết quả.","Chúc mừng {em} với {d}/{t} điểm xuất sắc!"]},
 core:{L:["Mỗi lần làm sai là một lần não bộ học được điều mới. Hãy biến những câu sai hôm nay thành những câu đúng ở bài sau.","Thành công đến từ những bước nhỏ lặp lại mỗi ngày. Em chỉ cần bắt đầu từ hôm nay."],
  M:["Em có khả năng, điều còn thiếu chỉ là luyện tập đều đặn. Hãy bắt đầu từ những câu vừa làm sai.","Đừng so sánh với ai cả, hãy so sánh em của hôm nay với em của bài trước."],
  K:["Hãy đặt mục tiêu tăng thêm 1–2 điểm ở bài tới và chia nhỏ nó thành những việc làm được mỗi ngày.","Từ nền này, chỉ cần sửa các lỗi nhỏ là em có thể bứt phá."],
  P:["Hãy tiếp tục thử thách bản thân với những bài khó hơn.","Điều đẹp nhất là em có thể truyền cảm hứng cho các bạn."]},
 tip:"Điểm bắt đầu: {weak}.",
 close:["Bài sau, hãy cho thầy thấy phiên bản tốt hơn của em nhé!","Tin ở em — một bước tiến nhỏ mỗi ngày!","Cố lên, hành trình của em mới bắt đầu thôi!"],
 cls:["Cả lớp ơi, điểm số hôm nay chỉ là điểm xuất phát. Ai cũng có thể bứt lên nếu kiên trì mỗi ngày một chút.","Người thắng không phải người không sai, mà là người sửa sai nhanh nhất. Hãy cùng bứt phá ở bài sau!"]},
{id:'vui',name:'Vui vẻ',ic:'😄',
 open:{L:["{Em} ơi, {d}/{t} điểm — bài này hơi “khó nhằn” với em nhỉ? Không sao, bài sau mình lấy lại phong độ!","Bài này {d}/{t} điểm. Cứ coi như màn khởi động, trận chính còn ở phía trước 😄"],
  M:["{d}/{t} điểm — suýt nữa chạm mốc đạt rồi, tiếc quá chút xíu!","{Em} được {d}/{t} điểm, chỉ thiếu “một cái nháy mắt” nữa là qua mốc đạt 😉"],
  K:["{d}/{t} điểm — đạt rồi nhé, nhưng thầy biết {em} còn “giấu bài” đấy!","{Em} được {d}/{t} điểm, qua cửa an toàn rồi 👍"],
  G:["{d}/{t} điểm — ngon lành cành đào! 👏","{Em} được {d}/{t} điểm, thầy xin phép… khen một cái! 👍"],
  T:["{d}/{t} điểm — đỉnh của chóp! 🌟","Quá xuất sắc, {d}/{t} điểm! Thầy phải đứng dậy vỗ tay 👏"]},
 core:{L:["Toán cũng như chơi game: thua một màn thì chơi lại, rút kinh nghiệm là lên level. Những câu sai chính là bản đồ kho báu của em.","Chuyện bình thường thôi! Quan trọng là em chịu “chơi lại màn” bằng cách xem lại những câu sai."],
  M:["Chỉ cần “nâng cấp” vài kỹ năng nhỏ là em qua màn dễ dàng.","Em sửa vài lỗi “vặt” là điểm tăng vù vù."],
  K:["Em “săn” thêm vài câu ở bài sau nhé, thầy tin em làm được.","Thêm chút ôn tập là em lên hạng ngay."],
  P:["Giữ phong độ nhé, đừng để thầy phải ngạc nhiên vì… điểm quá cao 😄","Em nhớ chỉ bài cho bạn nữa nhé!"]},
 tip:"Nhiệm vụ nhỏ: {weak}.",
 close:["Hẹn em ở bài sau với phong độ mới nhé! 💪","Có gì chưa hiểu, nhắn thầy liền, thầy không cắn đâu 😄","Bài sau mình bùng nổ nha!"],
 cls:["Cả lớp hôm nay làm bài rất nghiêm túc! Bạn nào “chưa bung lụa” thì bài sau mình bung nhé 😄","Chúc mừng các bạn điểm cao, và các bạn chưa như ý đừng buồn — bài sau lại có cơ hội “lật kèo” 💪"]},
{id:'ngan',name:'Ngắn gọn',ic:'⚡',
 open:{L:["{Em} được {d}/{t} điểm. Chưa như kỳ vọng, nhưng sửa được.","{d}/{t} điểm: cần cố gắng nhiều hơn."],
  M:["{d}/{t} điểm: gần mốc đạt rồi.","{d}/{t} điểm: còn thiếu một chút nữa."],
  K:["{d}/{t} điểm: đạt, có thể cao hơn.","{d}/{t} điểm: ổn, cần bứt lên."],
  G:["{d}/{t} điểm: tốt.","{d}/{t} điểm: khá tốt, giữ vững."],
  T:["{d}/{t} điểm: xuất sắc.","{d}/{t} điểm: rất tốt!"]},
 core:{L:["Xem lại các câu sai, hỏi thầy chỗ chưa hiểu. Em làm được.","Ôn lại từng phần một, mỗi ngày một ít."],
  M:["Sửa lỗi sai hôm nay, bài sau sẽ tiến bộ.","Chỉ cần ôn thêm chút nữa."],
  K:["Giữ nhịp học, sửa lỗi nhỏ.","Mục tiêu bài sau: cao hơn bài này."],
  P:["Giữ vững phong độ.","Tiếp tục phát huy."]},
 tip:"Cần xem lại: {weak}.",
 close:["Bài sau cố lên!","Thầy tin em.","Tiến bộ từng ngày."],
 cls:["Cả lớp đã làm bài xong. Bạn nào chưa như ý: xem lại câu sai, hỏi thầy. Bài sau sẽ tốt hơn.","Kết quả đã có. Sửa lỗi, ôn đều, bài sau tiến bộ."]},
{id:'ke',name:'Kế hoạch cải thiện',ic:'🎯',
 open:{L:["{Em} được {d}/{t} điểm. Thầy muốn cùng em lập một kế hoạch nhỏ để lần sau tốt hơn.","Với {d}/{t} điểm, đây là lúc mình cần một chiến lược mới thay vì lo lắng."],
  M:["{d}/{t} điểm — chỉ cần xử lý đúng vài điểm yếu là {em} qua mốc đạt.","Điểm {d}/{t} cho thấy {em} đã có nền, cần tinh chỉnh đúng chỗ."],
  K:["{d}/{t} điểm: {em} đã đạt, giờ tối ưu để lên mức khá.","Với {d}/{t} điểm, {em} có thể tiến thêm bằng vài điều chỉnh nhỏ."],
  G:["{d}/{t} điểm tốt. Giờ tập trung vào các lỗi cẩu thả để chạm mức cao hơn.","Kết quả {d}/{t} tốt, hướng tới mục tiêu tiếp theo nhé."],
  T:["{d}/{t} điểm rất tốt. Em có thể thử các bài nâng cao.","Xuất sắc với {d}/{t}! Hãy thử sức thêm bài khó."]},
 core:{L:["Kế hoạch 3 bước: (1) làm lại những câu sai, (2) mỗi ngày luyện 5 câu cùng dạng, (3) nhờ thầy hoặc bạn giải thích chỗ chưa hiểu.","Thử cách này: mỗi ngày 20 phút — 10 phút xem lại lỗi sai và 10 phút luyện câu mới."],
  M:["Sửa từng câu sai, ghi lại nguyên nhân (thiếu kiến thức hay tính nhầm), rồi luyện đúng dạng đó.","Chọn 3 dạng bài làm sai nhiều nhất và luyện mỗi dạng 5 câu trong tuần này."],
  K:["Phân loại lỗi sai: do kiến thức hay do cẩu thả, rồi xử lý từng loại.","Đặt mục tiêu cụ thể cho bài sau: tăng ít nhất 1 điểm."],
  P:["Hãy ghi lại cách làm của em để chia sẻ cùng các bạn.","Mục tiêu tiếp theo: giữ phong độ, làm nhanh hơn và chính xác hơn."]},
 tip:"Ưu tiên ôn: {weak}.",
 close:["Một tuần nữa mình xem lại tiến bộ nhé!","Cứ đi từng bước, thầy luôn hỗ trợ em.","Chúc em thực hiện thật tốt kế hoạch này!"],
 cls:["Kế hoạch chung cho cả lớp: tuần này mình ôn lại các câu nhiều bạn làm sai, sau đó làm bài luyện tập ngắn để kiểm tra lại.","Mục tiêu bài sau: tăng điểm trung bình cả lớp. Mỗi bạn hãy chọn một điểm yếu của mình để sửa trong tuần này."]},
{id:'tt',name:'Thể thao',ic:'🏅',
 open:{L:["{Em} à, {d}/{t} điểm — hiệp này em chưa thắng, nhưng trận đấu còn dài.","Giống cầu thủ thua một trận, {d}/{t} điểm là lúc để rút kinh nghiệm."],
  M:["{d}/{t} điểm: sắp vào vạch đích rồi, tăng tốc một chút nữa!","{Em} đang ở những mét cuối trước mốc đạt với {d}/{t} điểm."],
  K:["{d}/{t} điểm: {em} đã qua vạch xuất phát vững vàng.","{Em} đã ghi bàn với {d}/{t} điểm!"],
  G:["{d}/{t} điểm — pha ghi bàn đẹp!","{Em} đang chạy rất tốt với {d}/{t}."],
  T:["{d}/{t} điểm — huy chương vàng cho {em}! 🥇","{Em} ghi {d}/{t} điểm, một pha lập công xuất sắc!"]},
 core:{L:["Vận động viên giỏi nào cũng từng thua. Họ thắng nhờ tập luyện đều mỗi ngày — em cũng vậy.","Mỗi buổi tập nhỏ đều giúp em mạnh hơn. Hãy bắt đầu với những câu vừa làm sai."],
  M:["Chỉ cần tập thêm vài buổi, em sẽ vượt qua mốc này dễ dàng.","Hãy khởi động lại với những dạng bài còn yếu."],
  K:["Giữ phong độ và luyện thêm kỹ thuật ở những dạng bài chưa vững.","Mỗi ngày một chút, em sẽ lên hạng."],
  P:["Giữ phong độ nhé, đội trưởng!","Hãy giúp “đồng đội” cùng tiến bộ."]},
 tip:"Bài tập kỹ thuật: {weak}.",
 close:["Hiệp sau, thầy chờ em bứt tốc!","Chuẩn bị thật tốt, mình cùng cán đích!","Cố lên, nhà vô địch tương lai!"],
 cls:["Cả đội đã hoàn thành trận đấu! Hiệp sau mình cùng rút kinh nghiệm và ghi nhiều bàn hơn.","Đội nào cũng có lúc thua một trận. Quan trọng là cả lớp cùng tập luyện để thắng ở trận sau!"]},
{id:'ph',name:'Gửi phụ huynh',ic:'🏠',
 open:{L:["Kính gửi quý phụ huynh. Em {hoten} đạt {d}/{t} điểm trong bài kiểm tra lần này, chưa được như mong đợi.","Kính gửi quý phụ huynh. Kết quả bài kiểm tra của em {hoten} là {d}/{t} điểm, em cần được hỗ trợ thêm."],
  M:["Kính gửi quý phụ huynh. Em {hoten} đạt {d}/{t} điểm, gần với mốc đạt.","Kính gửi quý phụ huynh. Bài kiểm tra lần này em {hoten} được {d}/{t} điểm, chỉ cần củng cố thêm là đạt."],
  K:["Kính gửi quý phụ huynh. Em {hoten} đạt {d}/{t} điểm, ở mức đạt.","Kính gửi quý phụ huynh. Em {hoten} được {d}/{t} điểm và đã qua mốc đạt."],
  G:["Kính gửi quý phụ huynh. Em {hoten} đạt {d}/{t} điểm, kết quả tốt.","Kính gửi quý phụ huynh. Bài kiểm tra lần này em {hoten} được {d}/{t} điểm, kết quả khá tốt."],
  T:["Kính gửi quý phụ huynh. Em {hoten} đạt {d}/{t} điểm, kết quả rất tốt.","Kính gửi quý phụ huynh. Em {hoten} được {d}/{t} điểm, kết quả xuất sắc."]},
 core:{L:["Em vẫn còn nhiều khả năng tiến bộ nếu được đồng hành đều đặn. Gia đình có thể nhắc em ôn lại các câu làm sai mỗi ngày khoảng 15–20 phút và khích lệ em hỏi thầy khi chưa hiểu.","Mong gia đình cùng động viên để em tự tin hơn; những lời khích lệ lúc này có ý nghĩa với em hơn nhiều so với áp lực về điểm số."],
  M:["Em chỉ cần củng cố thêm một số nội dung là có thể đạt kết quả tốt hơn. Mong gia đình nhắc em ôn bài đều đặn.","Rất mong gia đình khích lệ để em duy trì thói quen ôn tập mỗi ngày."],
  K:["Em cần duy trì nền nếp học tập để nâng cao kết quả.","Mong gia đình tiếp tục đồng hành cùng em."],
  P:["Rất mong gia đình tiếp tục khích lệ em.","Cảm ơn gia đình đã đồng hành cùng em."]},
 tip:"Em cần củng cố thêm: {weak}.",
 close:["Trân trọng cảm ơn quý phụ huynh đã quan tâm.","Rất mong được phối hợp cùng gia đình để em tiến bộ hơn.","Xin chân thành cảm ơn quý phụ huynh."],
 cls:["Kính gửi quý phụ huynh lớp. Nhà trường đã chấm xong bài kiểm tra. Mong gia đình cùng khích lệ các em ôn tập đều đặn và hỏi thầy cô khi chưa hiểu.","Kết quả bài kiểm tra đã có. Rất mong quý phụ huynh động viên các em, đặc biệt những em chưa đạt, để lần sau tiến bộ hơn."]}
];
const MSG_BANDS=[['L','Cần cố gắng nhiều',0],['M','Gần đạt',0.35],['K','Đạt',0.5],['G','Khá – Tốt',0.65],['T','Giỏi',0.8]];
const bandOf=p=>p>=0.8?'T':p>=0.65?'G':p>=0.5?'K':p>=0.35?'M':'L';
const v2=x=>String(Math.round(x*100)/100).replace('.',',');
const msgHash=x=>{let h=7;for(const c of String(x))h=(h*31+c.charCodeAt(0))>>>0;return h};
const msgFill=(t,v)=>t.replace(/\{(\w+)\}/g,(_,k)=>v[k]!=null?v[k]:'');
const msgPick=(a,seed,v)=>a[(seed+v)%a.length];
const msgVar={};  // "sbd|style" -> số lần bấm "lời khác"
function weakInfo(sc,ex){
  const mx={tn:ex.nTN*num(ex.pTn),ds:ex.nDS*Math.max(0,...[0,1,2,3].map(i=>num(ex.pDs[i]))),tl:ex.nTLN*num(ex.pTln)},got={tn:sc.sTN,ds:sc.sDS,tl:sc.sTL};
  const nm={tn:'Phần I (trắc nghiệm)',ds:'Phần II (đúng–sai)',tl:'Phần III (trả lời ngắn)'};
  const parts=['tn','ds','tl'].filter(k=>mx[k]>0&&got[k]/mx[k]<0.5).map(k=>nm[k]);
  const w=[];const tn=sc.d.tn.map((x,i)=>x===false?i+1:0).filter(Boolean),ds=sc.d.ds.map((r,q)=>r.some(x=>x===false)?q+1:0).filter(Boolean),tl=sc.d.tln.map((x,i)=>x===false?i+1:0).filter(Boolean);
  if(tn.length)w.push('câu TN '+tn.join(', '));if(ds.length)w.push('câu ĐS '+ds.join(', '));if(tl.length)w.push('câu TLN '+tl.join(', '));
  const nWrong=tn.length+ds.length+tl.length;
  let weak='';if(parts.length===3)weak='cả ba phần của đề';else if(parts.length)weak=parts.join(' và ');
  if(w.length&&nWrong<=8)weak=weak?weak+' (xem lại '+w.join('; ')+')':w.join('; ');
  return weak;
}
function prevScoreOf(s,ex){
  if(!ex.lop)return null;let best=null;
  S.exams.forEach(e=>{if(e.id===ex.id||lc(e.lop)!==lc(ex.lop))return;if(!(String(e.date)<String(ex.date)||(String(e.date)===String(ex.date)&&e.t<ex.t)))return;
    const o=S.scans.find(x=>x.examId===e.id&&parseInt(x.sbd,10)===parseInt(s.sbd,10));if(!o)return;const sc=scoreOf(o),tot=totalOf(e);if(!sc||!tot)return;
    if(!best||String(e.date)>String(best.date)||(e.date===best.date&&e.t>best.t))best={date:e.date,t:e.t,p10:sc.total/tot*10}});
  return best?best.p10:null;
}
function buildMsg(item,styleId,ex,gentle){
  const st=MSG_STYLES.find(x=>x.id===styleId)||MSG_STYLES[0],tot=totalOf(ex)||10,p=item.sc.total/tot,band=bandOf(p),vk=item.s.sbd+'|'+st.id,v=msgVar[vk]||0,seed=msgHash(item.s.sbd+st.id);
  const nm=item.nm?item.nm.name:'',ten0=nm?nm.split(' ').pop():'',ten=/^em$/i.test(ten0)?'':ten0,em=ten?'em '+ten:'em',Em=ten?'Em '+ten:'Em';
  const vars={em,Em,hoten:nm||('mã SBD '+item.s.sbd),d:v2(item.sc.total),t:vnum(tot)};
  const parts=[msgFill(msgPick(st.open[band],seed,v),vars)];
  const prev=prevScoreOf(item.s,ex);if(prev!=null){const dl=p*10-prev;if(dl>=0.4)parts.push(st.id==='ph'?'Điểm của em đã tăng '+vnum(Math.round(dl*10)/10)+' điểm so với bài trước, đây là tiến bộ đáng ghi nhận.':'Điểm lần này tăng '+vnum(Math.round(dl*10)/10)+' điểm so với bài trước — đó là sự tiến bộ thật sự, em hãy tự hào nhé!')}
  const coreArr=(band==='G'||band==='T')?st.core.P:st.core[band];parts.push(msgFill(msgPick(coreArr,seed+1,v),vars));
  if(band==='L'||band==='M'||band==='K'){const w=weakInfo(item.sc,ex);if(w)parts.push(msgFill(st.tip,{weak:w}))}
  parts.push(msgFill(msgPick(st.close,seed+2,v),vars));
  return parts.join(' ');
}
function buildClassMsg(items,styleId,ex){
  const st=MSG_STYLES.find(x=>x.id===styleId)||MSG_STYLES[0],tot=totalOf(ex)||10,n=items.length;if(!n)return'';
  const mean=items.reduce((a,x)=>a+x.sc.total,0)/n,dat=items.filter(x=>x.sc.total/tot>=0.5).length;
  const q=qWeak(items,ex).slice(0,3).map(x=>x.n).join(', ');
  return `Lớp ${ex.lop||''} đã làm xong “${ex.name}”: điểm trung bình ${v2(mean)}/${vnum(tot)}, có ${dat}/${n} bạn đạt từ ${vnum(tot/2)} điểm trở lên.`.replace('Lớp  đã','Cả lớp đã')+(q?` Những câu nhiều bạn làm chưa đúng: ${q} — mình sẽ cùng ôn lại.`:'')+' '+st.cls[msgHash(ex.id+st.id)%st.cls.length]+' '+st.close[msgHash(ex.name)%st.close.length];
}
function qWeak(items,ex){
  const L=getLayout(ex.layout),parts=[],pc=a=>Math.round(a.filter(Boolean).length/a.length*100);if(items.length<2&&!items.length)return parts;
  for(let i=0;i<Math.min(L.nTN,ex.nTN);i++)parts.push({n:'Câu TN '+(i+1)+' ('+pc(items.map(x=>x.sc.d.tn[i]))+'% đúng)',p:pc(items.map(x=>x.sc.d.tn[i]))});
  for(let q=0;q<Math.min(L.nDS,ex.nDS);q++){const p=Math.round(items.reduce((a,x)=>a+x.sc.d.ds[q].filter(Boolean).length,0)/(items.length*4)*100);parts.push({n:'Câu ĐS '+(q+1)+' ('+p+'% ý đúng)',p})}
  for(let q=0;q<Math.min(L.nTLN,ex.nTLN);q++)parts.push({n:'Câu TLN '+(q+1)+' ('+pc(items.map(x=>x.sc.d.tln[q]))+'% đúng)',p:pc(items.map(x=>x.sc.d.tln[q]))});
  return parts.filter(x=>x.p<60).sort((a,b)=>a.p-b.p);
}
function gradeOf(p){return p>=0.8?'Giỏi':p>=0.65?'Khá':p>=0.5?'Đạt':'Chưa đạt'}
function openSummary(){
  const ex=curEx(),tot=totalOf(ex)||10,list=myScans().slice().sort((a,b)=>a.sbd.localeCompare(b.sbd));
  const items=list.map(s=>({s,sc:scoreOf(s),nm:rosterOf(s.sbd,ex)})).filter(x=>x.sc);
  const c=S.cfg;if(!MSG_STYLES.some(x=>x.id===c.msgStyle))c.msgStyle='am';if(c.msgThr==null||c.msgThr==='')c.msgThr=5;if(c.msgAll==null)c.msgAll=false;
  const box=$('#sBody');
  const draw=()=>{
    const n=items.length,thr=num(c.msgThr)/10*tot;
    if(!n){box.innerHTML='<div class="empty">Chưa có bài nào được chấm điểm. Hãy thêm đáp án cho bài này rồi quét phiếu.</div>';return}
    const mean=items.reduce((a,x)=>a+x.sc.total,0)/n,mx=Math.max(...items.map(x=>x.sc.total)),mn=Math.min(...items.map(x=>x.sc.total));
    const g={'Giỏi':0,'Khá':0,'Đạt':0,'Chưa đạt':0};items.forEach(x=>g[gradeOf(x.sc.total/tot)]++);
    const gc={'Giỏi':'var(--ok)','Khá':'#0ea5e9','Đạt':'var(--warn)','Chưa đạt':'var(--bad)'};
    let h=`<div class="note"><b>${esc(ex.name)}</b>${ex.lop?' · Lớp '+esc(ex.lop):''} · ${vnDate(ex.date)}</div>
    <div class="card sum"><div><b>${n}</b><small>bài</small></div><div><b>${fmt(mean)}</b><small>điểm TB</small></div><div><b>${fmt(mx)}</b><small>cao nhất</small></div><div><b>${fmt(mn)}</b><small>thấp nhất</small></div></div>
    <div class="card"><h3>Xếp loại <small class="muted">(theo % tổng điểm)</small></h3><div class="gbar">${Object.keys(g).map(k=>`<div style="flex:${Math.max(g[k],0.0001)};background:${gc[k]}" title="${k}">${g[k]?g[k]:''}</div>`).join('')}</div><div class="glg">${Object.keys(g).map(k=>`<span><i style="background:${gc[k]}"></i>${k} ${g[k]} (${Math.round(g[k]/n*100)}%)</span>`).join('')}</div></div>`;
    const qw=qWeak(items,ex).slice(0,5);
    if(n>=2&&qw.length)h+=`<div class="card"><h3>Nội dung nên ôn lại cho cả lớp</h3><div class="muted">${qw.map(x=>esc(x.n)).join('<br>')}</div></div>`;
    h+=`<h3 style="margin-top:14px">Lời động viên</h3><div class="seg chips" id="mStyles">${MSG_STYLES.map(x=>`<button class="${c.msgStyle===x.id?'on':''}" data-st="${x.id}">${x.ic} ${x.name}</button>`).join('')}</div>
    <div class="row" style="margin-top:8px"><label class="f" style="max-width:150px"><span>Nhắn cho em dưới (điểm/10)</span><input id="mThr" inputmode="decimal" value="${esc(String(c.msgThr).replace('.',','))}"></label><label class="toggle" style="flex:1"><input type="checkbox" id="mAll"${c.msgAll?' checked':''}> Gồm cả lời khen cho học sinh còn lại</label></div>`;
    const sel=items.filter(x=>c.msgAll||x.sc.total<thr-1e-9||(x.sc.total/tot*10)<num(c.msgThr)-1e-9);
    h+=`<div class="card"><div class="row" style="align-items:center"><b style="flex:1">Tin chung cho cả lớp</b><button class="btn sm" id="mClsCopy">Sao chép</button></div><p class="msgtx" id="mClsTx">${esc(buildClassMsg(items,c.msgStyle,ex))}</p></div>`;
    h+=`<div class="muted" style="margin:6px 0">${sel.length?sel.length+' học sinh nhận lời nhắn (dưới '+String(c.msgThr).replace('.',',')+' điểm'+(c.msgAll?', cùng lời khen cho các em còn lại':'')+')':'Không có học sinh nào dưới '+String(c.msgThr).replace('.',',')+' điểm 🎉'}</div>`;
    h+=sel.sort((a,b)=>a.sc.total-b.sc.total).map(x=>{const b=bandOf(x.sc.total/tot),bn=MSG_BANDS.find(y=>y[0]===b)[1];return `<div class="card mc" data-sbd="${esc(x.s.sbd)}"><div class="row" style="align-items:center"><div style="flex:1;min-width:0"><b>${esc(x.nm?x.nm.name:'SBD '+x.s.sbd)}</b><div class="muted">${esc(x.s.sbd)} · ${fmt(x.sc.total)}/${vnum(tot)} · ${bn}</div></div></div><p class="msgtx">${esc(buildMsg(x,c.msgStyle,ex))}</p><div class="row gap" style="margin:6px 0 0"><button class="btn sm" data-a="copy">Sao chép</button><button class="btn sm ghost" data-a="other">↻ Lời khác</button><button class="btn sm ghost" data-a="share">Chia sẻ</button></div></div>`}).join('');
    h+=`<div class="row gap"><button class="btn primary" id="mAllCopy"${sel.length?'':' disabled'}>Sao chép tất cả</button><button class="btn" id="mCsv"${sel.length?'':' disabled'}>⬇ Xuất CSV lời nhắn</button></div>`;
    box.innerHTML=h;
    $$('#mStyles [data-st]').forEach(b=>b.onclick=()=>{c.msgStyle=b.dataset.st;save.cfg();draw()});
    $('#mThr').onchange=e=>{c.msgThr=num(e.target.value);save.cfg();draw()};$('#mAll').onchange=e=>{c.msgAll=e.target.checked;save.cfg();draw()};
    const cp=async(t,m)=>{try{await navigator.clipboard.writeText(t);toast(m||'Đã sao chép')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(m||'Đã sao chép')}catch(_){toast('Không sao chép được')}ta.remove()}};
    $('#mClsCopy').onclick=()=>cp($('#mClsTx').textContent);
    $$('#sBody .mc').forEach(card=>{const x=items.find(y=>y.s.sbd===card.dataset.sbd);
      card.querySelector('[data-a=copy]').onclick=()=>cp(card.querySelector('.msgtx').textContent);
      card.querySelector('[data-a=other]').onclick=()=>{const k=x.s.sbd+'|'+c.msgStyle;msgVar[k]=(msgVar[k]||0)+1;card.querySelector('.msgtx').textContent=buildMsg(x,c.msgStyle,ex)};
      card.querySelector('[data-a=share]').onclick=async()=>{const t=card.querySelector('.msgtx').textContent;if(navigator.share){try{await navigator.share({text:t})}catch(_){}}else cp(t)}});
    const lines=()=>sel.map(x=>({name:x.nm?x.nm.name:'',sbd:x.s.sbd,sc:x.sc.total,msg:($$('#sBody .mc').find(c2=>c2.dataset.sbd===x.s.sbd)||{querySelector:()=>({textContent:buildMsg(x,c.msgStyle,ex)})}).querySelector('.msgtx').textContent,grade:gradeOf(x.sc.total/tot)}));
    $('#mAllCopy').onclick=()=>cp(lines().map(l=>`${l.name||'SBD '+l.sbd} (${l.sbd}) — ${fmt(l.sc)}/${vnum(tot)}\n${l.msg}`).join('\n\n'),'Đã sao chép lời nhắn của '+sel.length+' học sinh');
    $('#mCsv').onclick=()=>{const rows=[['STT','Họ và tên','SBD','Lớp',"Điểm",'Xếp loại','Lời nhắn'],...lines().map((l,i)=>[i+1,l.name,l.sbd,ex.lop||'',fmt(l.sc),l.grade,l.msg])];
      const csv='\uFEFF'+rows.map(r=>r.map(v=>{v=String(v);return /[",;\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')).join('\r\n');
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='loi-nhan-'+(ex.name||'bai').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase()+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
  };
  draw();$('#sdlg').hidden=false;$('#sdlg .sheetbox').scrollTop=0;
}
