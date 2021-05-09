const { spawn } = require('child_process');
var batch_names = [];
var batch_done = [];
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('home', { layout: null }));
router.get('/about', forwardAuthenticated, (req, res) => res.render('about', { layout: null }));
router.get('/stuff', forwardAuthenticated, (req, res) => res.render('research', { layout: null }));
router.get('/login', forwardAuthenticated, (req, res) => res.redirect('/users/login'));
router.get('/queue', (req, res) => res.render('queue', { 'done': batch_done, 'ndone': batch_names }));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        user: req.user
    })
);

// UserName
router.get('/u/:name', (req, res) => {
    res.render('u', { 'name': req.params.name })
    console.log(req.params.name);
});

router.get('/compile', (req, res) => {

    uname = req.query.pass;
    if (batch_done.includes(uname)) {
        res.redirect('/queue');
    }

    else if (!batch_names.includes(uname) && batch_names.length < 3) {

        batch_names.push(uname);
        compile(uname);
        res.redirect('/queue');

    }

    else {
        res.send("Name already exists in the queue or too many jobs scheduled. Please try again.")
    }

});

function compile(uname) {

    var bat;
    try {
        
        var compiler;
        if (process.platform === "win32") {
            compiler="g++";
        }
        else {
            compiler="x86_64-w64-mingw32-g++";
        }

        bat = spawn(compiler, ['views/res/static/pop.c', "-lgdiplus", "-lgdi32", "-mwindows", `-DUSER=L"${uname}"`, "-Os", `-o${uname}.exe`]);

    } catch (e) {
        console.log(e)
    }
    bat.on('error', (code) => {
        console.log(code)
        batch_names.splice(batch_names.indexOf(uname), 1);
    });

    bat.on('exit', (code) => {
        console.log(code)
        batch_names.splice(batch_names.indexOf(uname), 1);
        batch_done.push(uname);
        spawn('mv', [`./${uname}.exe`, `./views/res/static/${uname}.exe`])
    });

}

module.exports = router;