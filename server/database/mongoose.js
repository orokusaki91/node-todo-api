const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/todo', { useNewUrlParser: true });

module.exports = { mongoose };