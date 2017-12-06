define("config", function() {

    //Header image (left side)
    var LEFT_HEADER_IMG = "img/CDSA_Slide_50.png";

    //Header image (right side)
    var RIGHT_HEADER_IMG = "http://cancer.digitalslidearchive.net/imgs/Winship_06-2011/Winship_NCI_shortTag/horizontal/jpg_png/Winship_NCI_shortTag_hz_280.png";

    //Specify the BASE API URL
    var BASE_URL = "http://winshipdev.digitalslidearchive.emory.edu:8080/api/v1"; // WORKS!
    //    var BASE_URL = "http://candygram.neurology.emory.edu:8080/api/v1";

    //What is the collection name we are pulling data from?
    var COLLECTION_NAME = "WinshipDSADev";

    //which endpoints do we wanna use? TCGA or Girder default endpoints
    UI = "tcga";


    //Do you want to include 3rd dropdown menu for the folders?
    //ONLY APPLIES FOR THE STANDARD UI
    var THIRD_MENU = true;
    var THIRD_MENU = false;


    /*TO DO: MOVE PLUGIN DESCRIPTION TO HERE */


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
        UI: UI,
        LEFT_HEADER_IMG: LEFT_HEADER_IMG,
        RIGHT_HEADER_IMG: RIGHT_HEADER_IMG,
        THIRD_MENU: THIRD_MENU
    }
});