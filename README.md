## Qu'est-ce qu'un Middleware ?

Le middleware agit comme un pont entre les requêtes client entrantes et les réponses sortantes du serveur. C'est comme un intermédiaire utile qui intervient pour traiter, modifier ou augmenter les requêtes au fur et à mesure qu'elles arrivent dans votre application.

Exemple d'un Middleware :

```js
/**
 * requestLoggerMiddleware will log each access on this endpoint to the console
 * @param {Request} req is the request object that calls the endpoint
 * @param {Response} res is the response object to return to the client
 * @param {Function} next is a callback to call if the middleware must let the request continue
 */
function requestLoggerMiddleware(req, _res, next) {
  console.log(`Incoming request to ${req.path} from ${req.ip}`);
  next();
}

// If access log is enabled, then add the middleware to our express application
if (![undefined, '', 'false', '0'].includes(process.env.ACCESS_LOG?.toLowerCase())) {
  app.use(requestLoggerMiddleware);
}
```

Dans ce middleware, nous avons simplement affiché une ligne de log nommée "Access Log" qui va afficher toutes les requêtes entrantes dans notre application en prenant soin de garder l'IP du client ainsi que la route vers laquelle la requête a été faite.

Imaginez donc un portique d'aéroport qui va filtrer les personnes avec billets, les envoyer vers une nouvelle porte en cas de changements de dernière minute, vérifier leurs bagages, mais aussi modifier le contenu de ces bagages si nécessaire (par exemple, retirer un couteau d'un sac de cabine). De la même manière, lorsqu'une requête arrive sur une API, il faut pouvoir filtrer les requêtes authentifiées avec les bons droits d'accès, vérifier le contenu (JSON valide, headers présents, etc.), mais aussi modifier le contenu d'une requête (corps, en-têtes, etc.) pour des cas spécifiques à votre application. Par exemple, vous pourriez vouloir normaliser les entrées pour que toutes les dates soient au format `yyyy/mm/dd`, de sorte que même si un utilisateur entre `30/04/2024`, vous obteniez `2024/04/30` pour éviter de dupliquer la logique de validation des entrées sur toutes vos routes.

## Le Modèle MVC

Le modèle MVC est important pour une base de code propre et bien structuré. Ce n'est pas la seule manière de faire, mais c'est une méthode testé et approuvé au fils des années qui n'a pas vielli.

Le principe est simple, découper votre code en différentes catégories de fichiers :
- Le **modèle** dans des classes représentant vos données.
- Les **vues** dans des fichiers permettant de générer une page a partir des données.
- Les **controlleurs** dans des fichiers permettant de faire transiter les données vers les vues et vice et versa.

Pour commencer on va simplement préparer la connexion a la base de donnée avec un fichier `db.js` qu'on pourra placer dans un dossier `services/`.

Il encapsulera la configuration de la connexion à la base de données PostgreSQL à l'aide de la bibliothèque `pg` :

```js
// services/db.js
import pg from 'pg'

const pool = new pg.Pool({
  user: process.env.PG_USER ?? 'postgres',
  host: process.env.PG_HOST ?? 'localhost',
  database: process.env.PG_DATABASE ?? 'postgres',
  password: process.env.PG_PASSWORD ?? 'postgres',
  port: process.env.PG_PORT ?? 5432
})

export default pool
```

### Classe Utilisateur (Modèle)

Créer une classe de donnée User pour importer la connexion à la base de données depuis votre `db.js` et ainsi l'utiliser pour les opérations sur la base de données :

```js
// models/User.js
import db from '../db.js'

export default class User {
  constructor(username, email, password) {
    this.username = username
    this.email = email
    this.password = password
  }

  async save() {
    const client = await db.connect()
    try {
      const queryText = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
      const values = [this.username, this.email, this.password]
      const result = await client.query(queryText, values)
      return result.rows[0]
    } finally {
      client.release()
    }
  }

  static async findById(userId) {
    const client = await db.connect()
    try {
      const queryText = 'SELECT * FROM users WHERE id = $1'
      const values = [userId]
      const result = await client.query(queryText, values)
      return result.rows[0]
    } finally {
      client.release()
    }
  }
}
```

