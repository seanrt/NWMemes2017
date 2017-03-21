var builder = require('botbuilder');
var db = require('./queries');
  
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || 'd76ae68c-910b-48a3-a746-8fc7c2b44d6c',
    appPassword: process.env.MICROSOFT_APP_PASSWORD || 'LbzYbkMyXCwF987SwyYjhsS'
});
var bot = new builder.UniversalBot(connector);

var luisAppId = process.env.LuisAppId || '48326159-b295-4e86-89ca-2d444edb0460';
var luisAPIKey = process.env.LuisAPIKey || '91e0a963c49c4149a253ac6d3e84b695';

const LuisModelUrl = `https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/${luisAppId}?subscription-key=${luisAPIKey}&verbose=true`;
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));

bot.dialog('/', dialog);

dialog.matches('MemeByLocation', [
    function (session, args, next) {
        var city = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        db.setFlag(true);
        db.setLocation(city.entity);
            db.getTweetsByCityNameBot(city.entity).then(function(res, err) {
            for(var i = 0; i < res.length; i++) {
                                        console.log(res);  
            var msg = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                        .title(res[i].tweet)
                        .text(res[i].retweetCount + " retweets, " + res[i].likesCount + " likes, " + res[i].repliesCount + " replies")
                        .images([
                            builder.CardImage.create(session, res[i].imageUrl)
                        
                        ])
                ]);

                session.send(msg);
            }
        });
    }
]);

dialog.matches('hello', [
    function(session, args) {
        session.send("Born too early to explore the universe, born too late to explore the world, born just in time to explore dank memes");
    }
]);

dialog.matches('None', [
    function(session, args) {
        session.send("Try entering a location");
    }
]);

module.exports = {
    connector : connector
}
