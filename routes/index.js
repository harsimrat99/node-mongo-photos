const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('home',{ layout: null }));

router.get('/about', forwardAuthenticated, (req, res) => res.render('about',{ layout: null }));

router.get('/login', forwardAuthenticated, (req, res) => res.redirect('/users/login'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

module.exports = router;
