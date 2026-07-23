# 🌼 Vườn Ươm STEAM

Công cụ soạn giáo án STEAM mầm non cho Nhà trẻ (24–36 tháng), Mẫu giáo bé (3–4 tuổi), Mẫu giáo nhỡ (4–5 tuổi) và Mẫu giáo lớn (5–6 tuổi) — theo đúng quy trình **5E**, **EDP (Engineering Design Process)** và **Dự án STEAM**, trình bày theo khung 5 thành tố **S-T-E-A-M**.

Giáo án được soạn **đầy đủ và chi tiết**: kịch bản giảng dạy theo từng bước (có lời dẫn mẫu, câu hỏi mở cụ thể), tối thiểu 3 trò chơi STEAM, 8-12 slide PowerPoint gợi ý, nhiều gợi ý prompt AI, phiếu đánh giá và gợi ý mở rộng — sẵn sàng dùng để dạy trực tiếp.

Tạo bởi **Trần Quỳ** – Giáo viên mầm non STEAM.

---

## 🧱 Cấu trúc dự án

```
steam-lesson-planner/
├── netlify/
│   └── functions/
│       └── generate.js    # Netlify Function — proxy gọi Google Gemini API (giữ API key ở server)
├── netlify.toml            # Cấu hình build + redirect /api/* → Netlify Function
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js              # Logic chính: form, render kết quả, xuất file
│   ├── api.js                # Hàm gọi tới /api/generate
│   ├── systemPrompt.js       # Prompt hệ thống mô tả quy trình soạn giáo án STEAM (đã tối ưu để giáo án dài, chi tiết)
│   ├── flower.js             # SVG logo hoa 5 cánh S-T-E-A-M
│   └── style.css             # Toàn bộ giao diện
├── index.html                 # Trang gốc Vite
├── package.json
├── vite.config.js
├── .env.example
└── .gitignore
```

## ⚠️ Quan trọng: về API key

Ứng dụng gọi Google Gemini 2.5 Flash để soạn nội dung giáo án. Vì lý do bảo mật,
**API key không bao giờ được đặt ở phía trình duyệt** — nếu làm vậy bất kỳ ai
mở DevTools cũng lấy được key của bạn.

Vì vậy dự án này gọi qua route server-side `netlify/functions/generate.js`
(Netlify Function), route này đọc key từ biến môi trường `GEMINI_API_KEY` trên
server. Bạn cần tự cấp một API key Google Gemini và khai báo biến môi trường
này khi deploy (xem bước 3 bên dưới) — ứng dụng sẽ không tạo được giáo án nếu
thiếu key.

Lấy API key tại: https://aistudio.google.com/app/apikey

---

## 🚀 Chạy thử ở máy local

### Cách 1 — dùng Netlify CLI (khuyên dùng, chạy được cả `/api`)

```bash
npm install
npm install -g netlify-cli   # nếu chưa có
cp .env.example .env          # rồi điền GEMINI_API_KEY thật vào .env
netlify dev
```

Netlify CLI sẽ tự đọc `.env`, build Vite, chạy function ở `netlify/functions/generate.js`
và áp dụng redirect `/api/* → /.netlify/functions/*` giống hệt trên production.

### Cách 2 — dùng `vite dev` (chỉ xem giao diện, KHÔNG gọi được API)

```bash
npm install
npm run dev
```

Với cách 2, nút "Soạn giáo án ngay" sẽ báo lỗi vì `/api/generate` chỉ chạy
được thông qua Netlify (hoặc `netlify dev`). Dùng cách này nếu bạn chỉ muốn
chỉnh sửa giao diện.

---

## 📦 Đưa lên GitHub

```bash
git init
git add .
git commit -m "Khởi tạo Vườn Ươm STEAM"
git branch -M main
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git push -u origin main
```

---

## ☁️ Deploy lên Netlify

### Cách A — qua giao diện Netlify (khuyên dùng)

1. Vào https://app.netlify.com → **Add new site → Import an existing project**
   → chọn repo GitHub vừa đẩy lên.
2. Netlify sẽ tự nhận cấu hình từ `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. Trước khi bấm Deploy (hoặc sau đó vào **Site configuration → Environment
   variables**), thêm biến môi trường:

   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | API key Google Gemini của bạn |

4. Bấm **Deploy site**. Sau khi build xong, Netlify sẽ cấp cho bạn một domain
   dạng `https://ten-du-an.netlify.app` — mở lên là dùng được ngay.

Mỗi lần bạn `git push` lên nhánh `main`, Netlify sẽ tự động build & deploy lại.

### Cách B — qua Netlify CLI (không cần GitHub)

```bash
npm install -g netlify-cli
netlify login
netlify init          # tạo site mới, làm theo hướng dẫn trên terminal
netlify env:set GEMINI_API_KEY "AIzaSy..."
netlify deploy --prod
```

---

## ✏️ Tuỳ chỉnh

- **Đổi màu / phông chữ:** sửa biến CSS trong `src/style.css` (khối `:root`).
- **Đổi nội dung / quy tắc soạn giáo án / độ dài chi tiết:** sửa `src/systemPrompt.js`.
- **Đổi model AI hoặc giới hạn độ dài đầu ra:** sửa `GEMINI_MODEL` và
  `MAX_OUTPUT_TOKENS` trong `netlify/functions/generate.js`.
- **Tên người tạo / thương hiệu:** sửa trực tiếp trong `index.html` (header, footer).

---

## 📄 Giấy phép

Dự án nội bộ phục vụ giảng dạy mầm non. Vui lòng không phát hành lại nội dung
mà không ghi rõ nguồn.
