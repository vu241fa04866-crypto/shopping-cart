const express = require('express')
const { register, login, googleLogin, getUser, logout } = require('../controllers/authController')
const verifyToken = require('../middlewares/verifyToken')
const authRouter = express.Router()


authRouter.post("/register",register)
authRouter.post("/login",login)
authRouter.post("/google",googleLogin)
authRouter.get("/user",verifyToken,getUser)
authRouter.get("/logout",logout)

module.exports = authRouter