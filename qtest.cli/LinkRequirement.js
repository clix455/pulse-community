
const request = require('request');
const axios = require('axios');

const Debug_constants =
{
    QTEST_TOKEN: "cd3397da-6153-40c7-8185-a33566701e6a",
    ManagerURL: "demo.qtestnet.com",
    ProjectID: 108764,
    Webhooks: ""
}
const constants = Debug_constants


const instance = axios.create({
    baseURL: `https://${constants.ManagerURL}/api/v3`,
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${constants.QTEST_TOKEN}`
    }
});

function getHeaders(constants) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${constants.QTEST_TOKEN}`
    }
}

//
// Expects the payload to look like this
// {
//   tcid: 12345,
//   issueKey: 'AI-123'
// }
//
exports.handler = function ({ event: body, constants, triggers }, context, callback) {
    const { Webhooks } = require('@qasymphony/pulse-sdk');
    function emitEvent(name, payload) {
        let t = triggers.find(t => t.name === name);
        return t && new Webhooks().invoke(t, payload);
    }

    var standardHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${constants.QTEST_TOKEN}`
    }

    var reqopts = getReqBody(body.issueKey);
    request.post(reqopts, function (err, response, reqResBody) {

        if (err) {
            emitEvent('ChatOpsEvent', { Error: "Problem getting requirement: " + err });
        }
        else {
            if (reqResBody.items.length === 0)
                return;

            var reqid = reqResBody.items[0].id;
            var linkopts = getLinkBody(reqid, body.tcid);

            request.post(linkopts, function (optserr, optsresponse, resbody) {
                if (optserr) {
                    emitEvent('ChatOpsEvent', { message: "Problem creating test link to requirement: " + err });
                }
                else {
                    // Success, we added a link!
                    emitEvent('ChatOpsEvent', { message: "link added for TC: " + body.tcid + " to requirement " + body.issueKey });
                }
            });
        }
    });
}


function getReqBody(key) {
    return {
        url: `https://${constants.ManagerURL}/api/v3/projects/${constants.ProjectID}/search`,
        json: true,
        headers: getHeaders(Debug_constants),
        body: {
            "object_type": "requirements",
            "fields": [
                "*"
            ],
            "query": "Name ~ '" + key + "'"
        }
    };
}

function linkTestCaseToRequirement(requirementId, testCaseId) {

    instance.get("/projects/108764/requirements/25617690")
    .then(({data}) => {
        console.log(data);
        instance.post(`projects/${constants.ProjectID}/requirements/${requirementId}/link?type=test-cases`, [
            testCaseId
        ]).then((response) =>{
            console.log(response.status);
        });
    })
    .catch((any) => {
        console.log(any.message);
    });
    //axios(getLinkBody(requirementId, testCaseId));
}

function getLinkBody(reqid, tcid) {
    return {
        url: `https://${constants.ManagerURL}/api/v3/projects/${constants.ProjectID}/requirements/${reqid}/link?type=test-cases`,
        method: 'post',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${constants.QTEST_TOKEN}`
        },
        body: [
            tcid
        ]
    };
}

//console.log(getLinkBody(25617690, 51706166));
linkTestCaseToRequirement(25617690, 51706166);