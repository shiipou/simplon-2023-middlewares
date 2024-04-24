window.addEventListener('DOMContentLoaded', async () => {
    const mainEl = document.querySelector('main')
    mainEl.innerText = ''

    const token = sessionStorage.getItem('token')
    if(token) {
        const user = await fetch(`/users/current`, {
            headers: {
                'Authorization': `${token}`
            }
        })
            .then(async response => {
                if(response.ok){
                    return response.json()
                }
                throw await response.json()
            })
            .catch(error => {
                mainEl.innerText = error.message
            })

        if(user) {
            mainEl.innerHTML = `<aside>
    <div>Username: ${user.username}</div>
</aside>
`
        }
    } else {
        mainEl.innerHTML = `<aside>
    <div><a href="/login.html"><button>Login</button></a></div>
</aside>
`
    }

    const posts = await fetch(`/posts/trending`)
        .then(async response => {
            if(response.ok) {
                return response.json()
            }
            throw await response.json()
        })
        .catch(error => {
            mainEl.innerText = error.message
        })
    mainEl.innerHTML += posts.filter(post=>post.content && !post.parent).map(post => `
<article>
        <span>${post.owner}</span>
        <div>
            ${post.content}
        </div>
</article>
`).join('')
})