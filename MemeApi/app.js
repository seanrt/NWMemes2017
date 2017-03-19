var builder = require('botbuilder');
var db = require('./queries');
  
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || 'd76ae68c-910b-48a3-a746-8fc7c2b44d6c',
    appPassword: process.env.MICROSOFT_APP_PASSWORD || 'LbzYbkMyXCwF987SwyYjhsS'
});
var bot = new builder.UniversalBot(connector);

var luisAppId = process.env.LuisAppId || '48326159-b295-4e86-89ca-2d444edb0460';
var luisAPIKey = process.env.LuisAPIKey || '222ff6a5e2ba4465a01f476979959732';

const LuisModelUrl = `https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/${luisAppId}?subscription-key=${luisAPIKey}&verbose=true`;
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));

bot.dialog('/', dialog);

dialog.matches('MemeByLocation', [
    function (session, args, next) {
        var city = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        db.getTweetsByCityNameBot(city.entity).then(function(res, err) {
            session.send(JSON.stringify(res));
        });
    }
]);

dialog.matches('hello', [
    function(session, args) {
        session.send("hi");
    }
]);

dialog.matches('None', [
    function(session, args) {
        session.send("I don't know what you're talking about");
    }
]);

module.exports = {
    connector : connector
}
