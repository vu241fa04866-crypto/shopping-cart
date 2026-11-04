const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:100
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        maxlength:254,
        unique:true
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    password:{
        type:String,
        required:function () {
            return !this.googleId
        },
        minlength:8
    },
    cart: [
        {
            id: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, default: '' },
            image: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            category: { type: String, default: '' },
            quantity: { type: Number, default: 1, min: 1, max: 99 }
        }
    ]
})

const User = mongoose.model('user',userSchema)

module.exports = User