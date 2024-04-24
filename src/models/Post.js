import db from '../services/db.js'

export default class Post {
    /**
     * The post ID in Databases
     */
    id
    /**
     * The creator of the post
     */
    owner

    /**
     * The parent of the post (if it's a comment)
     */
    parent

    /**
     * The text content of the post
     */
    content

    constructor(owner, content, parent = null) {
        this.owner = owner
        this.content = content
        this.parent = parent
    }

    /**
     * Recréer une instance d'un post a partir d'un JSON
     * @param {{id?: number, owner: number, content: string, parent?: number}} json
     * @returns {Post}
     */
    fromJSON(json) {
        const post = new Post(json.owner, json.content, json.parent)
        post.id = json.id
        return post
    }

    /**
     * Sauvegarde un post en base
     * @returns {Promise<Post | undefined>}
     */
    async save() {
        const dbClient = await db()
        // Si le post a un identifiant alors il existe déjà en BDD
        if(this.id) {
            const post = dbClient.query(
                'UPDATE "post" SET owner = $2, content = $3, parent = $4 WHERE id = $1 RETURNING *'
            ).then(result => result.rows[0])
            .then(Post.fromJSON)
            return post
        } else {
            const post = dbClient.query(
                'INSERT INTO "post" (owner, content, parent) VALUES ($1, $2, $3) RETURNING *',
                [this.owner, this.content, this.parent]
            ).then(result => result.rows[0])
            .then(Post.fromJSON)
            return post
        }
    }

    /**
     * Retrouver un post par son identifiant en base de données.
     * @param {Number} id Id d'un post
     * @returns {Promise<Post | undefined>}
     */
    static async findById(id) {
        // Récupération de la connection a la BDD
        const dbClient = await db()
        // Requêtes pour récupérer les posts avec le username et le password
        const post = dbClient.query(
            'SELECT * FROM "view_post" WHERE id=$1 LIMIT 1',
            [id]
        ).then(result => result.rows[0]) // extraction de la première ligne seulement (undefined si il n'y a pas de retours)
        .then(Post.fromJSON) // Transformation de l'utilisateur JSON (retour de la BDD) en object User
        
        return post // Ici un objet User ou undefined
    }

    /**
     * Retrouver les posts d'un utilisateur en base de données.
     * @param {Number} owner Id d'un utilisateur
     * @returns {Promise<Post[]>}
     */
    static async findByOwner(owner) {
        const dbClient = await db()
        const post = dbClient.query(
            'SELECT * FROM "view_post" WHERE owner=$1',
            [owner]
        ).then(result => result.rows[0])
        .then(Post.fromJSON)
        
        return post
    }

    /**
     * Retrouver les posts les plus likés en base de données.
     * @returns {Promise<Post[]>}
     */
    static async findTrending() {
        const dbClient = await db()
        const posts = dbClient.query(
            'SELECT * FROM "view_post_trending"'
        ).then(result => result.rows)
        
        return posts
    }
    /**
     * Retrouver les posts les plus récents en base de données.
     * @returns {Promise<Post[]>}
     */
    static async findNewest() {
        const dbClient = await db()
        const posts = dbClient.query(
            'SELECT * FROM "view_post_newest"'
        ).then(result => result.rows)
        
        return posts
    }

}

