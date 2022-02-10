// const match = require("./models/match")
const matchSchemas = require("./models/match")
const User = require("./models/user")
const Queue = require("./models/queue")
const trueskill = require("trueskill")

var ladder = 'abc'
let queue = []
let ongoingMatches = []
let gameId = 0
let matches = []            // stand in for match db?

let on = false

function getQueueLength(){
    return queue.length
}

function doMatchmaking(queue){
    while (on){
        if(length(queue) < 2){
            waitForQueueUpdate()
        }
        // queue.sortbytimeinqueue // queue is sorted by default simply by pushing 

        queueByELO.find(queue[0].eloRange)

        
    }
}

async function addPlayer(player){
    if (player.user.inGame) {
        player.res.write("data: Report results from your previous match then refresh.\n\n")
    } else {
        if( !queue.includes(player) ){
            let text = getQueueLength() + " other players in queue"
            for(i=0; i<queue.length; i++){
                queue[i].res.write(`data: ${text}\n\n`)
            }
            queue.push(player)
            player.user.inQueue = true
            await player.user.save()
        }
        if (!on) {
            fifoQueue()
        }
        console.log("done") //debug
    }
}

function reconnectPlayerToQueue(player) {
    let playerToBeUpdated = queue.find(obj => obj.user.username == player.user.username)
    // console.log(playerToBeUpdated)
    playerToBeUpdated.res = player.res
    playerToBeUpdated.res.write("wassup we reconnected you")

}

// function fifoQueue(){
//     if(length(queue) < 2){

//     }
//     try{
//         match(queue[0], queue[1])
//     }catch{

//     }
// }

// function delay(time) {
//     return new Promise(resolve => setTimeout(resolve, time));
// }

function matchFirstTwo(){
    if(length(queue) > 1){
        pair(queue[0], queue[1])
    } 
}

function fifoQueue(){
    while(true){
        if(queue.length > 1){
            try{
                on = true
                console.log("trying pair")
                pair(queue[0], queue[1])
            } catch(err){
                console.log("match() failed despite >1 in queue \n" + err)
            }
        } else if(queue.length == 1){
            // queue[0].res.write("no one else in queue")
            console.log("after write, before break") //debug
            on = false
            break
            // await new Promise(resolve => setTimeout(resolve, 5000))
        } else{
            on = false
            break
        }
    }
}
    // setTimeout(console("Can i remove this console.log?"), 5000)
    //break
    // setTimeout(fifoQueue(), 5000)

// what happens if someone closes browser 
async function save(thingToSave){
    await thingToSave.save()
    console.log("SAVED SAVED SAVED SAVED SAVED SAVED ")
}

async function pair(player1, player2){

    console.log("in pair") // debug
    text = "Your opponent is: " + player2.user.username
    player1.res.write(`data: ${text}\n\n`)
    player1.res.write(`data: matched\n\n`)
    player1.res.end()

    text = "Your opponent is: " + player1.user.username
    player2.res.write(`data: ${text}\n\n`)
    player2.res.write(`data: matched\n\n`)
    player2.res.end()
    
    console.log("wrote stuff")
    const currentPair = new matchSchemas.match({
        player1 : player1.user.id,
        player2 : player2.user.id
    })
    save(currentPair)
    player1.user.inGame = true
    player2.user.inGame = true

    player1.user.inQueue = false
    player2.user.inQueue = false

    player1.user.opponent = player2.user.username
    player2.user.opponent = player1.user.username
    // await player1.user.save()
    // await player2.user.save()
    save(player1.user)
    save(player2.user)
    
       
    // removePlayersFromQueue()
    queue.splice(0,2)
}


