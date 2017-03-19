var promise = require('bluebird');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://root@nwmeme.westus.cloudapp.azure.com:26257/nwmeme';
var db = pgp(connectionString);

function getAllCities(req, res, next) {
  db.any('SELECT * FROM cities')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getTweetsByCityName(req, res, next) {
  var cityName = req.params.cityName;
  db.any(`SELECT * FROM tweets INNER JOIN cities ON tweets.cityId = cities.cityID WHERE cities.cityName = '${cityName}' ORDER BY tweets.createdAt LIMIT 5`)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getAllCities: getAllCities,
  getTweetsByCityName: getTweetsByCityName,
};