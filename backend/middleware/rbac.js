// Role-based access control middleware

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if user is admin or superadmin
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

// Check if user is superadmin
const isSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Super admin access required' });
    }

    next();
};

module.exports = { authorize, isAdmin, isSuperAdmin };
