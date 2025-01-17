const jwt = require('jsonwebtoken');

//Allow all
exports.authenticateAll = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        
        next();

    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};



//Allow only instructors
exports.authenticateInstructors = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.role !== 'instructor'){
            return res.status(401).json({ message: 'Access denied. Only instructors allowed!.' });
        }

        req.user = decoded;
        next();

    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
