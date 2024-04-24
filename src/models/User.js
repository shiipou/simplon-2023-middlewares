import db from '../services/db.js'

export default class User {
    /**
     * The user ID in Databases
     */
    id
    /**
     * The user's pseudonyme
     */
    username

    /**
     * The user's display name
     */
    name

    /**
     * The user's password
     */
    password

    constructor(username, name, password) {
        this.username = username
        this.name = name
        this.password = password
    }

    /**
     * Recréer une instance d'un utilisateur a partir d'un JSON
     * @param {{id?:number, name?:string, username:string, password:string}} json 
     * @returns {User}
     */
    fromJSON(json) {
        console.log(json)
        const user = new User(json.username, json.name, json.password)
        user.id = json.id
        return user
    }

    /**
     * Sauvegarde un utilisateur en base
     * @returns {Promise<User | undefined>}
     */
    async save() {
        const dbClient = await db()
        // Si l'utilisateur a un identifiant alors il existe déjà en BDD
        if(this.id) {
            const user = dbClient.query(
                'UPDATE "user" SET username = $2, name = $3, password = $4 WHERE id = $1 RETURNING *',
                [this.id, this.username, this.name, this.password]
            ).then(result => result.rows[0])
            .then(User.fromJSON)
            return user
        } else {
            const user = dbClient.query(
                'INSERT INTO "user" (username, name, password) VALUES ($1, $2, $3) RETURNING *',
                [this.username, this.name, this.password]
            ).then(result => result.rows[0])
            .then(User.fromJSON)
            return user
        }
    }

    /**
     * Retrouver un utilisateur par son identifiant en base de données.
     * @param {Number} id Id d'un utilisateur
     * @returns {Promise<User | undefined>}
     */
    static async findById(id) {
        // Récupération de la connection a la BDD
        const dbClient = await db()
        // Requêtes pour récupérer les utilisateurs avec le username et le password
        const user = dbClient.query(
            'SELECT * FROM "user" WHERE id=$1',
            [id]
        ).then(result => result.rows[0]) // extraction de la première ligne seulement (undefined si il n'y a pas de retours)
        .then(User.fromJSON) // Transformation de l'utilisateur JSON (retour de la BDD) en object User
        
        return user // Ici un objet User ou undefined
    }

    /**
     * Retrouver un utilisateur par son email et son mot de passe en base de données.
     * @param {string} username pseudo d'un utilisateur
     * @param {string} password mot de passe d'un utilisateur
     * @returns {Promise<User | undefined>}
     */
    static async findByUsernameAndPassword(username, password) {
        // Récupération de la connection a la BDD
        const dbClient = await db()
        // Requêtes pour récupérer les utilisateurs avec le username et le password
        const user = await dbClient.query(
            'SELECT * FROM "user" WHERE LOWER(username) = LOWER($1) and password = $2',
            [username, password]
        ).then(result => result.rows[0])
        .then(User.fromJSON)

        return user
    }
}

