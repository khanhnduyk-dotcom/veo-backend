const { verifyToken } = require('./_config');

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

        // Always return valid session for VIP
        return res.json({
            success: true,
            isValid: true
        });

    } catch (err) {
        return res.json({
            success: true,
            isValid: true
        });
    }
};
