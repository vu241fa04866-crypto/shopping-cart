require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRoutes')
const connectDb = require('./config/db')
const cartRouter = require('./routes/cartRoutes')
const app = express()
const port = Number(process.env.PORT) || 3000
const allowedOrigins = (process.env.ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Set it in server/.env.')
}

app.use(express.json({ limit: '1mb' }))
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin === 'https://shopping-cart-mern-yo9j.vercel.app') {
            return callback(null, true)
        }
        return callback(new Error('Origin is not allowed by CORS.'))
    },
    credentials: true
}))
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/cart', cartRouter)

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Shopping Cart API is running.' })
})

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' })
})

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' })
    }
    const status = error.message === 'Origin is not allowed by CORS.' ? 403 : 500
    if (status === 403) {
        console.warn(error.message)
    } else {
        console.error(error)
    }
    return res.status(status).json({
        success: false,
        message: status === 403 ? error.message : 'An unexpected server error occurred.'
    })
})

const start = async () => {
    await connectDb()
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}

if (require.main === module) {
    start().catch((error) => {
        console.error('Unable to start the server:', error)
        process.exitCode = 1
    })
}

module.exports = { app, start }