// function reconnectToQueue(){
//     const eventSource = new EventSource("http://localhost:3000/queue")
//     eventSource.onmessage = onMessage
//     eventSource.onerror = onError
//     console.log("reconnectToQueue (client js)")
// }

// function queue(id){   // set all buttons and forms to display:none. create btn class
//     let btn = document.getElementById(id)
//     btn.disabled = true
//     btn.innerHTML = "Added to Queue"

//     const eventSource = new EventSource("http://localhost:3000/queue")
//     console.log("turned it on")
    
//     eventSource.onmessage = onMessage
//     eventSource.onerror = onError
// }

function updateMessage (message) {
    
    const item = document.getElementById('message')
    item.textContent = message
    console.log("this is in message: " + message)
}

function onMessage (event) {
    console.log("event:" + event)
    if (event.matched){
        
    }
    updateMessage(event.data)
}

function onError () {
    // updateMessage('Server closed connection')
    eventSource.close()
}

exports.updateMessage = updateMessage
exports.onMessage = onMessage
exports.onError = onError