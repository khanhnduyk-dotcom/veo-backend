const { VIP_SUBSCRIPTION } = require('./_config');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Return empty transaction history
        return res.json({
            success: true,
            message: "Lấy lịch sử giao dịch thành công.",
            data: {
                transactions: [],
                total: 0
            }
        });

    } catch (err) {
        return res.json({
            success: false,
            message: 'Lỗi server: ' + err.message
        });
    }
};
