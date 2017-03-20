'use strict';
const Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this:  var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = "amzn1.ask.skill.82d31eb2-7470-4dd6-85a4-a04fe53272d5";

//This function returns a descriptive sentence about your data.  Before a user starts a quiz, they can ask about a specific data element,
//like "Ohio."  The skill will speak the sentence from this function, pulling the data values from the appropriate record in your data.
function getSpeechDescription(item) {
    var sentence = item.StateName + " is the " + item.StatehoodOrder + "th state, admitted to the Union in " + item.StatehoodYear + ".  The capital of " + item.StateName + " is " + item.Capital + ", and the abbreviation for " + item.StateName + " is <break strength='strong'/><say-as interpret-as='spell-out'>" + item.Abbreviation + "</say-as>.  I've added " + item.StateName + " to your Alexa app.  Which other state or capital would you like to know about?";
    return sentence;
}

//We have provided two ways to create your quiz questions.  The default way is to phrase all of your questions like: "What is X of Y?"
//If this approach doesn't work for your data, take a look at the commented code in this function.  You can write a different question
//structure for each property of your data.
function getQuestion(counter, property, item) {
    return "Here is your " + counter + "th question.  What is the " + formatCasing(property) + " of " + item.StateName + "?";

    /*
     switch(property)
     {
     case "City":
     return "Here is your " + counter + "th question.  In what city do the " + item.League + "'s "  + item.Mascot + " play?";
     break;
     case "Sport":
     return "Here is your " + counter + "th question.  What sport do the " + item.City + " " + item.Mascot + " play?";
     break;
     case "HeadCoach":
     return "Here is your " + counter + "th question.  Who is the head coach of the " + item.City + " " + item.Mascot + "?";
     break;
     default:
     return "Here is your " + counter + "th question.  What is the " + formatCasing(property) + " of the "  + item.Mascot + "?";
     break;
     }
     */
}

//This is the function that returns an answer to your user during the quiz.  Much like the "getQuestion" function above, you can use a
//switch() statement to create different responses for each property in your data.  For example, when this quiz has an answer that includes
//a state abbreviation, we add some SSML to make sure that Alexa spells that abbreviation out (instead of trying to pronounce it.)
function getAnswer(property, item) {
    switch (property) {
        case "Abbreviation":
            return "The " + formatCasing(property) + " of " + item.StateName + " is <say-as interpret-as='spell-out'>" + item[property] + "</say-as>. "
            break;
        default:
            return "The " + formatCasing(property) + " of " + item.StateName + " is " + item[property] + ". "
            break;
    }
}

