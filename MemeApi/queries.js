var promise = require('bluebird');
var axios = require('axios');

var options = {
    promiseLib: promise
};

var flag = false;
var location;

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://root@nwmeme2.westus.cloudapp.azure.com:26257/nwmeme2';
var db = pgp(connectionString);

function getAxiosForCity(cityName) {
  return axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${cityName}.json?access_token=pk.eyJ1IjoiYW5keXR1bmciLCJhIjoiY2owZnJ6eXY4MDJlbTJxc2F6OW81cnpzcSJ9.CwCldAdWdHqo90qFuK_WFA`);
}

function getAllCities(req, res, next) {
    db.any('SELECT * FROM cities')
        .then(function (data) {
            var arr = data.map(function (i) {
                return getAxiosForCity(i.cityName);
            });
            axios.all(arr)
                .then(function (axiosResults) {
                    var temp = axiosResults.map(r => r.data);
                    for (var i=0; i<temp.length; i++) {
                        data[i].location = temp[i].features[0].center
                    }
                    res.status(200)
                        .json({
                            status: 'success',
                            data: data
                        });
                });
            
        })
        .catch(function (err) {
            return next(err);
        });
}

function getTweetsByCityNameBot(cityName) {
    return new Promise(function(resolve, reject) {
        db.any(`SELECT * FROM tweets INNER JOIN cities ON tweets.cityId = cities.cityID WHERE cities.cityName = '${cityName}' AND imageUrl != 'No url' ORDER BY tweets.createdAt LIMIT 5`)
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                return next(err);
            });
    });
}

function getTweetsByCityName(req, res, next) {
    var cityName = req.params.cityName;
    db.any(`SELECT * FROM tweets INNER JOIN cities ON tweets.cityId = cities.cityID WHERE cities.cityName = '${cityName}' AND imageUrl != 'No url' ORDER BY tweets.createdAt LIMIT 5`)
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

function poll(req, res, next) {
    getAxiosForCity(location).then(function(result) {
        res.status(200).json({
            "isReady": flag,
            "location": result.data.features[0].center
        });
        // flag = false;
    });    
}

function setLocation(newLocation) {
    location = newLocation;
}

function setFlag(newFlag) {
    flag = newFlag;
}

module.exports = {
    getAllCities: getAllCities,
    getTweetsByCityName: getTweetsByCityName,
    getTweetsByCityNameBot: getTweetsByCityNameBot,
    poll: poll,
    setFlag: setFlag,
    setLocation: setLocation
};