const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')

function wrapAsync(fn) {
    return (req, res, next) => fn(req, res, next).catch(next)
}



router.get('/', (req, res) => {

    // if (req.body.username != null){
    //     console.log("not null")
    // }
    try{
        res.render('index.ejs', { user : new User(), username : req.user.username })
    }catch{
        res.render('index.ejs', { user : new User()})         // , { user : new User() }
    }
})

// add to queue. Needs check authenticated
router.post('/queue', (req, res) => {
    res.send("queue")
})


// router.post('/', (req, res) => {
//     const user = new User({
//             username: req.body.username,
//             password: req.body.password,
//             email: req.body.email
//         })
    
//     res.send(user.username)
// })

// create account
router.post('/register', wrapAsync(async (req, res) => {
    
    try {
        console.log("trying")
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        console.log("hashed pass")
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email
        })
        console.log("Created User")

        try {
            const newUser = await user.save()
            console.log("Saved User")
            res.redirect('/')
            console.log("Redirected to /")
        } catch(err) {
            console.log("Caught error while saving user", err)
        }
    } catch(err) {
        console.log("Caught error", err)
        res.render('index', {
            user : user,
            errorMessage : 'Error creating user'
        })
    }
}))

router.get('/login', (req, res) => {
    res.send(req.user.username)
    console.log(req)
    console.log(req.user.username)
})

router.post('/login', passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect : '/',
    failureFlash : true
}))

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

// router.post('register', async (req, res) => {
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password,
//         email: req.body.email
//     })
//     try {
//         const newUser = await user.save()
//         console.log("It worked")
//         res.redirect('/')
//     } catch {
//         res.render('index', {
//             user : user,
//             errorMessage : 'Error creating account'
//         })
//     }
// })


// login
// refresh ladder

module.exports = router