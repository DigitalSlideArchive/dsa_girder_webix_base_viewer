// define("config", function() {
define(function() {
    //Header image (left side)
     url_prefix = "http://"

//    var LEFT_HEADER_IMG = url_prefix + "img/CDSA_Slide_50.png";
	var LEFT_HEADER_IMG = ""
    if (location.protocol == 'https:') {
        url_prefix = "https:";
    } else { url_prefix = "http"; }

    //Header image (right side)

 //   var RIGHT_HEADER_IMG = url_prefix + "/img/Winship_NCI_shortTag_hz_280.jpg";
	var RIGHT_HEADER_IMG = ""
    //8080 is not needed if I am using the nginx proxy
    // //Specify the BASE API URL
    var BASE_URL =  "http://computablebrain.emory.edu:8080/api/v1";
    var BASE_URL =  "http://winship.digitalslidearchive.emory.edu:8080/api/v1";

    // //What is the collection name we are pulling data from?
    var COLLECTION_NAME = 'TPS_BioBank'


    //which endpoints do we wanna use? TCGA or Girder default endpoints
    var UI = "standard"; //or standard
    var SLIDE_SELECTOR = "table";
    var SLIDE_SELECTOR = "thumbnails"
    var VIRTUAL = true;

    ENDPOINTS = {
        standard: {
            item: BASE_URL + "/item/{ID}"
        },
        tcga: {
            item: BASE_URL + "/tcga/image/{ID}"
        }
    }

    /* Set which modules we want to load on start up */

    /* aperio:  Enables loading XML files generated by Aperio Scanscope
       filters: Adds a window to allow brightness/contrast/hue to be modified */

    MODULE_CONFIG = {
        "aperio": false,
        "filters": true,
        "pathology": false,
        "annotations": false,
        "tagger": false,
        "zoomButtons": false,
        "metadata": false
    };

    // tags for tagger. Tags should be found in the tags dictionary in slide metadata
    TAGS = {
        "BrainID": new Array(),
        "Stain": new Array(),
        "StainDate": new Array(),
        "Section": new Array(),
        "Hemi": new Array(),
        "Column": new Array()
    };

    //TAGS = {}
    // collection name containing the schema folder
    // set to false if schema is not needed
    var SCHEMA_COLLECTION_NAME = ".ProjectMetadata";

    return {
        BASE_URL: BASE_URL,
        COLLECTION_NAME: COLLECTION_NAME,
        ENDPOINTS: ENDPOINTS[UI],
        UI: UI,
        SLIDE_SELECTOR: SLIDE_SELECTOR,
        LEFT_HEADER_IMG: LEFT_HEADER_IMG,
        RIGHT_HEADER_IMG: RIGHT_HEADER_IMG,
        SCHEMA_COLLECTION_NAME: SCHEMA_COLLECTION_NAME,
        MODULE_CONFIG: MODULE_CONFIG,
        TAGS: TAGS,
        VIRTUAL: VIRTUAL,
        SLIDELABELTEMPLATE: "#name#"
    }
});
