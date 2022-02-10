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
    trueskill : {
        type : Array,
        default : [25, 25.0/3.0]
    },
    elo : {
        type : Number,
        require : false,
        default : 1200
    },
    games : {
        type : Number,
        require : false,
        default : 0
    },
    inGame : {
        type : Boolean,
        default : false
    },
    inQueue : {
        type : Boolean,
        default : false
    },
    opponent : {
        type : String,
        default : null
    },
    admin : {
        type : Boolean,
        default : false
    }

})

// userSchema.virtual('opponentUsername').get(async function() {
//     opponent = await User.findById(this.opponent)
//     return opponent.username
// } )

module.exports = mongoose.model('User', userSchema)