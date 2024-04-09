const users = []

export class User {
    /**
     * The user ID in Databases
     */
    id
    /**
     * The user's pseudonyme
     */
    username

    /**
     * The user's email address
     */
    email

    /**
     * The user's password
     */
    password

    constructor(username, email, password) {
        this.username = username
        this.email = email
        this.password = password
    }

    save() {
        const userIndex = users.findIndex(user=> user.id == this.id)
        if(userIndex != -1) {
            // Si l'utilisateur a été trouvé
            // On prends toutes les données de l'utilisateurs local
            // Et on les sauvegarde dans la base de données.
            users[userIndex] = this
        } else {
            this.id = users.length + 1
            users.push(this)
        }
    }

    static findById(id) {
        return users.find(user => user.id == id)
    }

    static findByUsernameAndPassword(username, password) {
       return users.find(user => user.username.toLowerCase() == username.toLowerCase() && user.password == password)
    }
}

new User('admin', 'admin@exmple.com', 'azerty123').save();
new User('test', 'test@exmple.com', 'qwerty123').save();
