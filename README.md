# Chấm phiếu OMR — web app cho iPhone

Chấm phiếu trắc nghiệm bằng camera điện thoại. Có 3 mẫu phiếu:
- **Nửa tờ A4 (mặc định, tiết kiệm giấy):** 20 câu trắc nghiệm + 6 câu Đúng–Sai + 6 câu Trả lời ngắn. In 2 phiếu trên 1 tờ A4, cắt đôi theo nét đứt.
- **THPT 2025 cả tờ A4:** 12 TN + 4 Đúng–Sai + 6 Trả lời ngắn.
- **Trắc nghiệm A–D** 20/30/40/50 câu. Chạy offline, không cần máy chủ, không gửi dữ liệu đi đâu.

## Cấu trúc
- `index.html` — toàn bộ app (một file). Sinh ra từ `src/` bằng `python3 build.py`.
- `src/core.js` — bố cục phiếu, vẽ SVG, tìm 4 ô góc, đọc ô tô, chấm điểm. `src/ui.js` — giao diện. `src/style.css`, `src/app.html`.
- `manifest.webmanifest`, `sw.js`, `icon-*.png` — để cài lên màn hình chính và chạy offline.
- `vercel.json` — cấp quyền camera khi đưa lên Vercel.

## Đưa lên iPhone
Camera trên iPhone **chỉ chạy với địa chỉ https**, nên cần đưa thư mục này lên một địa chỉ web (Vercel, Netlify, GitHub Pages đều được):
1. Vercel: kéo thả thư mục `cham-phieu-omr` vào vercel.com/new (hoặc `vercel --prod` trong thư mục).
2. Mở địa chỉ bằng **Safari** trên iPhone › nút Chia sẻ › **Thêm vào MH chính**. Mở app từ biểu tượng mới: toàn màn hình, dùng được khi mất mạng.
3. Lần đầu bấm “Bắt đầu quét”, chọn **Cho phép** camera.

Nếu chưa có địa chỉ https: vẫn dùng được nút **Chụp ảnh phiếu / Chọn nhiều ảnh** (mở app Camera của iPhone), cách này chạy cả khi mở file trực tiếp.

## Cách dùng nhanh
1. Tab **Phiếu**: chọn mẫu phiếu, gõ tên trường/bài kiểm tra, **In phiếu trắng (A4)** (tỉ lệ 100%, không chọn “Vừa trang”). Mẫu nửa tờ sẽ in sẵn 2 phiếu, cắt đôi theo nét đứt (cắt trước khi phát hoặc trước khi quét).
2. Tab **Đáp án**: thêm đáp án từng mã đề — dán Markdown xuất từ app trình chiếu (PHẦN I/II/III, `Đáp án:`, `<Key=…>`) hoặc gõ
   `I: ABCDABCDABCD` / `II: ĐSĐS SSĐĐ ĐĐĐĐ SĐSĐ` / `III: 5; -2,5; 12; 0,75; 3; 8`.
3. Học sinh tô **số báo danh (6 số)** và **mã đề (3 số)** trên phiếu, tô các đáp án bằng bút chì đen/bút mực.
4. Tab **Quét**: đặt phiếu phẳng, đủ sáng, thấy cả 4 ô vuông đen ở góc. App tự chốt khi đọc ổn định 3 khung hình liên tiếp, kêu “bíp”, rồi chờ phiếu kế tiếp. Ô tô chưa rõ có viền vàng; sửa tay trong tab Kết quả.
5. Tab **Kết quả**: điểm từng bài, phổ điểm, tỉ lệ đúng từng câu; xuất **CSV** (mở bằng Excel/Google Sheets). Nạp danh sách học sinh (SBD, Họ tên, Lớp) ở tab Cài đặt để hiện tên.

Thang điểm mặc định (đổi được ở Cài đặt):
- Mẫu THPT 2025 cả tờ: TN 0,25/câu; Đúng–Sai đúng 1/2/3/4 ý được 0,1/0,25/0,5/1; TLN 0,5/câu (tổng 10).
- Mẫu nửa tờ: TN 0,2/câu (4 điểm); Đúng–Sai mỗi câu tối đa 0,5 (đúng 1/2/3/4 ý được 0,05/0,125/0,25/0,5) (3 điểm); TLN 0,5/câu (3 điểm) — tổng 10.
Đáp án TLN so sánh theo giá trị số (0,5 = 0.50).

## Thử nhanh không cần học sinh
Tab Phiếu › **In phiếu mẫu đã tô** (hoặc xem trên màn hình máy tính) › tab Đáp án › **Nạp đáp án mẫu (mã 101)** › quét. Kết quả đúng: mẫu nửa tờ **7,525 điểm** (TN 3,6 · ĐS 1,925 · TLN 2); mẫu THPT 2025 cả tờ 6,35 điểm. App cũng báo số điểm đúng khi bấm “Xem phiếu mẫu đã tô”.

## Mẹo để quét nhanh và chính xác
- Nền bàn tối hơn giấy; tránh bóng tay che 4 góc; giữ máy song song với mặt bàn.
- Cả tờ phiếu chiếm khoảng 70–90% khung hình. iPhone nên để dọc.
- Học sinh tô nhạt: hạ “Độ nhạy” ở Cài đặt (app cũng tự thích nghi với nét bút chì nhạt).

## Đã kiểm thử
Ảnh giả lập (xoay 0/90/180/270° ± 14°, nghiêng phối cảnh, bóng đổ, mờ, nhiễu, 800×600 đến 1920×1080), gồm cả nét bút chì nhạt: 135 ảnh, 6120 ô, **0 ô sai**. Ảnh bị cắt mất góc phiếu thì app từ chối đọc thay vì đọc sai. Chưa thử trên iPhone thật — hãy in 1 tờ phiếu mẫu và quét thử trước khi dùng thật.
