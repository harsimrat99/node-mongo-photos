const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp')
const passport = require('passport');
// Load User model
const Photos = require('../models/Photos');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

//show
router.get('/show', ensureAuthenticated, (req, res) => {  
  
  datas = Photos.find({ "user": req.user._id }).limit(10).exec().then((data) => {

    res.render('show', {images: data});  
    
  })  

  return

});

//create
router.post('/create', upload.single('image'), ensureAuthenticated, (req, res) => {

  const body = req.file;  
  
  if (!body) {

    req.flash(
      'success_msg',
      'Your image was not uploaded.'
    );
    res.redirect('/photos/show');
    return;

  }

  
  var user = req.user._id;
  var s = sharp(body.buffer)
  .resize(160, 120).toBuffer().then((e) => {    
        
    const data = Buffer.from(e).toString("base64");  
    const img = new Photos({data,user});

    img.save()
                .then(img => {
                  req.flash(
                    'success_msg',
                    'Your image has been saved.'
                  );
                  res.redirect('/photos/show');
                })
                .catch(err => console.log(err));  

    })  
  

});


//delete
router.post('/delete', ensureAuthenticated,(req, res) => {

  try {
    var id = req.body.photo_id;
    console.log(id)
    datas = Photos.remove({ "_id" : id }).then((data) => {
      res.redirect('/photos/show')          
    })  
  } catch(e) {
    console.log(e)
    res.redirect('/photos/show')
  }

});


module.exports = router;
