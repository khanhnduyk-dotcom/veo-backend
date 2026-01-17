const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    if (Object.keys(req.query).length > 0) {
        console.log('Query:', JSON.stringify(req.query, null, 2));
    }
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gkhkerlxxoihfvgnexaq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraGtlcmx4eG9paGZ2Z25leGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDM4MzQsImV4cCI6MjA4MjY3OTgzNH0.a8Pyk2IQN3hjcsLlSHGV6yUPwL2Usnv6DrVtFrD60HQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// VIP Subscription data
const VIP_SUBSCRIPTION = {
    package_name: "Gói Doanh Nghiệp",
    package_id: "13",
    start_date: new Date().toISOString(),
    end_date: "2099-12-31 23:59:59",
    status: "active",
    max_devices: 1000
};

// Token functions
function generateToken(userId) {
    return Buffer.from(`${userId}_${Date.now()}_vip`).toString('base64');
}

function verifyToken(token) {
    if (!token) return null;
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split('_');
        if (parts.length >= 2) return { userId: parts[0], valid: true };
    } catch (e) { }
    return null;
}

// Cookie storage
let cookieData = { last_update: Date.now(), cookie: { value: "", bearerToken: "" } };

// ============ API ROUTES ============

// Login
app.all('/login.php', async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email;
        const password = req.body?.password || req.query?.password;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email và mật khẩu là bắt buộc' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.json({ success: false, message: error.message || 'Đăng nhập thất bại' });
        }

        const token = generateToken(data.user.id);
        return res.json({
            success: true,
            message: "Đăng nhập thành công!",
            user: {
                id: data.user.id,
                username: email.split('@')[0],
                email: email,
                package: VIP_SUBSCRIPTION.package_name,
                max_devices: VIP_SUBSCRIPTION.max_devices
            },
            token: token
        });
    } catch (err) {
        return res.json({ success: false, message: 'Lỗi server: ' + err.message });
    }
});

// Profile - always return VIP (like original backend)
app.all('/profile.php', (req, res) => {
    return res.json({
        success: true,
        message: "Lấy hồ sơ thành công.",
        data: {
            user: { id: 388, username: "VIP User", email: "vip@ultimate.com", created_at: "2026-01-15 13:28:38", status: "active" },
            subscription: {
                package_name: "Gói Doanh Nghiệp",
                start_date: "2026-01-15 13:28:38",
                end_date: "2099-12-31 23:59:59",
                status: "active",
                package_id: "13"
            }
        }
    });
});


// Check Session
app.all('/check_session.php', (req, res) => {
    return res.json({ success: true, isValid: true });
});

// Transaction History
app.all('/get_transaction_history.php', (req, res) => {
    return res.json({ success: true, message: "Lấy lịch sử giao dịch thành công.", data: { transactions: [], total: 0 } });
});

// Cookie Data
app.all('/cookie_data.json', (req, res) => {
    return res.json(cookieData);
});

// prf2 - Cookie Manager
app.get('/prf2.php', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookie Manager</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .container { background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; max-width: 600px; width: 100%; }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; text-align: center; }
        .subtitle { color: #666; text-align: center; margin-bottom: 30px; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; color: #333; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
        textarea { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; resize: vertical; }
        textarea:focus { outline: none; border-color: #667eea; }
        textarea.cookie-value { min-height: 150px; }
        textarea.bearer-token { min-height: 100px; }
        .button-group { display: flex; gap: 12px; margin-top: 30px; }
        button { flex: 1; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
        .btn-submit { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }
        .btn-clear { background: #f0f0f0; color: #666; }
        .result { margin-top: 30px; padding: 20px; border-radius: 8px; display: none; }
        .result.success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .result.error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 25px; border-radius: 4px; }
        .info-box p { color: #1565c0; font-size: 13px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍪 Cookie Manager</h1>
        <p class="subtitle">Nhập Cookie và Bearer Token để lưu trữ</p>
        <div class="info-box"><p>💡 Cookie và Bearer Token sẽ được lưu và sử dụng trong 50 phút.</p></div>
        <form id="cookieForm">
            <div class="form-group">
                <label for="cookieValue">Cookie Value *</label>
                <textarea id="cookieValue" class="cookie-value" placeholder="Nhập cookie value (ví dụ: _ga_X2GNH8R5NS=...)" required></textarea>
            </div>
            <div class="form-group">
                <label for="bearerToken">Bearer Token *</label>
                <textarea id="bearerToken" class="bearer-token" placeholder="Nhập bearer token (ví dụ: Bearer ya29.a0...)" required></textarea>
            </div>
            <div class="button-group">
                <button type="submit" class="btn-submit" id="submitBtn">💾 Lưu Cookie</button>
                <button type="button" class="btn-clear" onclick="clearForm()">🗑️ Xóa</button>
            </div>
        </form>
        <div id="result" class="result"></div>
    </div>
    <script>
        document.getElementById('cookieForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const cookieValue = document.getElementById('cookieValue').value.trim();
            const bearerToken = document.getElementById('bearerToken').value.trim();
            const submitBtn = document.getElementById('submitBtn');
            if (!cookieValue || !bearerToken) { showResult('error', 'Vui lòng nhập đầy đủ!'); return; }
            submitBtn.disabled = true; submitBtn.textContent = '⏳ Đang lưu...';
            try {
                const response = await fetch(window.location.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save_cookie', cookie: { value: cookieValue, bearerToken: bearerToken } }) });
                const data = await response.json();
                if (data.success) { showResult('success', '✅ ' + data.message); setTimeout(clearForm, 2000); }
                else { showResult('error', '❌ ' + data.message); }
            } catch (error) { showResult('error', '❌ Lỗi: ' + error.message); }
            finally { submitBtn.disabled = false; submitBtn.textContent = '💾 Lưu Cookie'; }
        });
        function showResult(type, message) { const r = document.getElementById('result'); r.className = 'result ' + type; r.innerHTML = message; r.style.display = 'block'; setTimeout(() => r.style.display = 'none', 5000); }
        function clearForm() { document.getElementById('cookieValue').value = ''; document.getElementById('bearerToken').value = ''; document.getElementById('result').style.display = 'none'; }
    </script>
</body>
</html>`);
});

app.post('/prf2.php', (req, res) => {
    if (req.body?.action === 'save_cookie' && req.body?.cookie) {
        cookieData = { last_update: Date.now(), cookie: req.body.cookie };
        return res.json({ success: true, message: "Cookie đã được lưu thành công!" });
    }
    return res.json({ success: false, message: "Invalid request" });
});

// ============ ADDITIONAL API ENDPOINTS ============

// /api/fee - Fee/subscription info
app.all('/api/fee', (req, res) => {
    return res.json({ success: true, data: { fee: 0, subscription: "Enterprise", active: true } });
});

// /api/gen - Generation endpoint
app.all('/api/gen', (req, res) => {
    return res.json({ success: true, data: { remaining: 99999, used: 0, limit: 99999 } });
});

// /api/trp - Transaction/trip endpoint  
app.all('/api/trp', (req, res) => {
    return res.json({ success: true, data: { transactions: [], total: 0 } });
});

// Catch-all for any other /api/* endpoints
app.all('/api/*', (req, res) => {
    console.log('Unknown API endpoint called:', req.path);
    return res.json({ success: true, data: {} });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ success: true, message: "VEO Backend API", version: "1.0.0", endpoints: ["/login.php", "/profile.php", "/check_session.php", "/prf2.php", "/api/fee", "/api/gen", "/api/trp"] });
});


// Start server
app.listen(PORT, () => {
    console.log(`VEO Backend running on port ${PORT}`);
});
