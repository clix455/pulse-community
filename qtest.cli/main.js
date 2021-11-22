const slackBot = require('./SlackMessage');

const { Constants, Triggers } = require('./pulse-sdk');

slackBot.handler(
    {
        constants: Constants,
        event: { text: `hello from Main debug JS at ${new Date()}` },
        triggers: Triggers
    });