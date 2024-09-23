var express = require('express');
var env = require('dotenv').config();
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo');
var indexRouter = require('./routes/index'); // Importeer de router
var Visitor = require('./models/visitor'); // Importeer het Visitor model

mongoose.connect(process.env.DB_CONNECTION).then(() => {
  console.log('MongoDB Connection Succeeded.');
}).catch((err) => {
  console.log('Error in DB connection: ' + err);
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware om het aantal bezoekers bij te werken voor de hoofdpagina
app.use('/', async (req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') {
      let visitor = await Visitor.findOne({ date: { $gte: new Date().setHours(0, 0, 0, 0) } });
      if (!visitor) {
        visitor = new Visitor();
      }
      visitor.count += 1;
      await visitor.save();
    }
    next();
  });

// Middleware om te controleren of een gebruiker is ingelogd
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/admin');
  }
}
  
// Start Pagina
app.get('', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
// Desktop Pagina
app.get('/desktop', function (req, res) {
    res.sendFile(path.join(__dirname, '/pagina/desktop/index.html'));
  });
  app.get('/fotos/desktop.jpg', function (req, res) {
    res.sendFile(path.join(__dirname, '/fotos/desktop.jpg'));
  });
  // Gaming Pagina
app.get('/gaming', function (req, res) {
    res.sendFile(path.join(__dirname, '/pagina/gaming/index.html'));
  });
  app.get('/fotos/gaming.jpg', function (req, res) {
    res.sendFile(path.join(__dirname, '/fotos/gaming.jpg'));
  });
  // Laptop Pagina
app.get('/laptop', function (req, res) {
    res.sendFile(path.join(__dirname, '/pagina/laptop/index.html'));
  });
  app.get('/fotos/laptop.jpg', function (req, res) {
    res.sendFile(path.join(__dirname, '/fotos/laptop.jpg'));
  });

// Route om admin.html te serveren
app.get('/admin', function (req, res) {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Beveiligde route om dashboard.html te serveren
app.get('/dashboard.html', isAuthenticated, function (req, res) {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Gebruik de routes
app.use('/', indexRouter);

// Beveiligde routes
app.use('/profile', isAuthenticated, indexRouter);
app.use('/logout', isAuthenticated, indexRouter);

// 404 foutpagina
app.use(function(req, res, next) {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
  });

// Start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Server is gestart op http://127.0.0.1:' + PORT);
});
