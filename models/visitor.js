var mongoose = require('mongoose');

var VisitorSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
