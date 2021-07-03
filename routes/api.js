const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bcryptjs = require('bcrypt')
const passport = require('passport');
const sharp = require('sharp')
const Photos = require('../models/Photos');
const jwt = require('jsonwebtoken')
const User = require('../models/User');
const multer = require('multer');
const {forwardAuthenticated} = require('../config/auth');

var storage = multer.memoryStorage()
var upload = multer({storage: storage})

// Login
router.post('/login', (req, res, next) => {

    username = req.body.username;
    password = req.body.password;


    try {

        if (!username || !password) {

            res.status(401).json({

                "message": "Credentials not found."

            });

        }

        User.findOne({"email": {$eq: username}}).exec().then((result) => {

            if (!result) {

                res.status(401).json({"error": "User not found."})

            } else {

                bcryptjs.compare(password, result.password, function (err, bunty) {

                    if (bunty) {


                        res.json({
                            "token": jwt.sign({user: result._id}, process.env.SECRET, {expiresIn: 86400})
                        })
                    } else {

                        res.status(401).json({"error": "Could not authenticate."})

                    }

                });
            }

        });

    } catch (e) {


    }


});

//upload
router.post('/create', upload.single('imageFile'), authenticateToken, (req, res) => {

    const body = req.file;
    if (!body) {

        req.flash(
            'success_msg',
            'Your image was not uploaded.'
        );
        res.status(400).json({
            "Error": "Image not uploaded."
        })
        return;

    }

    var user = req.user.user;
    var s = sharp(body.buffer)
        .resize(160, 120).toBuffer().then((e) => {

            const data = Buffer.from(e).toString("base64");
            const img = new Photos({data, user});

            img.save()
                .then(img => {
                    req.flash(
                        'success_msg',
                        'Your image has been saved.'
                    );
                    res.status(200).json({"Success": "Image saved."})
                })
                .catch(err => console.log(err));

        })


});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    if (authHeader == null) return res.sendStatus(401)

    jwt.verify(authHeader, process.env.SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user

        next()
    })
}


module.exports = router