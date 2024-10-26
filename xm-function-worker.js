module.exports = async function(context) {
  
    requestData = '{"contacts": []}'
    const date = new Date()
    const directoryId = 'POOL_22Q4IEXAMPLEnRw9N';
    
    // Form Data formatting
    const eventId = context.arguments.formData.eventId;
    const emails = context.arguments.formData.email.replace(/"/g, '').replace('[', '').replace(']', '');
    const sensorNames = context.arguments.formData.sensorNames.replace(/"/g, '').replace('[', '').replace(']', '');
    
    // Create Mailing List first
    
    context.client.log('info', "=====Create ML Start=====");
    try{
      // Create body for request
      createMailingListBody = JSON.parse(`{"name": "${eventId}"}`);

      const createMailingListResponse = await context.client.qualtricsApiFetch(`directories/${directoryId}/mailinglists`, {
        method: 'POST',
        body: createMailingListBody
      });
      
      context.client.log('info', "=====Create ML Response=====");
      context.client.log('info', JSON.stringify(createMailingListResponse.responseData));
      
      // Set the mailing List ID as the newly created one
      const mailingListId = createMailingListResponse.responseData.result.id;
      
      // Only execute if we got a 200 from mailing list creation
      if(createMailingListResponse.status == 200) {
        var emailArray = emails.split(',');
        var sensorArray = sensorNames.split(',');
        
        var jsonObj = JSON.parse(requestData);
        // Build the JSON for batch import
        emailArray.forEach(function (email, index) {
          jsonObj['contacts'].push(
            {
              "refId": email,
              "email": email,
              "transactions": [
                {
                  "refId": "new_transaction"+index,
                  "transactionDate": date,
                  "data": {"sensorNames": context.arguments.formData.sensorNames, "detailedDate": date},
                  "contactListId": mailingListId,
                  "enrichments": []
                }
              ],
              "listMemberships": [
                {
                  "refId": "list"+index,
                  "listId": mailingListId,
                  "unsubscribed": false
                }
              ]
            });
        });
        // End building JSON for batch import
        // Send request to batch import
        const postBatchResponse = await context.client.qualtricsApiFetch(`directories/${directoryId}/imports`, {
          method: 'POST',
          body: jsonObj
        });
      }

      return {
        workerStatus: createMailingListResponse.status, 
        mailingList: mailingListId
      }
    } catch (error) {
      return {
        data: "There was an Error creating the mailing list", 
        message: JSON.stringify(error)
      }
    };
    
    
    // mailingListId = 'CG_3QPNavbsdo9YB';
    // Format email list provided 
    // Expected "["email", "email"]" (enclosing double quotes are added by xm function args)



    var emailArray = emails.split(',');
    var sensorArray = sensorNames.split(',');
    
    var jsonObj = JSON.parse(requestData);
    emailArray.forEach(function (email, index) {
      jsonObj['contacts'].push(
        {
          "refId": email,
          "email": email,
          "transactions": [
            {
              "refId": "new_transaction"+index,
              "transactionDate": date,
              "data": {"sensorNames": context.arguments.formData.sensorNames, "detailedDate": date},
              "contactListId": mailingListId,
              "enrichments": []
            }
          ],
          "listMemberships": [
            {
              "refId": "list"+index,
              "listId": mailingListId,
              "unsubscribed": false
            }
          ]
        });
    
    });
    
    // Just for debug logging
    //jsonStr = JSON.stringify(jsonObj);
    // sensorStr = sensorNames.toString();
    // context.client.log('info', "=====Sensor String=====");
    // context.client.log('info', sensorStr);
    // Regular Fetch [working]
    // try{
    //   const response = await context.client.fetch('https://ca1.qualtrics.com/API/v3/directories/POOL_22Q4I9exampleRw9N/imports', 
    //     {
    //       method: 'POST',
    //       connection: {
    //         connectionName: 'Qualtrics API Key',
    //         paramFormat: 'header',
    //         paramTemplate: '%s',
    //         paramName: 'X-API-TOKEN'
    //       },
    //       body: jsonObj
    //     });
    //   return {
    //     response: response,
    //     jsonString: jsonStr
    //   }
    // } catch (error) {
    //   return {
    //     data: "There was an Error",
    //     message: error
    //   }
    // };


    //Qualtrics Fetch API
    try{
      const postBatchResponse = await context.client.qualtricsApiFetch(`directories/${directoryId}/imports`, {
        method: 'POST',
        body: jsonObj
      });
      return {
        jsonObject: jsonObj,
        status: postBatchResponse,
        data: postBatchResponse.responseData
      }
    } catch (error) {
      return {
        data: "There was an Error", 
        parameters: context.availableConnections,
        message: error
      }
    };
  
};