### Contrôleur Utilisateur

Créer un contrôleur pour utiliser la classe User. Il permettra de faire le lien entre la votre routeur et votre modèle de donnée.

```js
// controllers/userController.js
import User from '../models/User.js'

export async function getUserById(req, res, next) {
  const userId = req.params.id
  const user = await User.findById(userId).catch(error => {
    next(error)
  })
  if(user){
    res.json(user)
  }
}

export async function createUser(req, res, next) {
  const { username, email, password } = req.body
  const newUser = new User(username, email, password)
  const savedUser = await newUser.save().catch(error => {
    next(error)
  })
  if(user){
    res.status(201).json(savedUser)
  }
}
```

### Routeur Utilisateur

Créer un routeur pour gérer vos routes utilisateurs et les liés a vos controlleurs.

```js
// routes/userRoutes.js
import express from 'express'
import { getUserByIdController, createUserController } from '../controllers/userController.js'

const router = express.Router()

router.get('/users/:id', getUserByIdController)
router.post('/users', createUserController)

export default router
```

Maintenant que vous avez votre routeur, vous devez penser a l'ajouter dans le point d'entrée de votre application (`main.js`)

Vous devrez donc le modifier pour obtenir quelque-chose comme ça :

```js
// main.js
import express from 'express'

import userRoutes from './routes/userRoutes.js'

const app = express();
const HOST = process.env.HOST ?? 'localhost'
const PORT = process.env.PORT || 3000

/*** Middleware ***/

// Middleware for JSON body parsing
app.use(express.json())
// Middleware to read FormData (accessible in `req.body`)
app.use(express.urlencoded({extended: true}))

/*** Routeurs ***/

// Routes users
app.use(userRoutes)

/*** Initialisation ***/

// Serveur express.js
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`)
});
```

## Formulaire et traitement des données.

Pour permettre de récolter les données d'un formulaire, il faudra d'abord permettre a l'utilisateurs d'accéder au-dit formulaire.

Pour ce faire, il suffira d'ajouter le middleware `express.static` et d'exposer le dossier `public` qui contiendra la page HTML de votre formulaire.

```js
app.use(express.static('public'))
```

Dans le fichier `/public/login.html` vous pourrez alors ajouter votre formulaire :

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Login</title>
</head>
<body>
  <form action="login" method="post">
    <input type="text" name="username" id="username" required/>
    <input type="password" name="password" id="password" required/>
    <input type="submit" value="Login">
  </form>
</body>
</html>
```

Votre express.js doit être capable d'en décoder les données du fomulaire. Il faudra donc un second middleware qui effectuera cette action pour nous :

```js
app.use(express.urlencoded({extended: true}))
```

Ce middleware permet de décoder les données sous la forme `www-urlencoded` et d'y accéder dans le `req.body` de vos routes.

Maintenant que nous avons accès aux données du fomulaire vous allez devoir créer une nouvelle route permettant de recevoir ces données. je le ferais dans le fichier `routes/userRoutes.js` et `controllers/userController.js`:

```js
import { userLogin } from '../controllers/userController.js'
// Route pour gérer la soumission du formulaire de connexion
router.post('/login', userLogin)
```

```js
export function userLogin(req, res) {
  const { username, password } = req.body

  if (username === 'admin' && password === 'simplon2024') {
    res.send('Connexion réussie !')
  } else {
    res.status(401).send('Échec de la connexion. Veuillez vérifier vos identifiants.')
  }
}
```

Maintenant recevoir le message `Connexion réussie !` n'est pas très utile dans un retour d'API.

Nous pouvons maintenant modifier notre route pour récupérer via notre modèle l'id de l'utilisateur correspondant.

