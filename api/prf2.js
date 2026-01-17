const fs = require('fs');
const path = require('path');

// In-memory cookie storage (Vercel serverless is stateless, so we use response for now)
let cookieData = {
    last_update: Date.now(),
    cookie: {
        value: "",
        bearerToken: ""
    }
};

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Handle POST - save cookie
    if (req.method === 'POST') {
        try {
            const body = req.body || {};

            if (body.action === 'save_cookie' && body.cookie) {
                cookieData = {
                    last_update: Date.now(),
                    cookie: {
                        value: body.cookie.value || "",
                        bearerToken: body.cookie.bearerToken || ""
                    }
                };

                return res.json({
                    success: true,
                    message: "Cookie đã được lưu thành công! Có hiệu lực trong 50 phút."
                });
            }

            return res.json({
                success: false,
                message: "Invalid request"
            });
        } catch (err) {
            return res.json({
                success: false,
                message: "Error: " + err.message
            });
        }
    }

    // Handle GET - serve Cookie Manager HTML page
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookie Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
            text-align: center;
        }
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            resize: vertical;
            transition: border-color 0.3s;
        }
        textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea.cookie-value {
            min-height: 150px;
        }
        textarea.bearer-token {
            min-height: 100px;
        }
        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
        }
        button {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-submit {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .btn-clear {
            background: #f0f0f0;
            color: #666;
        }
        .btn-clear:hover {
            background: #e0e0e0;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            border-radius: 8px;
            display: none;
        }
        .result.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .result.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        .info-box p {
            color: #1565c0;
            font-size: 13px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍪 Cookie Manager</h1>
        <p class="subtitle">Nhập Cookie và Bearer Token để lưu trữ</p>
        
        <div class="info-box">
            <p>💡 Cookie và Bearer Token sẽ được lưu và sử dụng trong 50 phút. Sau đó hệ thống sẽ tự động làm mới.</p>
        </div>

        <form id="cookieForm">
            <div class="form-group">
                <label for="cookieValue">Cookie Value *</label>
                <textarea 
                    id="cookieValue" 
                    name="cookieValue" 
                    class="cookie-value"
                    placeholder="Nhập cookie value (ví dụ: _ga_X2GNH8R5NS=...)"
                    required
                ></textarea>
            </div>

            <div class="form-group">
                <label for="bearerToken">Bearer Token *</label>
                <textarea 
                    id="bearerToken" 
                    name="bearerToken" 
                    class="bearer-token"
                    placeholder="Nhập bearer token (ví dụ: Bearer ya29.a0...)"
                    required
                ></textarea>
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
            
            if (!cookieValue || !bearerToken) {
                showResult('error', 'Vui lòng nhập đầy đủ Cookie Value và Bearer Token!');
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Đang lưu...';
            
            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'save_cookie',
                        cookie: {
                            value: cookieValue,
                            bearerToken: bearerToken
                        }
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showResult('success', '✅ ' + data.message);
                    setTimeout(() => {
                        clearForm();
                    }, 2000);
                } else {
                    showResult('error', '❌ ' + data.message);
                }
            } catch (error) {
                showResult('error', '❌ Lỗi: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Lưu Cookie';
            }
        });
        
        function showResult(type, message) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'result ' + type;
            resultDiv.innerHTML = '<div class="result-message">' + message + '</div>';
            resultDiv.style.display = 'block';
            
            setTimeout(() => {
                resultDiv.style.display = 'none';
            }, 5000);
        }
        
        function clearForm() {
            document.getElementById('cookieValue').value = '';
            document.getElementById('bearerToken').value = '';
            document.getElementById('result').style.display = 'none';
        }
    </script>
</body>
</html>`);
};
