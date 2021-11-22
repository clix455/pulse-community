const { date } = require('assert-plus');
const { Webhooks } = require('./pulse-sdk');

/**
 * trigger name: ChatOpsEvent
 * call source: other Pulse Actions via emitEvent()
 * payload example:
 *   {
 *     "message": "insert message contents here"
 *   }
 * constants example:
 *  ChatOpsWebhook: https://hooks.slack.com/services/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
 * outputs: the "message" object in the payload will be sent to a configured Slack webhook
 * prerequisites: configured webhook connector for Slack
 * external documentation: https://api.slack.com/incoming-webhooks 
 */
exports.handler = async function ({ event: body, constants, triggers }, context, callback) {
    function emitEvent(name, payload) {
        let t = triggers.find(t => t.name === name);
        if (t !== undefined) {
            return new Webhooks().invoke(t, payload);
        }
    }
    emitEvent('Hello', { text: 'hello slack, this is Hello bot!' });
    messageSlack(body, constants);
}

function messageSlack(body, constants) {
    var str = body;
    //console.log(str.message);

    var request = require('request');
    var slack_webhook = constants.ChatOpsWebhook;

    //console.log('About to request slack webhook: ', slack_webhook);

    let modulePath = require.resolve('request');
    console.log("request path:", modulePath);
    request({
        uri: slack_webhook,
        method: 'POST',
        json: body
    }, function (error, response, body) { }
    );
}