```js
// controllers/userController.js
import User from '../models/User.js'

export function userLogin(req, res) {
  const { username, password } = req.body
  const user = User.findByUsernameAndPassword(username, password)
  if (user) {
    res.json({
      id: user.id,
      username: user.username
    })
  } else {
    res.status(401).send('Échec de la connexion. Veuillez vérifier vos identifiants.')
  }
}
```

Ajoutez cette méthode statique dans la class `User` permettant de récupérer l'utilisateur correspondant aux credentials donnés :
```js
// models/User.js
static async findByUsernameAndPassword(username, password) {
  const client = await db.connect()
  try {
    const queryText = 'SELECT * FROM users WHERE username = $1 and password = $2'
    const values = [username, password]
    const result = await client.query(queryText, values)
    return result.rows[0]
  } finally {
    client.release()
  }
}
```

## Authentification

### Sessions

Les sessions sont un mécanisme important pour gérer l'authentification dans les applications web. Avec `express.js`, vous pouvez utiliser `express-session` pour configurer et gérer les sessions utilisateur.

Voici comment mettre en place les sessions avec `express-session` :

1. **Installer `express-session`** :
   Tout d'abord, installez `express-session` via npm :

   ```
   npm install express-session
   ```

2. **Configurer `express-session` dans votre application** :
   Dans votre fichier principal (habituellement `app.js` ou `index.js`), configurez `express-session` :

   ```js
   const express = require('express');
   const session = require('express-session');

   const app = express();

   app.use(session({
     secret: 'your_secret_key', // Change this to a secure random string
     resave: false,
     saveUninitialized: false
   }));
   ```

   Ici, `secret` est une chaîne de caractères utilisée pour signer la session et `resave` et `saveUninitialized` sont des options pour configurer le comportement de la session.

3. **Utiliser la session dans vos routes** :
   Vous pouvez maintenant accéder et manipuler la session dans vos routes Express. Par exemple, pour définir une variable de session `userId` :

   ```js
   app.get('/login', (req, res) => {
     // Simulated authentication
	 const user = { id: 1, username: 'john_doe' };
     req.session.user = user;
     res.send('Logged in successfully!');
   });

   app.get('/profile', (req, res) => {
     const userId = req.session.user?.id; // Peux ne pas exister si l'utilisateur n'est pas passé par la route `/login`
	 res.send(`User ID: ${userId}`);
   });
   ```

   Lorsque l'utilisateur se connecte avec succès, vous pouvez définir `req.session.user` avec l'objet utilisateur, puis accéder à cette variable de session dans d'autres routes pour gérer l'authentification et l'autorisation.

4. **Les middlewares "Guards"** :
   Les middlewares de types guards se placent sur une route pour bloquer ou non l'accès a celle-ci et/ou en modifier des données avant de l'appeler.
   Vous pouvez donc ajouter un middleware supplémentaire à cette route pour vérifier que l'utilisateur est bien authentifié par exemple:
```js
function authenticationNeeded(req, res, next) {
  if (req.session.user) {
    // User is authenticated, allow access to the protected endpoint
    next();
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect('/login');
  }
};

app.get('/profile', authenticationNeeded, (req, res) => {
[...]
```

### JWT (JSON Web Tokens)

#### Qu'est-ce qu'un JWT ?

Un JWT (JSON Web Token) est un format ouvert qui permet de représenter des assertions entre deux parties de manière sécurisée. Il est souvent utilisé pour l'authentification et l'échange sécurisé de données entre serveurs.

#### Comment créer un JWT ?

Pour créer un JWT, vous pouvez utiliser une bibliothèque comme `jsonwebtoken` en Node.js. Voici un exemple de création d'un JWT :

```js
const jwt = require('jsonwebtoken');

const payload = { user_id: user.id, email: user.email };
const secretKey = 'your_secret_key';
const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
```

#### Et dans express.js ?

Vous pouvez combiner JWT avec les sessions pour améliorer la sécurité et la gestion des utilisateurs dans votre application Express. Voici comment vous pourriez intégrer JWT dans une configuration de session :

