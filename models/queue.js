const mongoose = require('mongoose')

const queueSchema = new mongoose.Schema ({
    queue : {
        type: Array,
        required : true
    }
})

module.exports = mongoose.model('Queue', queueSchema)