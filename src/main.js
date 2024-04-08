const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cors = require('cors');
// const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const host = process.env.HOST ?? 'localhost'
const port = Number(process.env.PORT) || 3000;
const secretKey = 'your_secret_key';

// Serve static directory
app.use(express.static('public'));

// Middleware for JSON body parsing
app.use(express.json());
// Middleware to read FormData (accessible in `req.body`)
app.use(express.urlencoded({extended: true}));

// Middleware for session management
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

// Middleware for CORS
app.use(cors());

// // Initialize Passport and session management
// app.use(passport.initialize());
// app.use(passport.session());

// // Passport local strategy for authentication
// passport.use(new LocalStrategy(
//   (username, password, done) => {
//     // Example authentication logic (replace with your own secure method)
//     if (username === 'admin' && password === 'simplon2024') {
//       return done(null, { id: 1, username: 'admin' });
//     } else {
//       return done(null, false, { message: 'Invalid credentials' });
//     }
//   }
// ));

// // Serialize and deserialize user (for session management)
// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser((id, done) => {
//   const user = { id: 1, username: 'admin' }; // Example: Fetch user from database
//   done(null, user);
// });

// Middleware d'accesslogs
function requestLoggerMiddleware(req, _res, next) {
  console.log(`Incoming request to ${req.path} from ${req.ip}`);
  next();
}

// If access log is enabled, then add the middleware to our express application
if (![undefined, '', 'false', '0'].includes(process.env.ACCESS_LOG?.toLowerCase())) {
  app.use(requestLoggerMiddleware);
}

// Route to generate and return a JWT upon successful login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Example authentication logic (replace with your own secure method)
  if (username === 'admin' && password === 'simplon2024') {
    const user = { username: 'admin' };
    const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware to verify JWT for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('Decoded', decoded)
    req.user = decoded;
    next();
  });
};

// Protected route that requires JWT authentication
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

// Logout route (destroy session)
app.get('/logout', (req, res) => {
  req.logout(); // This will destroy the session
  res.send('Logged out successfully');
});

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