1. **Générer un JWT lors de l'authentification** :
   Lorsque l'utilisateur se connecte avec succès, générez un JWT et stockez-le dans la session :

   ```js
   const jwt = require('jsonwebtoken');

   app.post('/login', (req, res) => {
     // Authenticate user...
     const userId = 123;
     const token = jwt.sign({ userId }, 'your_secret_key', { expiresIn: '1h' });
     req.session.token = token;
     res.send('Logged in successfully!');
   });
   ```

2. **Vérifier le JWT dans les routes protégées** :
   Dans les routes nécessitant une authentification, vérifiez et décodez le JWT pour obtenir l'identifiant de l'utilisateur :

   ```js
   const verifyToken = (req, res, next) => {
     const token = req.session.token;
     if (!token) return res.status(401).send('Unauthorized');

     jwt.verify(token, 'your_secret_key', (err, decoded) => {
       if (err) return res.status(401).send('Unauthorized');
       req.user = decoded;
       next();
     });
   };

   app.get('/profile', verifyToken, (req, res) => {
     res.json({ username: req.user.username });
   });
   ```

   Le middleware `verifyToken` vérifie la validité du JWT stocké dans la session. Si le JWT est valide, l'utilisateur est extrait et disponible dans `req.user`.

   Dans cet exemple :

   - `jwt.sign`: Crée un token JWT avec les données de l'utilisateur et une clé secrète.
   - `jwt.verify`: Vérifie et décode un token JWT avec la clé secrète pour obtenir les informations de l'utilisateur.


### CORS (Cross-Origin Resource Sharing)

#### Comment fonctionne CORS ?

CORS (Cross-Origin Resource Sharing) est un mécanisme de sécurité côté client qui permet à des ressources restreintes sur une page web d'être demandées depuis un autre domaine en dehors du domaine d'origine d'une application.

Les requêtes CORS comportent des en-têtes spécifiques (`Origin`) qui indiquent à un serveur si une ressource donnée peut être partagée avec l'origine demandante.

Pour permettre le partage des ressources entre différentes origines dans une application Express.js, vous pouvez utiliser le middleware `cors` :

```js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
```

Le middleware `cors` permettra à votre application Express.js de répondre aux requêtes provenant de différentes origines (domaines), en incluant les en-têtes CORS nécessaires dans les réponses HTTP.

### Et tout ça ensemble ?

Pour comprendre plus en profondeur comment tout cela fonctionne ensemble, je vous ai préparé une API toute prête et déjà fonctionnelle.

Vous pouvez démarrer le projet via la command suivante :
```bash
npm run dev
```

Le serveur express peut prendre les variables d'environnements :
```
PORT: Number (default: 3000) - Le port sur lequel express écoutera
HOST: String (default: localhost) - L'adresse sur laquelle express écoutera les requêtes.
ACCESS_LOG: Boolean (default: false) - Activer ou non les accesslogs dans la console.
```

### Simplifier ça ?

Passport.js est une bibliothèque d'authentification pour Node.js qui simplifie l'implémentation des stratégies d'authentification comme les sessions, JWT, OAuth, etc.

#### Exemple d'utilisation de Passport.js

Pour utiliser Passport.js dans votre application Express.js, vous devez d'abord installer les modules nécessaires :

```bash
npm install passport passport-local
```

Ensuite, configurez Passport.js dans votre application :

```js
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// Configurez la stratégie locale pour l'authentification
passport.use(new LocalStrategy(
  (username, password, done) => {
    // Implémentation de la logique d'authentification (ex: vérification en base de données)
    if (username === 'john_doe' && password === 'secret') {
      return done(null, { id: 1, username: 'john_doe' });
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }
));

// Initialiser Passport et la gestion de session
app.use(passport.initialize());
app.use(passport.session());

// Définir la sérialisation et la désérialisation de l'utilisateur
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = { id: 1, username: 'john_doe' }; // Remplacer par la récupération depuis la base de données
  done(null, user);
});

// Routes d'authentification
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.username}`);
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});
```
