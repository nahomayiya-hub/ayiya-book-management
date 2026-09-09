const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // ✅ Get token from header
    const authHeader = req.headers.authorization;
    console.log("📩 Full Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ No Bearer token found");
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    console.log("🔑 Extracted Token:", token);

    try {
        const decoded = jwt.verify(token, 'mysecretkey');
        console.log("✅ Decoded Token:", decoded);

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        console.error("❌ Token verification error:", error.message);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };