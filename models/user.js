const mongoose = require('mongoose')

const userSchema = new mongoose.Schema ({
    username : {
        type: String,
        required : true
    }, 
    password : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : false
    },
    elo : {
        type : Number,
        require : false
    },
    games : {
        type : Number,
        require : false
    }
})

module.exports = mongoose.model('User', userSchema)