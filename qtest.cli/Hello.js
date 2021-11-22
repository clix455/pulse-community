
exports.handler = async function ({ event: body, constants, triggers }, context, callback) {
    console.log(body.text);
}