var builder = require('botbuilder');
var restify = require('restify');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var twilio = require('twilio');

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

var accountSid = 'AC4605f10acc3f48f8af40d07588550aef'; 
var authToken = '7ba668870602838b7df1fd54dedc314f'; 

var client = new twilio.RestClient(accountSid, authToken);



//=========================================================
// Bots Dialogs
//=========================================================

var recognizer = new builder.LuisRecognizer(luisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.matches('DangerIntent',
    function(session, args, next) {
        console.log('Session message: ' + session.message.text);
        session.send('You seem to be extremely depressed and are probably at risk.');
        session.send('Before you do anything drastic, please do remember that there are always people in your life who care about you and will be deeply affected should you do something extreme.');
        session.send("It is highly advised that you speak to someone. I would recommend AASRA. I'm sure they will be able to help you out in this difficult time.");
        session.send("AASRA's number is 022 2754 6669.");
        /*client.messages.create({
            body: 'Your friend is in danger. You should talk to him.',
            to: session.userData.number,  // Text this number
            from: '+19402023122 ' // From a valid Twilio number
        }, function(err, message) {
            if(err) {
                console.error(err.message);
            }
        });*/

    }
);


intents.matches('FAQIntent', 
    function (session, args, next) {
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
                if(json.answer == "No good match found in the KB") {
                    session.send("I'm afraid I do not have an answer to that question right now.");
                }
                else {
                    session.send(json.answer);
                }
        
            }
            else {
                session.send("Oops! I have encountered an error in my system. Please try again. I'm sorry for the inconvenience.");
            }
        })
    }
);



intents.matches(/^add number/i, [
    function (session) {
        builder.Prompts.text(session, 'Hey! Can I know the number of the person closes to you? Someone I can contact in the time of need?');
    },
    function (session, results) {
        session.userData.number = results.response;
        session.send('Ok... Added number %s', session.userData.number);
        session.endDialog();
    }
]);

/*intents.onBegin([
    function (session, args, next) {
        if (!session.userData.name) {
            session.send('How do you do?');
            //session.beginDialog('/profile');
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
        builder.Prompts.text(session, 'Hello %s! Can you provide a number of the person closest to you? Someone I can contact in the time of need?')
        //session.endDialog();
    },
    function(session, results) {
        session.userData.number = results.response;
        session.endDialog();
    }
]);*/