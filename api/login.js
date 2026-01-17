const { supabase, VIP_SUBSCRIPTION, generateToken } = require('./_config');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Get credentials from body or query
        const email = req.body?.email || req.query?.email;
        const password = req.body?.password || req.query?.password;

        if (!email || !password) {
            return res.json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc'
            });
        }

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.json({
                success: false,
                message: error.message || 'Đăng nhập thất bại'
            });
        }

        // Generate custom token for app
        const token = generateToken(data.user.id);

        // Return success response in expected format
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
        console.error('Login error:', err);
        return res.json({
            success: false,
            message: 'Lỗi server: ' + err.message
        });
    }
};