async function matchesToHtmlForms(res){    
    // player 1 and 2 are user objects. Set name/key to gameId. Set form info/result/value to user Id
    // Set post route to /gameId
    
    // loop through db instead
    matchSchemas.match.find({} , async (err, matches) => {
        let html = ''
        if(err){
            console.log(err)
        } 
        await Promise.all(
            matches.map(async match => {          // Make async
            console.log("match")
            console.log("match: " + match)
            let p1 = await User.findById(match.player1)
            let p2 = await User.findById(match.player2)
            let p1gameId = match.player1 + ' ' + match.player2 + ' ' + match.id   // winner loser gameId
            let p2gameId = match.player2 + ' ' + match.player1 + ' ' + match.id   // winner loser gameId

            html += `<form action="/results" method="POST" id="${match.id}"` 
            html += `onsubmit="return formSubmit('${match.id}')">`
            html += `<input type="radio" id="${p1.id}" name="result" value="${p1gameId}" required>`
            html += `<label for=${p1.id}>${p1.username}</label>`
            html += `<span>&nbspVs&nbsp</span>`
            html += `<label for=${p2.id}>${p2.username}</label>`
            html += `<input type="radio" id=${p2.id} name="result" value="${p2gameId}"><br>`
            html += `<button class="btn btn-primary" type="submit">Submit Result</button>`
            html += `</form><br>`
            })
        )
        // console.log(html)
        res.write(`data: ${html}\n\n`)
    })
}

async function gameFinished(body, res){
    
    const [winner, loser, matchId] = body.split(' ') // SPLIT GAMEID

    // let game = await matchSchemas.match.findById(matchId)

    newHistory = matchSchemas.history({
        winner : winner,
        loser : loser,
    })

    await save(newHistory)
    updateElo(winner, loser)
    ladderToHtml()

    try{
        await matchSchemas.match.deleteOne({_id : matchId})
    } catch (error){
        console.log(error)
    }
    // res.redirect('/admin') // use to catch errors?
}

async function updateElo(winnerId, loserId){   // +1 to games as well 
    let winner = await User.findById(winnerId)
    let loser = await User.findById(loserId)
    winner.games += 1
    loser.games += 1

    let updatedWinner = {"skill" : winner.trueskill, "rank" : 1 }
    let updatedLoser = {"skill" : winner.trueskill, "rank" : 2 }

    trueskill.AdjustPlayers([updatedWinner, updatedLoser])

    winner.trueskill = updatedWinner.skill
    loser.trueskill = updatedLoser.skill

    winner.inGame = false
    loser.inGame = false

    winner.opponent = null
    loser.opponent = null

    await winner.save()
    await loser.save()
}

async function ladderToHtml(){
    players = await User.find({ games : {$gt : 0} })           // min games should be 1
    .sort({"trueskill" : -1, "elo" : -1, "games" : -1})
    .select('username elo trueskill games')
    
    // console.log("ladder players: " + players) //debug
    let html = `
    <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Character</th>
        <th>ELO</th>
        <th>Trueskill</th>
        <th>Games</th>
    </tr>`
    players.map((player, index) => {
        let skill = player.trueskill[0].toFixed(2)
        let uncertainity = player.trueskill[1].toFixed(2)
        html += `<tr>
        <td>${index + 1}</td>
        <td>${player.username}</td>
        <td></td>
        <td>${player.elo}</td>
        <td>${[skill, uncertainity]}</td>
        <td>${player.games}</td>
    </tr>`
    })
    // return html
    ladder = html
    console.log("ladderToHtml ladder var: " + ladder)
    console.log("ladderToHtml html var: " + html)
    console.log("ran ladderToHtml")
}

function openQueue(){

}
function closeQueue(){
    // delete/notify about ongoing games 
}

function getLadder(){ return ladder}

exports.ladderToHtml = ladderToHtml
exports.matchesToHtmlForms = matchesToHtmlForms
exports.addPlayer = addPlayer
exports.fifoQueue = fifoQueue
exports.gameFinished = gameFinished
exports.getQueueLength = getQueueLength
exports.reconnectPlayerToQueue = reconnectPlayerToQueue
exports.getLadder = getLadder

async function run(){  // set all users to not in queue 
    await User.updateMany({"inQueue": true}, {"$set":{"inQueue": false}})
    // await User.updateMany({"inGame": true}, {"$set":{"inGame": false}})
    console.log("inQueue: false")
}

async function setAdmin(){
    await User.updateOne({"username": "admin"}, {"$set":{"admin": true}})
}

ladderToHtml()
run()
setAdmin()