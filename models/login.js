var mongoose = require('mongoose');

var LoginSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  userId: { type: Number, required: true }
});

module.exports = mongoose.model('Login', LoginSchema);
