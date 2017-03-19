var express = require('express');
var app = express();
var port = 3030;
var cors = require('cors');
var router = express.Router();

app.use(cors())

var db = require('./queries');

router.get('/api/cities', db.getAllCities);
router.get('/api/tweets/:cityName', db.getTweetsByCityName);

app.use('/', router);
app.listen(port);