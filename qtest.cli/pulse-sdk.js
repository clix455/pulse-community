const Constants = require(`${process.env.APPDATA}\\TRICENTIS\\qTest\\pulse-constants.json`)

class Trigger{
    constructor(name){
        this.name = name;
    }
}

const triggers = [
    new Trigger('Hello'),
    new Trigger('CreateJob')
];


class Webhooks {
    constructor() { }
    invoke(trigger, body) {
        const bot = require(`./${trigger.name}`);
        bot.handler(
            {
                constants: Constants,
                event: body,
                triggers: triggers
            });
    }
}

module.exports = {
    Webhooks: Webhooks,
    Constants: Constants,
    Triggers: triggers
};