/*
 * trigger name: UpdateQTestWithResults
 * call source: any and all Result Parser rules via emitEvent()
 * payload example:
        {
          "projectId": "5",
          "testcycle": "555555",
          "logs": [
            {
              "status": "passed",
              "name": "Test 1 Name",
              "attachments": [],
              "exe_start_date": "2020-10-30T14:56:22.357Z",
              "exe_end_date": "2020-10-30T14:56:22.357Z",
              "automation_content": "uniquely identfied string",
              "module_names": [
                "TEST CYCLE FOLDER NAME"
              ],
              "test_step_logs": [
                {
                  "description": "Step 1 description",
                  "expected_result": "Step 1 expected",
                  "actual_result": "Step 1 result",
                  "order": 1,
                  "status": "passed"
                },
                {
                  "description": "Step 2 description",
                  "expected_result": "Step 2 expected",
                  "actual_result": "Step 2 result",
                  "order": 2,
                  "status": "passed"
                },
                {
                  "description": "Step 3 description",
                  "expected_result": "Step 3 expected",
                  "actual_result": "Step 3 result",
                  "order": 3,
                  "status": "passed"
                }
                }
              ]
            }
          ]
        }
 * constants:
 *  QTEST_TOKEN: the qTest user bearer token from the API/SDK section of the 'Resources' area
        Ex. 02e74731-2f6e-4b95-b928-1596a68881e2
 *  Manager_URL: the base qTest Manager domain with no protocol information, https is expected by the script
        Ex. demo.qtestnet.com
 * outputs: standardized construct to be consumed by the qTest auto-test-logs API
 * external documentation: https://api.qasymphony.com/#/test-log/submitAutomationTestLogs2
 * Pulse events called: ChatOpsEvent
 */

const request = require('request');
const Debug_constants =
{
  QTEST_TOKEN: "270837e0-5857-4216-ba9e-8a5097cb3424",
  ManagerURL: "apacpso.qtestnet.com",
  ProjectID: 23464,
  ParentId: 221566,
  ParentType: "test-cycle"
}

exports.handler = function ({ event, constants, triggers }, context, callback) {

}


function CreateJobFromParent(event, constants) {
  let baseRequest = request.defaults({
    baseUrl: `https://${constants.ManagerURL}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${constants.QTEST_TOKEN}`
    }
  });

  baseRequest.get(
    {
      url: `api/v3/projects/${constants.ProjectID}/test-runs?parentId=${constants.ParentId}&parentType=${constants.ParentType}`,
      json: true
    },
    function (error, response, body) {
      if (error) {
        console.log(error);
        Promise.reject(error);
      }

      if (response.statusCode !== 200) {
        console.log('[ERROR]: ' + body.message);
        return;
      }

      let testRuns = body.items.map(i => i.id);

      if(testRuns.length === 0){
        console.log(`[Error] No test runs found under ${constants.ParentType}: ${constants.ParentId}`);
        return;
      }
      console.log("The following test runs will be executed.");
      console.log(testRuns);
      let payload = event;
      payload.testRunIds = testRuns;

      let opts = {
        url: '/api/v3/automation/jobs/schedule/create',
        json: true,
        body: payload
      };

      baseRequest.post(opts,
        function (error, response, resbody) {
          if (error) {
            Promise.reject(error);
            console.log(error);
          }
          else {
            if (response.statusCode === 201) {
              Promise.resolve('Launch job queued successfully.');
              console.log("Triggered launch job: " + JSON.stringify(resbody));
              return response;
            }
            else {
              console.log('[ERROR]: ' + resbody.message);
            }
          }
        }
      );
    }
  );
}

let postBody = {
  "clientId": 262552,
  "name": "Post Man Trigger",
  "agentId": 4465,
  "startDate": "2021-11-09T12:28:58.033Z",
  "creator": 262552,
  "projectId": Debug_constants.ProjectID,
  "testRunIds": [
    3122944,
    3147878
  ],
  "dynamic": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
CreateJobFromParent(postBody, Debug_constants);

