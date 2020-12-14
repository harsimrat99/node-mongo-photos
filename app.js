const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var morgan = require('morgan')

const app = express();
app.use(morgan('combined'))

// Passport Config
require('./config/passport')(passport);

// DB Config
var uri = process.env.URI_MONGO

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

var db = mongoose;

// Express body parser
app.use(express.urlencoded({ extended: true }));
var bodyParser = require('body-parser')

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.raw())

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
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
app.listen(PORT, console.log(`Server started on port ${PORT}`));
// Handle 404
app.use(function(req, res) {
    res.render('error')
});

// Handle 500
app.use(function(error, req, res, next) {
    console.log(error)
    res.render('error')
});