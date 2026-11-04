const jwt = require('jsonwebtoken')
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to continue.'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.id = decoded.id
        return next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Your session has expired. Please log in again.'
            })
        }
        return next(error)
    }
}

module.exports = verifyToken