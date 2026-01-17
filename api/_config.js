const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gkhkerlxxoihfvgnexaq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraGtlcmx4eG9paGZ2Z25leGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDM4MzQsImV4cCI6MjA4MjY3OTgzNH0.a8Pyk2IQN3hjcsLlSHGV6yUPwL2Usnv6DrVtFrD60HQ';

// Google AI Key  
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY || 'AIzaSyBlm78HTo84G2wOTAQXaIXEgXsvzGTmWEo';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// VIP Subscription data (all users get VIP)
const VIP_SUBSCRIPTION = {
    package_name: "Gói Doanh Nghiệp",
    package_id: "13",
    start_date: new Date().toISOString(),
    end_date: "2099-12-31 23:59:59",
    status: "active",
    max_devices: 1000
};

// Generate simple token
function generateToken(userId) {
    const data = `${userId}_${Date.now()}_vip`;
    return Buffer.from(data).toString('base64');
}

// Verify token (basic implementation)
function verifyToken(token) {
    if (!token) return null;
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split('_');
        if (parts.length >= 2) {
            return { userId: parts[0], valid: true };
        }
    } catch (e) { }
    return null;
}

module.exports = {
    supabase,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    GOOGLE_AI_KEY,
    VIP_SUBSCRIPTION,
    generateToken,
    verifyToken
};
