var express = require('express');
var app = express();
var port = 3030;
var cors = require('cors');
var router = express.Router();

app.use(cors())

var db = require('./queries');
var bot = require('./app');

router.get('/api/cities', db.getAllCities);
router.get('/api/tweets/:cityName', db.getTweetsByCityName);
router.post('/api/messages', bot.connector.listen());

app.use('/', router);
app.listen(port);