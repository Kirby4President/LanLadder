if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const bcyrpt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(passport,
    username => user.findOne({username : username}),
    id => user.findOne({_id : id}))
// user.find(user => user.username === username)) 
const indexRouter = require('./routes/index')
// const adminRouter = require('./routes/admins')

// setting view engine as ejs. Setting views and layout locations
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended: false})) //limit: '10mb'
// app.use(bodyParser.urlencoded({extended: false})) //limit: '10mb'
app.use(flash())
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

const mongoose = require('mongoose')
const user = require('./models/user')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser : true })
    // youtube comment suggestion to fix "depreciation error" when using .config()
    //  useUnifiedTopology : true       

// checking the connection?
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log("Connected to Mongoose"))

app.use('/', indexRouter)
// app.use('/admin', adminRouter)



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

app.listen(process.env.PORT || 3000)
