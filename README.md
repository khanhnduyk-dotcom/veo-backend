# VEO Backend Server

Backend API server cho VEO Auto app, deploy trên Vercel với Supabase authentication.

## 📁 Cấu trúc

```
veo-backend/
├── api/
│   ├── _config.js          # Shared config (Supabase, Google AI)
│   ├── login.js             # POST /api/login
│   ├── profile.js           # GET /api/profile
│   ├── check_session.js     # GET /api/check_session
│   ├── get_transaction_history.js
│   └── prf2.js              # POST /api/prf2 (AI generation)
├── package.json
├── vercel.json
└── README.md
```

## 🚀 Deploy lên Vercel

### Bước 1: Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Login Vercel
```bash
vercel login
```

### Bước 3: Deploy
```bash
cd veo-backend
npm install
vercel --prod
```

### Bước 4: Lấy URL
Sau khi deploy, Vercel sẽ cho bạn URL như:
```
https://veo-backend-xxx.vercel.app
```

## 🔧 Cấu hình Environment Variables (Optional)

Trong Vercel Dashboard, thêm các biến:
- `SUPABASE_URL`: URL Supabase của bạn
- `SUPABASE_ANON_KEY`: Supabase anon key  
- `GOOGLE_AI_KEY`: Google AI API key

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/login` | POST | Đăng nhập với email/password |
| `/api/profile` | GET | Lấy thông tin user + subscription |
| `/api/check_session` | GET | Kiểm tra session hợp lệ |
| `/api/prf2` | POST | Tạo nội dung AI (story, script, prompt) |

## 🔄 Cập nhật App để dùng Backend mới

Sau khi deploy, thay URL trong `app.asar`:
```javascript
// Thay
Ls="https://ta.ltruowng.space/apiveo"
// Thành
Ls="https://your-vercel-url.vercel.app/api"
```
