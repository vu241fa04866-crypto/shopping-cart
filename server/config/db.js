const mongoose = require('mongoose')

const connectDb = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required.')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Database connected.')
}

module.exports = connectDb