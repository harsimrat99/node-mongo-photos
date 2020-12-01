const mongoose = require('mongoose');

const image_schema = new mongoose.Schema({
  data: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },  
});

const Photos = mongoose.model('Photos', image_schema);
module.exports = Photos;
