const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({ status: false, message: "Token is not valid" });
            }

            req.user = user;

            next();
        })
    } else {
        return res.status(401).json({ status: false, message: "You are not authenticated" });
    }
}


const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, (error) => {
        if (error) {
            return res.status(401).json({ success: false, message: 'Token verification failed' });
        }

        if (req.user.userType === "Client" || req.user.userType === "Vendor" || req.user.userType === "Admin" || req.user.userType === "Driver") {
            next();
        } else {
            return res.status(403).json({ status: false, message: "You are not allowed to perform this action" });
        }
    });
};


const verifyVendor = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userType === "Vendor" || req.user.userType === "Admin") {
            next();
        }else{
            return res.status(403).json({status: false, message: "You are not allowed to perfom this action"})
        }
    })
}

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userType === "Admin") {
            next();
        }else{
            return res.status(403).json({status: false, message: "You are not allowed to perfom this action"})
        }
    })
}
const verifyDriver = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.userType === "Driver") {
            next();
        } else {
            return res.status(403).json({ status: false, message: "You are not allowed to perform this action" });
        }
    });
};


module.exports = { verifyTokenAndAuthorization, verifyVendor, verifyAdmin,verifyToken,verifyDriver}