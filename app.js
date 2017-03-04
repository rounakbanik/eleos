var builder = require('botbuilder');
var restify = require('restify');
var querystring = require('querystring');
var http = require('http');
var request = require('request');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
var luisModelUrl = process.env.LUIS_MODEL_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/34044c6a-fd74-40b7-ad9b-1944c34ae8a5?subscription-key=dc0540a857ee4b53a57a8fd5e671c533&verbose=true&q=';
server.post('/api/messages', connector.listen());

var QnAheaders = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': '277bbed4e3604c73975b4d80ac5d92b3'
};
var QnAUrl = 'https://westus.api.cognitive.microsoft.com/qnamaker/v1.0/knowledgebases/923e329c-f34b-49fd-b19d-39e8df3d20bd/generateAnswer?subscription-key=277bbed4e3604c73975b4d80ac5d92b3';


//=========================================================
// Bots Dialogs
//=========================================================

var recognizer = new builder.LuisRecognizer(luisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.matches('FAQIntent', 
    function (session, args, next) {
        // Process optional entities received from LUIS
        /*var match;
        var entity = builder.EntityRecognizer.findEntity(args.entities, 'TaskTitle');
        if (entity) {
            match = builder.EntityRecognizer.findBestMatch(tasks, entity.entity);
        }
        
        // Prompt for task name
        if (!match) {
            builder.Prompts.choice(session, "Which task would you like to delete?", tasks);
        } else {
            next({ response: match });
        }*/
        console.log('Session message: ' + session.message.text)
        var QnAOptions = {
            url: QnAUrl,
            method: 'POST',
            header: QnAheaders,
            form: { "question" : session.message.text }
        };
        request(QnAOptions, function (error, response, body) {
            if (!error) {
                // Print out the response body
                var json = JSON.parse(body);
                session.send(json.answer);
                //console.log(typeof(json));
        
            }
            else {
                console.log(error);
            }
        })
        //session.send(session.message);
    }
    /*function (session, results) {
        if (results.response) {
            delete tasks[results.response.entity];
            session.send("Deleted the '%s' task.", results.response.entity);
        } else {
            session.send('Ok... no problem.');
        }
        session.send('Okay bro');
    }*/
);

/*intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);*/