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
  date: {
    type: Date,
    default: Date.now
  }
});

const Photos = mongoose.model('Photos', image_schema);
module.exports = Photos;
