const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const user = require('./models/user')            
// change following 'user's to newUser or something?

// async function getUserByUsername(username, currentUser){

//     console.log(await user.find({username : "wrong"}), username)
//     currentUser = await user.find({username : username})

    // try{
    //     user = await user.find({username : username})
    //     return user
    // } catch {
    //     console.log("returning null")
    //     return null
    // }
// }

async function initialize(passport, getUserByUsername, getUserById){
    const authenticateUser = async (username, password, done) => {
        const currentUser = await getUserByUsername(username)    
        // const currentUser = await user.findOne({username : username})
        // await getUserByUsername(username, currentUser)
        console.log("current user variable:", currentUser)
        if (currentUser == null) {
            return done(null, false, { message : "No user with that username"})
        }

        try{
            // console.log(password, currentUser.password)
            // console.log(user)
            if (await bcrypt.compare(password, currentUser.password)) {
                return done(null, currentUser)
            } else {
                return done(null, false, { message : "Wrong password"})
            }
        } catch(err) {
            return done(err) 
        }
    }
    passport.use(new LocalStrategy({ usernameField : 'loginUsername', passwordField : 'loginPassword' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        // console.log(id)
        test = await getUserById(id)
        // console.log(test)
        return done(null, test)
    })
}

module.exports = initialize