function toggleHidden(ids){
    if(typeof(ids) == "array"){
        for(i=0; i < ids.length; i++){
            element = document.getElementById(ids[i])
            element.classList.toggle("hidden")
        }
    } else{
        element = document.getElementById(ids)
        oneFormOnly(ids)
        element.classList.toggle("hidden")
    }
}

function focusField(id){
    document.getElementById(id).focus()
}

function oneFormOnly(id){
    element = document.getElementById(id)
    signUpForm = document.getElementById('signUpForm')
    logInForm = document.getElementById('logInForm')
    signUpOpen = !signUpForm.classList.contains('hidden')
    logInOpen = !logInForm.classList.contains('hidden')

    if( element == signUpForm && logInOpen){
        logInForm.classList.toggle('hidden')
    }else if( element == logInForm && signUpOpen){
        signUpForm.classList.toggle('hidden')
    }
}

function ladder(){   // set all buttons and forms to display:none. create btn class
    // let btn = document.getElementById(id)
    // btn.disabled = true
    // btn.innerHTML = "Added to Queue"

    var xhttp = new XMLHttpRequest
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){

            const table = document.createElement("table");
            table.className = 'container'
            table.innerHTML = this.response;
            document.body.appendChild(table)
        }
    }
    xhttp.open("GET", "http://localhost:3000/ladder", true)
    xhttp.send()
}

function loggedInView(){
    document.getElementById().style.display = "none"
}
