window.addEventListener('DOMContentLoaded', async () => {
    const mainEl = document.querySelector('main')

    const token = sessionStorage.getItem('token')

    const user = await fetch(`/users/current`, {
        headers: {
            'Authorization': `${token}`
        }
    })
        .then(response => response.json())
        .catch(error => console.error(error))

    if(user) {
        mainEl.innerText = 'Bonjour ' + user.username
    } else {
        mainEl.innerText = 'Vous n\'êtes pas connecté à un compte'
    }
})