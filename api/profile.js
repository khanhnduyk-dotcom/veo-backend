const { verifyToken, VIP_SUBSCRIPTION } = require('./_config');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Get token from header or query
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '') || req.query?.token;

        const tokenData = verifyToken(token);

        if (!tokenData) {
            return res.json({
                success: false,
                message: "Token không hợp lệ"
            });
        }

        // Return profile with VIP subscription
        return res.json({
            success: true,
            message: "Lấy hồ sơ thành công.",
            data: {
                user: {
                    id: tokenData.userId,
                    username: "VIP User",
                    email: "vip@ultimate.com",
                    created_at: new Date().toISOString(),
                    status: "active"
                },
                subscription: {
                    package_name: VIP_SUBSCRIPTION.package_name,
                    start_date: VIP_SUBSCRIPTION.start_date,
                    end_date: VIP_SUBSCRIPTION.end_date,
                    status: VIP_SUBSCRIPTION.status,
                    package_id: VIP_SUBSCRIPTION.package_id
                }
            }
        });

    } catch (err) {
        console.error('Profile error:', err);
        return res.json({
            success: false,
            message: 'Lỗi server: ' + err.message
        });
    }
};
