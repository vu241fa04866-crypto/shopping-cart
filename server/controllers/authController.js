const User = require("../models/user")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000
})

const register = async (req, res, next) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
        const password = typeof req.body.password === 'string' ? req.body.password : ''

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' })
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Enter a valid email address.' })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({ name, email, password: hashedPassword })

        return res.status(201).json({ success: true, message: 'Account created.' })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
        }
        return next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
        const password = typeof req.body.password === 'string' ? req.body.password : ''
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' })
        }

        const user = await User.findOne({ email })
        const validPassword = user && await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.cookie('token', token, cookieOptions())
        return res.status(200).json({ success: true, message: 'Login successful.' })
    } catch (error) {
        return next(error)
    }
}

const googleLogin = async (req, res, next) => {
    const credential = req.body?.credential
    if (typeof credential !== 'string' || credential.length === 0 || credential.length > 10000) {
        return res.status(400).json({ success: false, message: 'A valid Google credential is required.' })
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(503).json({
            success: false,
            message: 'Google sign-in is not configured. Add GOOGLE_CLIENT_ID to the server environment.'
        })
    }

    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const profile = ticket.getPayload()
        if (!profile?.sub || !profile.email || profile.email_verified !== true) {
            return res.status(401).json({ success: false, message: 'Google could not verify this account.' })
        }

        const email = profile.email.trim().toLowerCase()
        let user = await User.findOne({ googleId: profile.sub })
        if (!user) {
            user = await User.findOne({ email })
            if (user?.googleId && user.googleId !== profile.sub) {
                return res.status(409).json({
                    success: false,
                    message: 'This email is already connected to a different Google account.'
                })
            }
        }

        if (!user) {
            user = new User({
                name: profile.name || email,
                email,
                googleId: profile.sub
            })
        } else if (!user.googleId) {
            user.googleId = profile.sub
        }

        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.cookie('token', token, cookieOptions())
        return res.status(200).json({ success: true, message: 'Signed in with Google.' })
    } catch (error) {
        return next(error)
    }
}

const logout = (req, res) => {
    const { maxAge, ...options } = cookieOptions()
    res.clearCookie('token', options)
    return res.status(200).json({ success: true, message: 'Logged out successfully.' })
}

const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select('-password')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }
        return res.status(200).json({ success: true, user })
    } catch (error) {
        return next(error)
    }
}


module.exports = {
    register,
    login,
    googleLogin,
    logout,
    getUser
}