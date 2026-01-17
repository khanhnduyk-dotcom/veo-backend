module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Return cookie data (mock for compatibility)
    return res.json({
        last_update: Date.now(),
        cookie: {
            value: "",
            bearerToken: ""
        }
    });
};
