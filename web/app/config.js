define("config", function() {

    //Specify the BASE API URL
    var BASE_URL = "http://digitalslidearchive.emory.edu:8080/api/v1";

    //What is the collection name we are pulling data from?
    var COLLECTION_NAME = "ADRC";

    //which endpoints do we wanna use? TCGA or Girder default endpoints
    UI = "standard";

    ENDPOINTS = {
        standard: {
            item: BASE_URL + "/item/{ID}"
        },
        tcga: {
            item: BASE_URL + "/tcga/image/{ID}"
        }
    }

    return {
        BASE_URL: BASE_URL,
        COLLECTION_NAME: COLLECTION_NAME,
        ENDPOINTS: ENDPOINTS[UI],
        UI: UI
    }
});
