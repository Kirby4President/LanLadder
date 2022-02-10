const mongoose = require("mongoose")
const User = require("./user")

const matchSchema = new mongoose.Schema({
    player1 : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : "User",
        required : true
    },
    player2 : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : "User",
        required : true
    },
    startTime : {
        type : Date,
        immutable : true,
        default: () => Date.now(),
    }

    // gameId : {
    //     type : Number,
    //     required : true
    // } 
})

matchSchema.methods.getP1Username = async function(){
    playerDocument = await User.find({id : this.player1})
    console.log(playerDocument)
    console.log(this.player1)
    return playerDocument.username
}
matchSchema.methods.getP2Username = async function(){
    playerDocument = await User.findById(this.player2)
    console.log("player2")
    console.log(this.player2)
    console.log(playerDocument)
    return playerDocument.username
}

const historySchema = new mongoose.Schema({
    winner : {
        type : mongoose.SchemaTypes.ObjectId,
        // type : String,
        required : true
    },
    loser : {
        type : mongoose.SchemaTypes.ObjectId,
        // type : String,
        required : true
    },
    endTime : {
        type : Date,
        immutable : true,
        default: () => Date.now()
    }
    // gameId : {
    //     type : Number,
    //     required : true
    // } 
})

// include chars, etc later ?


module.exports.match = mongoose.model('Match', matchSchema)
module.exports.history = mongoose.model('History', historySchema)