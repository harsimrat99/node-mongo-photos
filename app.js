const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var morgan = require('morgan')
const redis = require('redis')
const csrf = require('csrf');

var RedisStore = require('connect-redis')(session)
var redisClient = redis.createClient({
    host: process.env.HOST_REDIS,
    port: process.env.REDIS_PORT,
    password: process.env.PASSWORD_REDIS
});


const app = express();
app.use(morgan('combined'))

// Passport Config
require('./config/passport')(passport);

// DB Config
var uri = process.env.URI_MONGO

// set up rate limiter: maximum of five requests per minute
var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 5
});

// Connect to MongoDB
mongoose
    .connect(
        uri, { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layout');

var db = mongoose;

// Express body parser
app.use(express.urlencoded({ extended: true }));
var bodyParser = require('body-parser')

// Express session
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.raw())

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/photos', require('./routes/photos.js'));
app.use('/api', require('./routes/api.js'));

const PORT = process.env.PORT || 5000;
app.use(express.static('./views'))

if (process.env.DEBUG) {

    app.listen(PORT, console.log(`Server started on port ${PORT}`));
    // Handle 404
    app.use(function (req, res) {
        res.render('error')
    });

    // Handle 500
    app.use(function (error, req, res, next) {
        console.log(error)
        res.render('error')
    });

}

else {

    const http = require('http');
    const https = require('https');
    const fs = require('fs');

    const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.CERT_KEY_PATH, 'utf8');
    const ca = fs.readFileSync(process.env.CHAIN_PATH, 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    // Handle 404
    app.use(function (req, res) {
        res.render('error')
    });

    // Handle 500
    app.use(function (error, req, res, next) {
        console.log(error)
        res.render('error')
    });


    // Starting both http & https servers
    const httpServer = http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(80);

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });


}