//This is a list of positive speechcons that this skill will use when a user gets a correct answer.  For a full list of supported
//speechcons, go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
var speechConsCorrect = ["Booya", "All righty", "Bam", "Bazinga", "Bingo", "Boom", "Bravo", "Cha Ching", "Cheers", "Dynomite",
    "Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Oh dear.  Just kidding.  Hurray", "Kaboom", "Kaching", "Oh snap", "Phew",
    "Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "Yowsa"];

//This is a list of negative speechcons that this skill will use when a user gets an incorrect answer.  For a full list of supported
//speechcons, go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
var speechConsWrong = ["Argh", "Aw man", "Blarg", "Blast", "Boo", "Bummer", "Darn", "D'oh", "Dun dun dun", "Eek", "Honk", "Le sigh",
    "Mamma mia", "Oh boy", "Oh dear", "Oof", "Ouch", "Ruh roh", "Shucks", "Uh oh", "Wah wah", "Whoops a daisy", "Yikes"];

//This is the welcome message for when a user starts the skill without a specific intent.
var WELCOME_MESSAGE = "Welcome to total cast!";

//This is the message a user will hear when they start a quiz.
var START_QUIZ_MESSAGE = "OK.  I will ask you 10 questions about the United States.";

//This is the message a user will hear when they try to cancel or stop the skill, or when they finish a quiz.
var EXIT_SKILL_MESSAGE = "Thank you for playing the United States Quiz Game!  Let's play again soon!";

//This is the message a user will hear after they ask (and hear) about a specific data element.
var REPROMPT_SPEECH = "Which other state or capital would you like to know about?";

//This is the message a user will hear when they ask Alexa for help in your skill.
var HELP_MESSAGE = "Which movie would you like to play?";


//This is the response a user will receive when they ask about something we weren't expecting.  For example, say "pizza" to your
//skill when it starts.  This is the response you will receive.
function getBadAnswer(item) {
    return "I'm sorry. " + item + " is not something I know very much about in this skill. " + HELP_MESSAGE;
}

//This is the message a user will receive after each question of a quiz.  It reminds them of their current score.
function getCurrentScore(score, counter) {
    return "Your current score is " + score + " out of " + counter + ". ";
}

//This is the message a user will receive after they complete a quiz.  It tells them their final score.
function getFinalScore(score, counter) {
    return "Your final score is " + score + " out of " + counter + ". ";
}

//These next four values are for the Alexa cards that are created when a user asks about one of the data elements.
//This only happens outside of a quiz.

//If you don't want to use cards in your skill, set the USE_CARDS_FLAG to false.  If you set it to true, you will need an image for each
//item in your data.
var USE_CARDS_FLAG = true;

//This is what your card title will be.  For our example, we use the name of the state the user requested.
function getCardTitle(item) {
    return item.StateName;
}

//This is the small version of the card image.  We use our data as the naming convention for our images so that we can dynamically
//generate the URL to the image.  The small image should be 720x400 in dimension.
function getSmallImage(item) {
    return "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/720x400/" + item.Abbreviation + "._TTH_.png";
}

//This is the large version of the card image.  It should be 1200x800 pixels in dimension.
function getLargeImage(item) {
    return "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/1200x800/" + item.Abbreviation + "._TTH_.png";
}

//=========================================================================================================================================
//TODO: Replace this data with your own.
//=========================================================================================================================================
var data = [
    {StateName: "Alabama", Abbreviation: "AL", Capital: "Montgomery", StatehoodYear: 1819, StatehoodOrder: 22},
    {StateName: "Alaska", Abbreviation: "AK", Capital: "Juneau", StatehoodYear: 1959, StatehoodOrder: 49},
    {StateName: "Arizona", Abbreviation: "AZ", Capital: "Phoenix", StatehoodYear: 1912, StatehoodOrder: 48},
    {StateName: "Arkansas", Abbreviation: "AR", Capital: "Little Rock", StatehoodYear: 1836, StatehoodOrder: 25},
    {StateName: "California", Abbreviation: "CA", Capital: "Sacramento", StatehoodYear: 1850, StatehoodOrder: 31},
    {StateName: "Colorado", Abbreviation: "CO", Capital: "Denver", StatehoodYear: 1876, StatehoodOrder: 38},
    {StateName: "Connecticut", Abbreviation: "CT", Capital: "Hartford", StatehoodYear: 1788, StatehoodOrder: 5},
    {StateName: "Delaware", Abbreviation: "DE", Capital: "Dover", StatehoodYear: 1787, StatehoodOrder: 1},
    {StateName: "Florida", Abbreviation: "FL", Capital: "Tallahassee", StatehoodYear: 1845, StatehoodOrder: 27},
    {StateName: "Georgia", Abbreviation: "GA", Capital: "Atlanta", StatehoodYear: 1788, StatehoodOrder: 4},
    {StateName: "Hawaii", Abbreviation: "HI", Capital: "Honolulu", StatehoodYear: 1959, StatehoodOrder: 50},
    {StateName: "Idaho", Abbreviation: "ID", Capital: "Boise", StatehoodYear: 1890, StatehoodOrder: 43},
    {StateName: "Illinois", Abbreviation: "IL", Capital: "Springfield", StatehoodYear: 1818, StatehoodOrder: 21},
    {StateName: "Indiana", Abbreviation: "IN", Capital: "Indianapolis", StatehoodYear: 1816, StatehoodOrder: 19},
    {StateName: "Iowa", Abbreviation: "IA", Capital: "Des Moines", StatehoodYear: 1846, StatehoodOrder: 29},
    {StateName: "Kansas", Abbreviation: "KS", Capital: "Topeka", StatehoodYear: 1861, StatehoodOrder: 34},
    {StateName: "Kentucky", Abbreviation: "KY", Capital: "Frankfort", StatehoodYear: 1792, StatehoodOrder: 15},
    {StateName: "Louisiana", Abbreviation: "LA", Capital: "Baton Rouge", StatehoodYear: 1812, StatehoodOrder: 18},
    {StateName: "Maine", Abbreviation: "ME", Capital: "Augusta", StatehoodYear: 1820, StatehoodOrder: 23},
    {StateName: "Maryland", Abbreviation: "MD", Capital: "Annapolis", StatehoodYear: 1788, StatehoodOrder: 7},
    {StateName: "Massachusetts", Abbreviation: "MA", Capital: "Boston", StatehoodYear: 1788, StatehoodOrder: 6},
    {StateName: "Michigan", Abbreviation: "MI", Capital: "Lansing", StatehoodYear: 1837, StatehoodOrder: 26},
    {StateName: "Minnesota", Abbreviation: "MN", Capital: "St. Paul", StatehoodYear: 1858, StatehoodOrder: 32},
    {StateName: "Mississippi", Abbreviation: "MS", Capital: "Jackson", StatehoodYear: 1817, StatehoodOrder: 20},
    {StateName: "Missouri", Abbreviation: "MO", Capital: "Jefferson City", StatehoodYear: 1821, StatehoodOrder: 24},
    {StateName: "Montana", Abbreviation: "MT", Capital: "Helena", StatehoodYear: 1889, StatehoodOrder: 41},
    {StateName: "Nebraska", Abbreviation: "NE", Capital: "Lincoln", StatehoodYear: 1867, StatehoodOrder: 37},
    {StateName: "Nevada", Abbreviation: "NV", Capital: "Carson City", StatehoodYear: 1864, StatehoodOrder: 36},
    {StateName: "New Hampshire", Abbreviation: "NH", Capital: "Concord", StatehoodYear: 1788, StatehoodOrder: 9},
    {StateName: "New Jersey", Abbreviation: "NJ", Capital: "Trenton", StatehoodYear: 1787, StatehoodOrder: 3},
    {StateName: "New Mexico", Abbreviation: "NM", Capital: "Santa Fe", StatehoodYear: 1912, StatehoodOrder: 47},
    {StateName: "New York", Abbreviation: "NY", Capital: "Albany", StatehoodYear: 1788, StatehoodOrder: 11},
    {StateName: "North Carolina", Abbreviation: "NC", Capital: "Raleigh", StatehoodYear: 1789, StatehoodOrder: 12},
    {StateName: "North Dakota", Abbreviation: "ND", Capital: "Bismarck", StatehoodYear: 1889, StatehoodOrder: 39},
    {StateName: "Ohio", Abbreviation: "OH", Capital: "Columbus", StatehoodYear: 1803, StatehoodOrder: 17},
    {StateName: "Oklahoma", Abbreviation: "OK", Capital: "Oklahoma City", StatehoodYear: 1907, StatehoodOrder: 46},
    {StateName: "Oregon", Abbreviation: "OR", Capital: "Salem", StatehoodYear: 1859, StatehoodOrder: 33},
    {StateName: "Pennsylvania", Abbreviation: "PA", Capital: "Harrisburg", StatehoodYear: 1787, StatehoodOrder: 2},
    {StateName: "Rhode Island", Abbreviation: "RI", Capital: "Providence", StatehoodYear: 1790, StatehoodOrder: 13},
    {StateName: "South Carolina", Abbreviation: "SC", Capital: "Columbia", StatehoodYear: 1788, StatehoodOrder: 8},
    {StateName: "South Dakota", Abbreviation: "SD", Capital: "Pierre", StatehoodYear: 1889, StatehoodOrder: 40},
    {StateName: "Tennessee", Abbreviation: "TN", Capital: "Nashville", StatehoodYear: 1796, StatehoodOrder: 16},
    {StateName: "Texas", Abbreviation: "TX", Capital: "Austin", StatehoodYear: 1845, StatehoodOrder: 28},
    {StateName: "Utah", Abbreviation: "UT", Capital: "Salt Lake City", StatehoodYear: 1896, StatehoodOrder: 45},
    {StateName: "Vermont", Abbreviation: "VT", Capital: "Montpelier", StatehoodYear: 1791, StatehoodOrder: 14},
    {StateName: "Virginia", Abbreviation: "VA", Capital: "Richmond", StatehoodYear: 1788, StatehoodOrder: 10},
    {StateName: "Washington", Abbreviation: "WA", Capital: "Olympia", StatehoodYear: 1889, StatehoodOrder: 42},
    {StateName: "West Virginia", Abbreviation: "WV", Capital: "Charleston", StatehoodYear: 1863, StatehoodOrder: 35},
    {StateName: "Wisconsin", Abbreviation: "WI", Capital: "Madison", StatehoodYear: 1848, StatehoodOrder: 30},
    {StateName: "Wyoming", Abbreviation: "WY", Capital: "Cheyenne", StatehoodYear: 1890, StatehoodOrder: 44}
];

//=========================================================================================================================================
//Editing anything below this line might break your skill.  
//=========================================================================================================================================

var counter = 0;

var states = {
    START: "_START",
    MOVIE: "_MOVIE"
};

const handlers = {
    "LaunchRequest": function () {
        this.handler.state = states.START;
        this.emitWithState("Start");
    },
    "MovieIntent": function () {
        this.handler.state = states.MOVIE;
        this.emitWithState("WhichMovie");
    },
    "MovieRepeatIntent": function () {
        this.handler.state = states.MOVIE;
        this.emitWithState("Movie");
    },
    "Unhandled": function () {
        console.log("Core unhandled intent is getting triggered");
        this.handler.state = states.START;
        this.emitWithState("Start");
    }
};

var startHandlers = Alexa.CreateStateHandler(states.START, {
    "Start": function () {
        this.emit(":tell", WELCOME_MESSAGE, HELP_MESSAGE);
    },
    "AMAZON.StopIntent": function () {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.HelpIntent": function () {
        this.emit(":ask", HELP_MESSAGE, HELP_MESSAGE);
    },
    "Unhandled": function () {
        console.log("Unhandled within startHandler is getting invoked");
        this.emitWithState("Start");
    }
});


var movieHandlers = Alexa.CreateStateHandler(states.MOVIE, {
    "Movie": function () {
        this.emitWithState("MovieRepeatIntent");
    },
    "WhichMovie": function () {
        this.emit(":ask", "Which video would you like me to play?");
    },
    "MovieRepeatIntent": function () {
        var movieName = this.event.request.intent.slots['movie'].value;
        console.log(movieName);
        this.emit(":tell", "The movie is " + movieName);
    },
    "AMAZON.StartOverIntent": function () {
        this.emitWithState("Movie");
    },
    "AMAZON.StopIntent": function () {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.HelpIntent": function () {
        this.emit(":ask", HELP_MESSAGE, HELP_MESSAGE);
    },
    "Unhandled": function () {
        console.log("Unhandled within Movie state");
        this.emitWithState("WhichMovie");
    }
});

function formatCasing(key) {
    key = key.split(/(?=[A-Z])/).join(" ");
    return key;
}

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, movieHandlers);
    alexa.execute();
};

