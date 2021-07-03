const {spawn} = require('child_process');
var batch_names = [];
var batch_done = [];
const express = require('express');
const router = express.Router();
const {ensureAuthenticated, forwardAuthenticated} = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('home', {layout: null, dashboard: true});
    } else {
        return res.render('home', {layout: null, dashboard: false});
    }
});

router.get('/about', forwardAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('about', {layout: null, dashboard: true});
    } else {
        return res.render('about', {layout: null, dashboard: false});
    }
});
router.get('/stuff', forwardAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('research', {layout: null, dashboard: true});
    } else {
        return res.render('research', {layout: null, dashboard: false});
    }
});
router.get('/login', forwardAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/users/login', {layout: null, dashboard: true});
    } else {
        return res.render('/users/login', {layout: null, dashboard: false});
    }
});
router.get('/queue', (req, res) => {
    // res.render('queue', {}
    if (req.isAuthenticated()) {
        return res.render('queue', {layout: null, dashboard: true, 'done': batch_done, 'ndone': batch_names});
    } else {
        return res.render('queue', {layout: null, dashboard: false, 'done': batch_done, 'ndone': batch_names});
    }
})
;

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
        if (req.isAuthenticated()) {
            return res.render('dashboard', {layout: null, dashboard: true, user: req.user});
        } else {
            return res.render('dashboard', {layout: null, dashboard: false, user: req.user});
        }
    }
)
;

// UserName
router.get('/u/:name', (req, res) => {
    return res.render('u', {'name': req.params.name, dashboard:true})
});

router.get('/compile', (req, res) => {

    uname = req.query.pass;
    if (batch_done.includes(uname)) {
        res.redirect('/queue');
    } else if (!batch_names.includes(uname) && batch_names.length < 3) {

        batch_names.push(uname);
        compile(uname);
        res.redirect('/queue');

    } else {
        res.send("Name already exists in the queue or too many jobs scheduled. Please try again.")
    }

});

function compile(uname) {

    var bat;
    try {

        var compiler;
        if (process.platform === "win32") {
            compiler = "g++";
        } else {
            compiler = "x86_64-w64-mingw32-g++";
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