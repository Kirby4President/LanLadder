const eventSource = new EventSource("http://localhost:3000/results")
eventSource.onmessage = onMessage
eventSource.onerror = onError

function updateMessage (message) {
    console.log("this is in message: " + message)
    
    const item = document.createElement('div')
    // item.textContent = message
    item.innerHTML = message

    const matchForms = document.getElementById('results')
    matchForms.appendChild(item)
}

function onMessage (event) {
    console.log("event:" + event)
    updateMessage(event.data)
}

function onError () {
    // updateMessage('Server closed connection')
    eventSource.close()
}

function formSubmit(id) {
    var form = document.getElementById(id)
    var data = new FormData(form)

    var result = document.querySelector('input[name="result"]:checked').value

    console.log("result: " + result)

    form.remove()
    
    // (B) AJAX
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/results", true);

    // What to do when server responds
    xhr.onload = function () { console.log(data); };
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(`result=${result}`);
    
    // (C) PREVENT HTML FORM SUBMIT
    return false;
}
