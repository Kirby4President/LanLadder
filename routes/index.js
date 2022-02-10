const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const matchmaking = require('../matchmaking')
const { redirect } = require('express/lib/response')
// const { format } = require('express/lib/response')
// const { count } = require('../models/user')

const http = require('http')
const { send } = require('process')


function wrapAsync(fn) {
    return (req, res, next) => fn(req, res, next).catch(next)
}


router.get('/', (req, res) => {

    if(req.isAuthenticated()) {
        if(req.user.admin) {
            res.redirect('/admin')
        } else if(req.user.inQueue){
            res.render('inQueue.ejs', {user : req.user})
            console.log("went this way")
        } else if(req.user.inGame) {
            res.render('inGame.ejs', {user : req.user} )
        } else{
            res.render('authIndex.ejs', {user : req.user} ) // {loginUser : req.user, createUser : new User()}
        }
    }else if(typeof(req.user) == "undefined"){
        res.render('index.ejs', { user : new User()} )     
    }else{
        res.render('index.ejs', { user : req.user} )
    }
})

router.get('/queues', (req, res) => {
    console.log('Client connected')
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Access-Control-Allow-Origin', '*')
  
    let text = matchmaking.getQueueLength() + " other players in queue"
    console.log(text)
    res.write(`data: ${text}\n\n`)
  })


router.get('/queue', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Access-Control-Allow-Origin', '*')

    
    const obj = {"user" : req.user, "res" : res}
    
    if(!req.user.inQueue){
        let text = matchmaking.getQueueLength() + " other players in queue"
        res.write(`data: ${text}\n\n`)  
        console.log(`${req.user.username} going into matchmaking`)
        matchmaking.addPlayer(obj)
    } else{
        let text = matchmaking.getQueueLength() - 1 
        let text2 = " other players in queue"
        res.write(`data: ${text + text2}\n\n`) 
        matchmaking.reconnectPlayerToQueue(obj)
    }


    // res.on('close', () => {
    //     res.end()
})

router.get('/queue-length', (req, res) => {
    res.send(matchmaking.getQueueLength())

})


// add to queue. Needs check authenticated
router.post('/queue', (req, res) => {
    res.redirect('/queue')
    // render user specific/dynamic index page 
})

// create account
router.post('/register', wrapAsync(async (req, res) => {
    
    let user = new User({
        username: req.body.username,
        email: req.body.email
    })

    if(await User.exists({"username": req.body.username})){
        res.render('index', {
            user : user,
            errorMessage : 'username already in use'
        })
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        user.password = hashedPassword
        try {
            await user.save()
            // passport.authenticate('local')
            req.login(user, function (err) {
                if ( ! err ){
                    res.redirect('/');
                } else {
                    //handle error
                }
            })
        } catch(err) {
            console.log("Caught error while saving user", err)
        }
    } catch(err) {
        console.log("Caught error hashing pass", err)
        res.render('index', {
            user : user,
            errorMessage : 'Error creating user'
        })
    }
}))

// req.login(user, function (err) {
//     if ( ! err ){
//         res.redirect('/account');
//     } else {
//         //handle error
//     }
// })

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

router.get('/admin', (req, res) => {
    if(req.isAuthenticated()){
        console.log("authenticated")
        if(req.user.admin){
            res.render('admin.ejs')
        }
    }
    else{
        res.redirect('/')
    }
    // const html = matchmaking.matchesToHtmlForms()
    // console.log("sending html")
    // console.log(html)
    // res.send(html)

    // matchmaking.matchesToHtmlForms().then(html => res.send(html))
})

router.get('/results', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Access-Control-Allow-Origin', '*')

    matchmaking.matchesToHtmlForms(res)
})    

// posts for all the admin page forms 
router.post('/results', (req, res) => {
    console.log("req.body.result:")
    console.log(req.body.result)
    matchmaking.gameFinished(req.body.result, res)
})

router.get('/ladder', (req, res) => {
    // matchmaking.ladderToHtml().then(html => res.send(html))
    res.send(matchmaking.getLadder())   
})

router.post('/hell', (req, res) =>{
    res.send("hi this is the hell post router")
    console.log(req.body)
})
// router.get('/:username', (req, res) => {
//     res.render("index.ejs", {"loggedIn" : true})    
// })





module.exports = router