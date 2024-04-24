window.addEventListener('load', () => {
    const formEl = document.querySelector('form')
    const errorSpan = document.querySelector('span.form-error')
    formEl.addEventListener('submit', async (event) => {
        event.preventDefault()
        const formdata = Object.fromEntries(new FormData(formEl))

        const user = await fetch(formEl.action, {
            method: formEl.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formdata)
        })
            .then(async response => {
                if(response.ok) {
                    return response.json()
                }
                throw await response.json()
            })
            .catch(error => {
                errorSpan.innerHTML = error.message
            })
        
        if(user) {
            sessionStorage.setItem('token', user.token)

            document.location.href = '/'
        }
    })
})