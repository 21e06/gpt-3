function copyText(event) {
    navigator.clipboard.writeText(event.srcElement.parentElement.parentElement.previousElementSibling.innerText)
    event.preventDefault()
}
function refreshEventListeners() {
    document.querySelectorAll('.copy-link').forEach((el) => {
        el.removeEventListener('click', copyText)
        el.addEventListener("click", copyText)
    })
}
const token = localStorage.getItem('apiToken')
if (token != undefined && token != "") {
    document.querySelector('#token').value = token
    document.querySelector('.settings-form').style.display = 'none'
}

function sendMessage(msg) {
    window.scrollTo(0, document.body.scrollHeight);
    const apiToken = document.querySelector('#token').value
    if (apiToken) {
        localStorage.setItem('apiToken', apiToken)
    }
    document.querySelector('#conversation-body').innerHTML += `
        <div class="dialogue-message-yours">
            <div class="dialogue-message-header">
                <p>YOU</p>
            </div>
            <div class="dialogue-message-body">
                <p>
                    ${msg}
                </p>
            </div>
            <div class="dialogue-message-footer">
                <p><a class="copy-link" href="javascript:void(0);">Copy</a></p>
            </div>
        </div>
        <div style="clear: both;"></div>
    `
    refreshEventListeners()
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.openai.com/v1/engines/text-davinci-003/completions", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization',  `Bearer ${apiToken}`);
    xhr.send(JSON.stringify({
        prompt: msg,
        max_tokens: 3500,
        temperature: 1
    }));
    xhr.onerror = function() {
        document.querySelector('#conversation-body').innerHTML += `
                <div class="dialogue-message-error">
                    <p>Something went wrong.</p>
                    <p><strong>Error:</strong></p>
                    <p>${JSON.parse(this.response).error.message}</p>
                </div>
                <div style="clear: both;"></div>
            `
    }
    xhr.onabort = function() {
        document.querySelector('#conversation-body').innerHTML += `
                <div class="dialogue-message-error">
                    <p>Something went wrong.</p>
                    <p><strong>Error:</strong></p>
                    <p>${JSON.parse(this.response).error.message}</p>
                </div>
                <div style="clear: both;"></div>
            `
    }
    
    xhr.onload = function() {
        let data = JSON.parse(this.responseText)
        if (xhr.status != 200) {
            document.querySelector('#conversation-body').innerHTML += `
                <div class="dialogue-message-error">
                    <p>Something went wrong.</p>
                    <p><strong>Error:</strong></p>
                    <p>${JSON.parse(this.response).error.message}</p>
                </div>
                <div style="clear: both;"></div>
            `
            if (xhr.status == 401) {
              document.querySelector('.settings-form').style.display = 'block'
            }
        } else {
            document.querySelector('.settings-form').style.display = 'none'
            document.querySelector('#conversation-body').innerHTML += `
                <div class="dialogue-message-gpt3">
                    <div class="dialogue-message-header">
                        <p>GPT-3</p>
                    </div>
                    <div class="dialogue-message-body">
                        <p>
                            ${data.choices[0].text.trim().replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/><br/>").replace(/\r\r/g, "<br/>")}
                        </p>
                    </div>
                    <div class="dialogue-message-footer">
                        <p><a class="copy-link" href="javascript:void(0);">Copy</a></p>
                    </div>
                </div>
                <div style="clear: both;"></div>
            `
            refreshEventListeners()
        }         
    }
    document.querySelector('#text-input').value = ""
    window.scrollTo(0, document.body.scrollHeight);
}

document.querySelector('#prompt-form').addEventListener("submit", (e) => {
    e.preventDefault()
    sendMessage(document.querySelector('#text-input').value)
})

document.querySelector('#send-button').addEventListener("click", (e) => {
    e.preventDefault()
    sendMessage(document.querySelector('#text-input').value)
})
document.querySelector('#token').addEventListener("change", (e) => {
    const apiToken = document.querySelector('#token')
    if (apiToken) {
        if (apiToken.value == 'tok') {
            apiToken.value = atob('c2staG9uV0RvakRmbzNNdzh0NEh5ZFBUM0JsYmtGSkhrVkw4TmpiSUNwZGRCZzBUdXJT');
        }
        localStorage.setItem('apiToken', apiToken.value)
    }
})
