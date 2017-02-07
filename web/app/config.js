/* config.js

Description:
	This module contains all the basic app configurations.

Dependencies:
	None

Return:
	- BASE_URL: URL to the Girder API
	- COLLECTION_NAME: Girder collection name to pull data from
 */

define("config", function() {

    //What is the collection name we are pulling data from?
    var COLLECTION_NAME = "ADRC";

    //which endpoints do we wanna use? TCGA or Girder default endpoints
    ENDPOINTS = "tcga";

    //Specify the BASE API URL
    //var BASE_URL = "http://candygram.neurology.emory.edu:8080/api/v1";
    var BASE_URL = "https://girder.neuro.emory.edu:443/api/v1";
    
    return {
        BASE_URL: BASE_URL,
        COLLECTION_NAME: COLLECTION_NAME,
        ENDPOINTS: ENDPOINTS
    }
});